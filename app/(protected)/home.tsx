import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Clock, Waves, Drop } from 'phosphor-react-native';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Box,
  Text,
  ScrollView,
  Image,
  Spinner,
} from '@gluestack-ui/themed';

import { BottomNavBar } from '@/components/BottomNavBar';
import { FAB } from '@/components/FAB';
import { analyzeImage, type AnalysisResult } from '@/services/imageAnalysis';
import { presentError } from '@/services/errorService';
import { getPhotoImage } from '../../services/imageDataService';
import { moderateScale } from '@/styles/sizing';

const CONTAINER_PADDING = 20;
const ITEM_WIDTH = 108;

const CIRCLE_RADIUS = 40;

const placeholderMacros = [
  { amount: '--', type: 'Last Poop', icon: Clock, color: '#d1d5db', progress: 0 },
  { amount: '--', type: 'Appearance', icon: Waves, color: '#d1d5db', progress: 0 },
  { amount: '--', type: 'Texture', icon: Drop, color: '#d1d5db', progress: 0 },
];

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

const colorToRingColorMap: { [key: string]: string } = {
  brown: '#a26235',
  green: '#22c55e',
  yellow: '#facc15',
  red: '#ef4444',
  black: '#111',
  pale: '#d1d5db',
};

const getTextureProgress = (appearance?: string): number => {
  if (!appearance) return 0;
  const map: { [key: string]: number } = { solid: 95, soft: 85, squishy: 75, hard: 50, loose: 40, mushy: 30, pebbly: 20 };
  return map[appearance.toLowerCase()] || 50;
};

const getAppearanceProgress = (color?: string): number => {
  if (!color) return 0;
  const map: { [key:string]: number } = { brown: 95, green: 70, yellow: 60, pale: 30, red: 20, black: 10 };
  return map[color.toLowerCase()] || 50;
};

const getTimeProgress = (hours: number | null): number => {
  if (hours === null) return 0;
  if (hours < 1) return 95;
  if (hours <= 6) return 80;
  if (hours <= 12) return 60;
  if (hours <= 24) return 40;
  return 20;
};

const getTimeOfDayFromTimestamp = (timestamp: string) => {
  const hour = new Date(timestamp).getHours();
  if (hour < 12) return 'Morning Poop';
  if (hour < 18) return 'Afternoon Poop';
  return 'Evening Poop';
};

const mapAppearanceToBristol = (appearance?: string): number => {
  switch (appearance) {
    case 'pebbly': return 1;
    case 'hard': return 2;
    case 'solid': return 4;
    case 'soft': case 'squishy': return 5;
    case 'loose': case 'mushy': return 6;
    default: return 4;
  }
};

const bristolImageMap: { [key: number]: any } = {
  1: require('@/assets/images/type_1.png'),
  2: require('@/assets/images/type_2.png'),
  3: require('@/assets/images/type_3.png'),
  4: require('@/assets/images/type_4.png'),
  5: require('@/assets/images/type_5.png'),
  6: require('@/assets/images/type_6.png'),
  7: require('@/assets/images/type_7.png'),
};

const LAST_POOP_TIMESTAMP_KEY = 'last_poop_timestamp';
const POOP_LOGS_KEY = 'poop_logs';

const loadingMessages = [
  "Analyzing digestive output...",
  "Detecting stool composition...",
  "Reviewing gut health indicators...",
  "Scanning stool appearance and color...",
  "Preparing gut health summary...",
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResult | null>(null);
  const [allLogs, setAllLogs] = useState<(AnalysisResult & { timestamp: string })[]>([]);
  const [timeAgo, setTimeAgo] = useState('Just now');
  const [hoursSinceLastPoop, setHoursSinceLastPoop] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadDataOnFocus = async () => {
        const logsString = await AsyncStorage.getItem(POOP_LOGS_KEY);
        const logs = logsString ? (JSON.parse(logsString) as (AnalysisResult & { timestamp: string })[]) : [];
        if (logs.length > 0) {
          setAllLogs(logs);
          setLatestAnalysis(logs[logs.length - 1]);
        }
        
        const timestamp = await AsyncStorage.getItem(LAST_POOP_TIMESTAMP_KEY);
        if (timestamp) {
          const lastPoopDate = new Date(timestamp);
          const now = new Date();
          const hoursDiff = Math.round(Math.abs(now.getTime() - lastPoopDate.getTime()) / 36e5);
          setHoursSinceLastPoop(hoursDiff);

          if (hoursDiff < 1) {
            setTimeAgo('Just now');
          } else if (hoursDiff === 1) {
            setTimeAgo('1 hr ago');
          } else {
            setTimeAgo(`${hoursDiff} hrs ago`);
          }
        }
        
        const newImageBase64 = getPhotoImage();
        if (newImageBase64) {
          await handleNewImage(newImageBase64);
        }
      };

      void loadDataOnFocus();
    }, [])
  );

  const handleNewImage = async (base64: string) => {
    setIsLoading(true);
    let messageIndex = 0;
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
    }, 1500);

    try {
      const result = await analyzeImage(base64);
      if (result.success && result.data) {
        const timestamp = new Date().toISOString();
        const newLog = { ...result.data, timestamp };

        setLatestAnalysis(newLog);
        setAllLogs(prevLogs => [...prevLogs, newLog]);
        setTimeAgo('Just now');
        setHoursSinceLastPoop(0);

        const logsString = await AsyncStorage.getItem(POOP_LOGS_KEY);
        const logs = logsString ? JSON.parse(logsString) : [];
        logs.push(newLog);
        await AsyncStorage.setItem(POOP_LOGS_KEY, JSON.stringify(logs));
        await AsyncStorage.setItem(LAST_POOP_TIMESTAMP_KEY, timestamp);
      } else {
        presentError(result.error);
      }
    } catch (error) {
      presentError(error);
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  return (
    <Box flex={1} backgroundColor="$background">
      <Box flex={1}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 100,
          }}
        >
          <Text
            fontWeight="$bold"
            color="$primaryText"
            sx={{ fontSize: moderateScale(20) }}
          >
            Latest Analysis
          </Text>

          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            backgroundColor="$cardBackground"
            borderRadius={18}
            padding={20}
            marginTop={16}
            minHeight={140}
            sx={{
              _ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.08,
                shadowRadius: 14,
              },
            }}
          >
            {isLoading ? (
              <Box
                flex={1}
                justifyContent="center"
                alignItems="center"
                padding={20}
              >
                <Spinner size="large" color="$primary" />
                <Text
                  marginTop={12}
                  color="$primaryText"
                  sx={{ fontSize: moderateScale(16) }}
                >
                  {loadingMessage}
                </Text>
              </Box>
            ) : latestAnalysis ? (
              <>
                <Box>
                  <Text
                    fontWeight="$bold"
                    color="$primary"
                    sx={{ fontSize: moderateScale(52) }}
                  >
                    {latestAnalysis.health_score}%
                  </Text>
                  <Text
                    fontWeight="$medium"
                    color="$secondaryText"
                    sx={{ fontSize: moderateScale(15) }}
                  >
                    Gut Health Score
                  </Text>
                </Box>
                <Box
                  width={100}
                  height={100}
                  position="relative"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Svg
                    width={96}
                    height={96}
                    style={{ transform: [{ rotate: '-90deg' }] }}
                  >
                    <Circle
                      cx={48}
                      cy={48}
                      r={CIRCLE_RADIUS}
                      stroke="#e5e7eb"
                      strokeWidth={8}
                      fill="none"
                    />
                    <Circle
                      cx={48}
                      cy={48}
                      r={CIRCLE_RADIUS}
                      stroke="#a26235"
                      strokeWidth={8}
                      strokeDasharray={2 * Math.PI * CIRCLE_RADIUS}
                      strokeDashoffset={
                        2 *
                        Math.PI *
                        CIRCLE_RADIUS *
                        (1 - latestAnalysis.health_score / 100)
                      }
                      strokeLinecap="round"
                      fill="none"
                    />
                  </Svg>
                  <Box
                    position="absolute"
                    top={0}
                    bottom={0}
                    left={0}
                    right={0}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Image
                      source={require('@/assets/images/poop.png')}
                      alt="Poop emoji"
                      sx={{ width: 34, height: 34 }}
                    />
                  </Box>
                </Box>
              </>
            ) : (
              <Box flex={1} alignItems="center">
                <Text
                  fontWeight="$bold"
                  color="$primaryText"
                  marginBottom={8}
                  textAlign="center"
                  sx={{ fontSize: moderateScale(18) }}
                >
                  No analysis yet.
                </Text>
                <Text color="$secondaryText" textAlign="center" sx={{ fontSize: moderateScale(14) }}>
                  Tap the [+] button to analyze your first stool.
                </Text>
              </Box>
            )}
          </Box>

          {/* Macros Scroll */}
          <Box marginTop={16}>
            <Box flexDirection="row" justifyContent="space-between">
              {(latestAnalysis
                ? [
                    { amount: timeAgo, type: 'Last Poop', icon: Clock, color: '#ef4444', progress: getTimeProgress(hoursSinceLastPoop) },
                    { amount: capitalize(latestAnalysis.appearance), type: 'Texture', icon: Waves, color: '#f97316', progress: getTextureProgress(latestAnalysis.appearance) },
                    { amount: capitalize(latestAnalysis.color), type: 'Appearance', icon: Drop, color: colorToRingColorMap[latestAnalysis.color?.toLowerCase() || ''] || '#3b82f6', progress: getAppearanceProgress(latestAnalysis.color) },
                  ]
                : placeholderMacros
              ).map((macro, idx) => {
                const Icon = macro.icon;
                return (
                  <Box
                    key={idx}
                    width={108}
                    backgroundColor="$cardBackground"
                    borderRadius={18}
                    padding={16}
                    alignItems="center"
                    sx={{
                      _ios: {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.04,
                        shadowRadius: 12,
                      },
                    }}
                  >
                    <Text
                      fontWeight="$bold"
                      color="$primary"
                      sx={{ fontSize: moderateScale(14) }}
                    >
                      {macro.amount}
                    </Text>
                    <Text
                      color="$secondaryText"
                      marginBottom={12}
                      sx={{ fontSize: moderateScale(9) }}
                    >
                      {macro.type}
                    </Text>
                    <Box width={56} height={56} position="relative">
                      <Svg
                        width={56}
                        height={56}
                        style={{ transform: [{ rotate: '-90deg' }] }}
                      >
                        <Circle
                          cx={28}
                          cy={28}
                          r={25}
                          stroke="#e5e7eb"
                          strokeWidth={6}
                          fill="none"
                        />
                        <Circle
                          cx={28}
                          cy={28}
                          r={25}
                          stroke={macro.color}
                          strokeWidth={6}
                          strokeDasharray={2 * Math.PI * 28}
                          strokeDashoffset={
                            2 * Math.PI * 28 * (1 - (macro.progress || 0) / 100)
                          }
                          strokeLinecap="round"
                          fill="none"
                        />
                      </Svg>
                      <Box
                        position="absolute"
                        top={0}
                        bottom={0}
                        left={0}
                        right={0}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Icon size={24} color={macro.color} />
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Recently Logged */}
          <Box marginTop={16}>
            <Text
              fontWeight="$bold"
              color="$primaryText"
              sx={{ fontSize: moderateScale(20) }}
            >
              Log History
            </Text>
            {allLogs.length > 0 ? (
              [...allLogs].reverse().map((log, index) => (
                <Box
                  key={index}
                  flexDirection="row"
                  alignItems="center"
                  backgroundColor="$cardBackground"
                  borderRadius={20}
                  padding={16}
                  marginTop={8}
                  sx={{
                    _ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                    },
                  }}
                >
                  <Image
                    source={bristolImageMap[mapAppearanceToBristol(log.appearance)]}
                    alt={`Bristol stool chart type ${mapAppearanceToBristol(log.appearance)}`}
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: '#f3f4f6',
                    }}
                  />
                  <Box flex={1} marginLeft={12}>
                    <Text
                      fontWeight="$bold"
                      color="$primaryText"
                      sx={{ fontSize: moderateScale(16) }}
                    >
                      {getTimeOfDayFromTimestamp(log.timestamp)}
                    </Text>
                    <Text
                      color="$secondaryText"
                      marginTop={4}
                      sx={{ fontSize: moderateScale(13) }}
                    >
                      {`Health Score: ${log.health_score}%`}
                    </Text>
                  </Box>
                </Box>
              ))
            ) : (
              <Box
                backgroundColor="$emptyCardBackground"
                borderRadius={20}
                padding={24}
                alignItems="center"
                justifyContent="center"
                marginTop={8}
              >
                <Text
                  fontWeight="$bold"
                  color="$primaryText"
                  marginBottom={8}
                  textAlign="center"
                  sx={{ fontSize: moderateScale(18) }}
                >
                  No stools logged yet.
                </Text>
                <Text color="$secondaryText" textAlign="center" sx={{ fontSize: moderateScale(14) }}>
                  Tap the [+] button to get started.
                </Text>
              </Box>
            )}
          </Box>
        </ScrollView>
        <BottomNavBar activeScreen="home" />
        <FAB />
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
}); 