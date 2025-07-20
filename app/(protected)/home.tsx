/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Clock, Waves, Drop } from 'phosphor-react-native';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BottomNavBar } from '@/components/BottomNavBar';
import { themeColors } from '@/styles/theme';
import { FAB } from '@/components/FAB';
import { analyzeImage, type AnalysisResult } from '@/services/imageAnalysis';
import { presentError } from '@/services/errorService';
import { getPhotoImage } from '../../services/imageDataService';

const { width } = Dimensions.get('window');
const CONTAINER_PADDING = 20;
const ITEM_WIDTH = 108;

const CIRCLE_RADIUS = 40;
const MACRO_CARD_WIDTH = 150;
const MACRO_CARD_GAP = 14;

const placeholderMacros = [
  { amount: '--', type: 'Last Poop', icon: Clock, color: themeColors.ringInactive, progress: 0 },
  { amount: '--', type: 'Appearance', icon: Waves, color: themeColors.ringInactive, progress: 0 },
  { amount: '--', type: 'Texture', icon: Drop, color: themeColors.ringInactive, progress: 0 },
];

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

const colorToRingColorMap: { [key: string]: string } = {
  brown: themeColors.primary,
  green: '#22c55e',
  yellow: '#facc15',
  red: themeColors.iconRed,
  black: themeColors.primaryText,
  pale: themeColors.ringInactive,
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

const getTimeOfDay = () => {
  const hour = new Date().getHours();
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

const getTimeOfDayFromTimestamp = (timestamp: string) => {
  const hour = new Date(timestamp).getHours();
  if (hour < 12) return 'Morning Poop';
  if (hour < 18) return 'Afternoon Poop';
  return 'Evening Poop';
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResult | null>(null);
  const [allLogs, setAllLogs] = useState<(AnalysisResult & { timestamp: string })[]>([]);
  const [lastImageUri, setLastImageUri] = useState<string | null>(null);
  const [timeAgo, setTimeAgo] = useState('Just now');
  const [hoursSinceLastPoop, setHoursSinceLastPoop] = useState<number | null>(null);

  const usableWidth = width - insets.left - insets.right - 2 * CONTAINER_PADDING;
  const gap = (usableWidth - 3 * ITEM_WIDTH) / 2;

  useFocusEffect(
    useCallback(() => {
      const loadDataOnFocus = async () => {
        // First, always load the latest state from local storage to prevent flicker.
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
        
        // THEN, check for a new image from the camera service and process it.
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

    const imageUri = `data:image/jpeg;base64,${base64}`;
    setLastImageUri(imageUri);
    try {
      const result = await analyzeImage(base64);
      if (result.success && result.data) {
        const timestamp = new Date().toISOString();
        const newLog = { ...result.data, timestamp };

        // Update state immediately
        setLatestAnalysis(newLog);
        setAllLogs(prevLogs => [...prevLogs, newLog]);
        setTimeAgo('Just now');
        setHoursSinceLastPoop(0);

        // Save to storage
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
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <View style={{ flex: 1 }}>
        {/* Weekly day tracker removed */}

        {/* Body */}
        <ScrollView contentContainerStyle={styles.bodyContent}>
          <Text style={styles.sectionTitle}>Latest Analysis</Text>

          {/* Week Calendar */}
          {/* <WeekCalendar /> */}

          {/* Calories Card */}
          <View style={[styles.calorieCard, !latestAnalysis && { flexDirection: 'column', justifyContent: 'center' }]}>
            {isLoading ? (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={themeColors.primary} />
                <Text style={styles.loadingText}>{loadingMessage}</Text>
              </View>
            ) : latestAnalysis ? (
              <>
                <View>
                  <Text style={styles.calorieValue}>{latestAnalysis.health_score}%</Text>
                  <Text style={styles.calorieLabel}>Gut Health Score</Text>
                </View>
                <View style={styles.calorieRingWrapper}>
                  <Svg width={96} height={96} style={{ transform: [{ rotate: '-90deg' }] }}>
                    <Circle cx={48} cy={48} r={CIRCLE_RADIUS} stroke="#e5e7eb" strokeWidth={8} fill="none" />
                    <Circle
                      cx={48}
                      cy={48}
                      r={CIRCLE_RADIUS}
                      stroke={themeColors.primary}
                      strokeWidth={8}
                      strokeDasharray={2 * Math.PI * CIRCLE_RADIUS}
                      strokeDashoffset={2 * Math.PI * CIRCLE_RADIUS * (1 - latestAnalysis.health_score / 100)}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </Svg>
                  <View style={styles.calorieRingCenter}>
                    <Image source={require('@/assets/images/poop.png')} style={styles.calorieRingIcon} />
                  </View>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.emptyHeader}>No analysis yet</Text>
                <Text style={styles.emptyText}>Tap the [+] button to analyze your first stool.</Text>
              </>
            )}
          </View>

          {/* Macros Scroll */}
          <View style={{ marginTop: 16 }}>
            <View style={styles.macroRow}>
              {(latestAnalysis
                ? [
                    { amount: timeAgo, type: 'Last Poop', icon: Clock, color: '#ef4444', progress: getTimeProgress(hoursSinceLastPoop) },
                    { amount: capitalize(latestAnalysis.appearance), type: 'Texture', icon: Waves, color: '#f97316', progress: getTextureProgress(latestAnalysis.appearance) },
                    { amount: capitalize(latestAnalysis.color), type: 'Appearance', icon: Drop, color: colorToRingColorMap[latestAnalysis.color?.toLowerCase() || ''] || themeColors.iconBlue, progress: getAppearanceProgress(latestAnalysis.color) },
                  ]
                : placeholderMacros
              ).map((macro, idx) => {
                const Icon = macro.icon;
                return (
                  <View key={idx} style={[styles.macroCard, idx < 2 && { marginRight: gap }]}>
                    <Text style={styles.macroAmount}>{macro.amount}</Text>
                    <Text style={styles.macroType}>{macro.type}</Text>
                    <View style={styles.macroRing}>
                      <Svg width={56} height={56} style={{ transform: [{ rotate: '-90deg' }] }}>
                        <Circle cx={28} cy={28} r={25} stroke={themeColors.ringBackground} strokeWidth={6} fill="none" />
                        <Circle
                          cx={28}
                          cy={28}
                          r={25}
                          stroke={macro.color}
                          strokeWidth={6}
                          strokeDasharray={2 * Math.PI * 28}
                          strokeDashoffset={2 * Math.PI * 28 * (1 - (macro.progress || 0) / 100)}
                          strokeLinecap="round"
                          fill="none"
                        />
                      </Svg>
                      <View style={styles.macroIconCenter}>
                        <Icon size={24} color={macro.color} />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

              {/* Indicator removed as horizontal carousel replaced */}
          </View>

          {/* Recently Logged */}
          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionTitle}>Log History</Text>
            {allLogs.length > 0 ? (
              [...allLogs].reverse().map((log, index) => (
                <View key={index} style={styles.recentLogCard}>
                  <Image
                    source={bristolImageMap[mapAppearanceToBristol(log.appearance)]}
                    style={styles.recentLogIcon}
                  />
                  <View style={styles.recentLogTextContainer}>
                    <Text style={styles.recentLogTitle}>{getTimeOfDayFromTimestamp(log.timestamp)}</Text>
                    <Text style={styles.recentLogSubtitle}>{`Health Score: ${log.health_score}%`}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyHeader}>No stools logged yet.</Text>
                <Text style={styles.emptyText}>Tap the [+] button to get started.</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Nav */}
        <BottomNavBar activeScreen="home" />

        {/* FAB */}
        <FAB />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dayContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  dayCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleActive: { borderColor: '#111' },
  dayLetter: { fontSize: 16, color: '#9ca3af' },
  dayNumber: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  dayTextActive: { color: '#111', fontWeight: '600' },
  bodyContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 },
  calorieCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginTop: 16,
    minHeight: 140,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
      },
    }),
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'SFProDisplay-Medium',
    color: themeColors.primaryText,
  },
  calorieValue: { fontSize: 52, fontWeight: '800', color: themeColors.primary,
    fontFamily: 'SFProDisplay-Bold',
  },
  calorieLabel: { fontSize: 15, color: themeColors.secondaryText,
    fontFamily: 'SFProDisplay-Medium',
  },
  calorieRingWrapper: {
    width: 100,
    height: 100,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calorieRingCenter: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calorieRingIcon: {
    width: 34,
    height: 34,
  },
  macroCard: {
    width: 108,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
    }),
  },
  macroAmount: { fontSize: 14, fontWeight: '700', color: themeColors.primary,
    fontFamily: 'SFProDisplay-Bold',
  },
  macroType: { fontSize: 9, color: themeColors.secondaryText, marginBottom: 12,
    fontFamily: 'SFProDisplay-Medium',
  },
  macroRing: { width: 56, height: 56, position: 'relative' },
  macroRow: {
    flexDirection: 'row',
    // Removed extra horizontal padding to align cards with overall layout
    paddingHorizontal: 0,
  },
  macroIconCenter: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorRow: { display: 'none' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: themeColors.primaryText,
    fontFamily: 'SFProDisplay-Bold',
  },
  emptyCard: {
    backgroundColor: themeColors.emptyCardBackground,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  emptyHeader: { fontSize: 18, fontWeight: '600', color: '#111', marginBottom: 8, textAlign: 'center',
    fontFamily: 'SFProDisplay-Bold',
  },
  emptyText: { fontSize: 14, color: '#6b7280', textAlign: 'center',
    fontFamily: 'SFProDisplay-Medium',
  },
  recentLogCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
    }),
  },
  recentLogIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
  },
  recentLogTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  recentLogTitle: {
    fontSize: 16,
    fontFamily: 'SFProDisplay-Bold',
    color: themeColors.primaryText,
  },
  recentLogSubtitle: {
    fontSize: 13,
    fontFamily: 'SFProDisplay-Regular',
    color: themeColors.secondaryText,
    marginTop: 4,
  },
  recentAnalysisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
    }),
  },
  recentImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  recentTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  recentAnalysisType: {
    fontSize: 16,
    fontFamily: 'SFProDisplay-Bold',
    color: themeColors.primaryText,
  },
  recentAnalysisTimestamp: {
    fontSize: 13,
    fontFamily: 'SFProDisplay-Regular',
    color: themeColors.secondaryText,
    marginTop: 4,
  },
  recentAnalysisScore: {
    fontSize: 20,
    fontFamily: 'SFProDisplay-Bold',
    color: themeColors.primary,
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center', // center group horizontally
    paddingVertical: 14,
    paddingRight: 88, // leave room for FAB
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  navItem: { alignItems: 'center', marginHorizontal: 26 },
  navItemActive: { alignItems: 'center', marginHorizontal: 26 },
  navLabel: { fontSize: 12, color: '#9ca3af', marginTop: 4,
    fontFamily: 'SFProDisplay-Regular',
  },
  navLabelActive: { fontSize: 12, color: '#111', marginTop: 4,
    fontFamily: 'SFProDisplay-Regular',
  },
}); 