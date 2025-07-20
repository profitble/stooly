import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { themeColors } from '@/styles/theme';
import { BottomNavBar } from '@/components/BottomNavBar';
import { FAB } from '@/components/FAB';
import { Trash } from 'phosphor-react-native';
import {
  initializeGoals,
  deleteAndQueueReplacement,
  processGoalReplacementQueue,
  type Goal,
} from '../../services/goalService';
import { GutHealthScoreCard } from '@/components/scoreCard';

const POOP_LOGS_KEY = 'poop_logs';

const ActionButton = ({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) => (
  <View style={styles.actionButton}>
    <View style={styles.actionIconContainer}>
      <Text style={styles.actionIcon}>{icon}</Text>
    </View>
    <View style={styles.actionTextContainer}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </View>
  </View>
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
    <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
      <Trash size={24} color="white" />
    </TouchableOpacity>
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
        // Handle both new (`health_score`) and old (`score`) data formats
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
      <View style={styles.container}>
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContentContainer}>
            <View style={styles.bodyContent}>
              <Text style={styles.sectionTitle}>Daily Goals</Text>
              {!hasLogs ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>Complete your first analysis to see your daily goals.</Text>
                </View>
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
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>Great work! Consistency is key. Check back tomorrow for new goals.</Text>
                </View>
              )}
              <View style={{ marginTop: 24 }}>
                <Text style={styles.sectionTitle}>Weekly Progress</Text>
                <GutHealthScoreCard score={weeklyScore} />
              </View>
            </View>
          </ScrollView>
          <BottomNavBar activeScreen="goals" />
          <FAB />
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  scrollContentContainer: {
    paddingBottom: 80,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: themeColors.primaryText,
    fontFamily: 'SFProDisplay-Bold',
    marginBottom: 8,
  },
  emptyCard: {
    backgroundColor: themeColors.cardBackground,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: themeColors.secondaryText,
    textAlign: 'center',
    fontFamily: 'SFProDisplay-Medium',
  },
  actionButton: {
    backgroundColor: themeColors.cardBackground,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: themeColors.emptyCardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeColors.primaryText,
    fontFamily: 'SFProDisplay-Bold',
  },
  actionSubtitle: {
    fontSize: 14,
    color: themeColors.secondaryText,
    marginTop: 4,
    fontFamily: 'SFProDisplay-Regular',
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginTop: 16,
    borderRadius: 18,
  },
});
