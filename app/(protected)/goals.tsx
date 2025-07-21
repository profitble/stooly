import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Box,
  Text,
  ScrollView,
  Pressable,
} from '@gluestack-ui/themed';
import { BottomNavBar } from '@/components/BottomNavBar';
import { FAB } from '@/components/FAB';
import { Trash } from 'phosphor-react-native';
import {
  initializeGoals,
  deleteAndQueueReplacement,
  processGoalReplacementQueue,
  type Goal,
} from '../../services/goalService';
import { GutHealthScoreCard } from '@/components/ScoreCard';
import { moderateScale } from '@/styles/sizing';

const POOP_LOGS_KEY = 'poop_logs';

const ActionButton = ({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) => (
  <Box
    backgroundColor="$cardBackground"
    borderRadius={18}
    padding={16}
    flexDirection="row"
    alignItems="center"
    marginTop={16}
  >
    <Box
      width={50}
      height={50}
      borderRadius={18}
      backgroundColor="$emptyCardBackground"
      justifyContent="center"
      alignItems="center"
      marginRight={16}
    >
      <Text sx={{ fontSize: moderateScale(24) }}>{icon}</Text>
    </Box>
    <Box flex={1}>
      <Text
        fontWeight="$bold"
        color="$primaryText"
        sx={{ fontSize: moderateScale(16) }}
      >
        {title}
      </Text>
      <Text
        color="$secondaryText"
        marginTop={4}
        sx={{ fontSize: moderateScale(14) }}
      >
        {subtitle}
      </Text>
    </Box>
  </Box>
);

const DeletableGoal = ({
  goal,
  onDelete,
  onSwipeableOpen,
}: {
  goal: Goal;
  onDelete: () => void;
  onSwipeableOpen: (ref: Swipeable | null) => void;
}) => {
  const ref = useRef<Swipeable>(null);
  const renderRightActions = () => (
    <Pressable
      onPress={onDelete}
      backgroundColor="red"
      justifyContent="center"
      alignItems="center"
      width={80}
      marginTop={16}
      borderRadius={18}
    >
      <Trash size={24} color="white" />
    </Pressable>
  );

  return (
    <Swipeable
      ref={ref}
      renderRightActions={renderRightActions}
      onSwipeableOpen={() => {
        if (ref.current) {
          onSwipeableOpen(ref.current);
        }
      }}
    >
      <ActionButton icon={goal.icon} title={goal.title} subtitle={goal.subtitle} />
    </Swipeable>
  );
};

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const openSwipeableRef = useRef<Swipeable | null>(null);
  const [weeklyScore, setWeeklyScore] = useState<number | null>(null);
  const [hasLogs, setHasLogs] = useState(false);

  const loadGoals = useCallback(async () => {
    const updatedGoals = await processGoalReplacementQueue();
    setGoals(updatedGoals);
  }, []);

  const loadWeeklyData = useCallback(async () => {
    const logsString = await AsyncStorage.getItem(POOP_LOGS_KEY);
    if (!logsString) {
      setHasLogs(false);
      setWeeklyScore(null);
      return;
    }

    setHasLogs(true);
    const logs = JSON.parse(logsString) as { health_score: number; timestamp: string }[];
    const now = new Date();
    const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    const weeklyLogs = logs.filter(log => new Date(log.timestamp) > oneWeekAgo);

    if (weeklyLogs.length === 0) {
      setWeeklyScore(null);
    } else if (weeklyLogs.length === 1) {
      setWeeklyScore(weeklyLogs[0].health_score);
    } else {
      const totalScore = weeklyLogs.reduce((sum, log) => {
        const score = (log as any).health_score || (log as any).score || 0;
        return sum + score;
      }, 0);
      const average = totalScore / weeklyLogs.length;
      setWeeklyScore(Math.round(average));
    }
  }, []);

  useEffect(() => {
    initializeGoals()
      .then(setGoals)
      .catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadGoals();
      void loadWeeklyData();
    }, [loadGoals, loadWeeklyData])
  );

  const handleDelete = async (goalId: string) => {
    openSwipeableRef.current?.close();
    const newGoals = await deleteAndQueueReplacement(goalId);
    setGoals(newGoals);
  };

  const handleSwipeableOpen = (swipeable: Swipeable | null) => {
    if (openSwipeableRef.current && openSwipeableRef.current !== swipeable) {
      openSwipeableRef.current.close();
    }
    openSwipeableRef.current = swipeable;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Box flex={1} backgroundColor="$background">
        <Box flex={1}>
          <ScrollView
            contentContainerStyle={{
              paddingBottom: 80,
              paddingHorizontal: 20,
              paddingTop: 8,
            }}
          >
            <Box>
              <Text
                fontWeight="$bold"
                color="$primaryText"
                marginBottom={8}
                sx={{ fontSize: moderateScale(20) }}
              >
                Daily Goals
              </Text>
              {!hasLogs ? (
                <Box
                  backgroundColor="$cardBackground"
                  borderRadius={18}
                  padding={24}
                  alignItems="center"
                  justifyContent="center"
                  marginTop={16}
                >
                  <Text
                    color="$secondaryText"
                    textAlign="center"
                    sx={{ fontSize: moderateScale(16) }}
                  >
                    Complete your first analysis to see your daily goals.
                  </Text>
                </Box>
              ) : goals.length > 0 ? (
                goals.map(goal => (
                  <DeletableGoal
                    key={goal.id}
                    goal={goal}
                    onDelete={() => handleDelete(goal.id)}
                    onSwipeableOpen={handleSwipeableOpen}
                  />
                ))
              ) : (
                <Box
                  backgroundColor="$cardBackground"
                  borderRadius={18}
                  padding={24}
                  alignItems="center"
                  justifyContent="center"
                  marginTop={16}
                >
                  <Text
                    color="$secondaryText"
                    textAlign="center"
                    sx={{ fontSize: moderateScale(16) }}
                  >
                    Great work! Consistency is key. Check back tomorrow for new goals.
                  </Text>
                </Box>
              )}
              <Box marginTop={24}>
                <Text
                  fontWeight="$bold"
                  color="$primaryText"
                  marginBottom={8}
                  sx={{ fontSize: moderateScale(20) }}
                >
                  Weekly Progress
                </Text>
                <GutHealthScoreCard score={weeklyScore} />
              </Box>
            </Box>
          </ScrollView>
          <BottomNavBar activeScreen="goals" />
          <FAB />
        </Box>
      </Box>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({});