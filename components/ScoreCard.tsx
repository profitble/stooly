import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { themeColors } from '@/styles/theme';

interface GutHealthScoreCardProps {
  score: number | null;
}

const GRADIENT_COLORS = ['#3b82f6', '#22c55e', '#facc15', '#ef4444'];

const getStatus = (score: number) => {
  if (score < 25) return { text: 'Needs Attention', color: '#3b82f6' };
  if (score < 50) return { text: 'Getting There', color: '#22c55e' };
  if (score < 75) return { text: 'On Track', color: '#facc15' };
  return { text: 'Optimal', color: '#ef4444' };
};

export const GutHealthScoreCard = ({ score }: GutHealthScoreCardProps) => {
  const [containerWidth, setContainerWidth] = useState(0);

  if (score === null) {
    return (
      <View style={[styles.container, styles.emptyState]}>
        <Text style={styles.emptyText}>Waiting for your first analysis of the week.</Text>
      </View>
    );
  }

  const progress = score / 100;
  const status = getStatus(score);
  
  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };
  
  const indicatorPosition = containerWidth * progress;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.labelText}>
          Your gut health is{' '}
          <Text style={[styles.statusChip, { backgroundColor: status.color }]}>
            {status.text}
          </Text>
        </Text>
      </View>
      <Text style={styles.progressValue}>{score.toFixed(1)}</Text>

      <View style={styles.meterContainer} onLayout={handleLayout}>
        <LinearGradient
          colors={GRADIENT_COLORS as [string, string, string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBar}
        />
        {containerWidth > 0 && <View style={[styles.indicator, { left: indicatorPosition }]} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: themeColors.cardBackground,
    borderRadius: 18,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 16,
    color: themeColors.secondaryText,
    fontFamily: 'SFProDisplay-Medium',
  },
  statusChip: {
    color: 'white',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 14,
    overflow: 'hidden',
    fontFamily: 'SFProDisplay-Bold',
  },
  progressValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: themeColors.primaryText,
    fontFamily: 'SFProDisplay-Bold',
    marginTop: 4,
  },
  meterContainer: {
    height: 12,
    width: '100%',
    justifyContent: 'center',
    marginTop: 16,
  },
  gradientBar: {
    height: '100%',
    borderRadius: 6,
  },
  indicator: {
    position: 'absolute',
    width: 4,
    height: 24,
    backgroundColor: 'black',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'white',
    transform: [{ translateX: -2 }],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: themeColors.secondaryText,
    fontFamily: 'SFProDisplay-Medium',
    textAlign: 'center',
  },
}); 