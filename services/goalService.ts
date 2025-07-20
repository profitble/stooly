import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Goal {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
}

const MASTER_GOALS: Goal[] = [
  { id: '1', icon: '💧', title: 'Drink 500ml warm water', subtitle: 'Kickstarts digestion and morning pooping' },
  { id: '2', icon: '🌞', title: 'Get 5 minutes sunlight', subtitle: 'Resets your gut’s internal clock' },
  { id: '3', icon: '🤲', title: 'Massage belly in circles', subtitle: 'Stimulates colon and relieves gas' },
  { id: '4', icon: '🦷', title: 'Chew breakfast 30 times', subtitle: 'Activates enzymes and smooth digestion' },
  { id: '5', icon: '🍳', title: 'Eat breakfast within 2 hours', subtitle: 'Aligns with your gut’s rhythm' },
  { id: '6', icon: '🚶', title: 'Walk 10 minutes post-lunch', subtitle: 'Boosts motility and blood flow' },
  { id: '7', icon: '🪑', title: 'Sit upright during meals', subtitle: 'Improves digestion and prevents bloating' },
  { id: '8', icon: '🪜', title: 'Use footstool when pooping', subtitle: 'Eases elimination with proper angle' },
  { id: '9', icon: '🤸', title: 'Do wind-relieving pose', subtitle: 'Releases trapped gas and tension' },
  { id: '10', icon: '🌬️', title: 'Do 4-7-8 breathing', subtitle: 'Shifts body into digestion mode' },
  { id: '11', icon: '🎶', title: 'Hum for 30 seconds', subtitle: 'Stimulates vagus nerve for motility' },
  { id: '12', icon: '❄️', title: 'Splash face with cold water', subtitle: 'Activates gut-calming nerve signals' },
  { id: '13', icon: '🥤', title: 'Drink water before meals', subtitle: 'Primes digestion without dilution' },
  { id: '14', icon: '🕒', title: 'Stop eating 3 hours before bed', subtitle: 'Gives gut time to fully rest' },
  { id: '15', icon: '⏳', title: 'Eat within 12-hour window', subtitle: 'Supports microbiome and repair cycles' },
  { id: '16', icon: '🚰', title: 'Sip room-temp water at meals', subtitle: 'Hydrates gently, avoids slowing digestion' },
  { id: '17', icon: '🥬', title: 'Eat 1 tbsp sauerkraut', subtitle: 'Feeds good bacteria and reduces inflammation' },
  { id: '18', icon: '🌰', title: 'Eat 6 soaked almonds', subtitle: 'Gives prebiotics, fats, and protein' },
  { id: '19', icon: '🌾', title: 'Add flaxseed to breakfast', subtitle: 'Adds fiber and soothes your gut' },
  { id: '20', icon: '👅', title: 'Scrape tongue after brushing', subtitle: 'Improves enzyme response and oral-gut link' },
];

const CURRENT_GOALS_KEY = 'current_goals';
const DELETED_GOALS_QUEUE_KEY = 'deleted_goals_queue';
const ACTIVE_GOAL_COUNT = 3;

function getRandomGoal(excludeIds: string[]): Goal {
  const availableGoals = MASTER_GOALS.filter(g => !excludeIds.includes(g.id));
  if (availableGoals.length === 0) {
    return MASTER_GOALS[Math.floor(Math.random() * MASTER_GOALS.length)];
  }
  return availableGoals[Math.floor(Math.random() * availableGoals.length)];
}

async function getCurrentGoals(): Promise<Goal[]> {
  try {
    const goalsJson = await AsyncStorage.getItem(CURRENT_GOALS_KEY);
    if (!goalsJson) return [];
    const goals = JSON.parse(goalsJson);
    if (goals.length > 0 && goals[0].subtitle === undefined) {
      await AsyncStorage.removeItem(CURRENT_GOALS_KEY);
      return [];
    }
    return goals;
  } catch (e) {
    console.error("Failed to get current goals", e);
    return [];
  }
}

async function saveCurrentGoals(goals: Goal[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CURRENT_GOALS_KEY, JSON.stringify(goals));
  } catch (e) {
    console.error("Failed to save goals", e);
  }
}

export async function initializeGoals(): Promise<Goal[]> {
  let currentGoals = await getCurrentGoals();
  if (currentGoals.length === 0) {
    const initialGoalIds = new Set<string>();
    while (initialGoalIds.size < ACTIVE_GOAL_COUNT) {
      initialGoalIds.add(getRandomGoal([]).id);
    }
    currentGoals = MASTER_GOALS.filter(g => initialGoalIds.has(g.id));
    await saveCurrentGoals(currentGoals);
  }
  return currentGoals;
}

export async function deleteAndQueueReplacement(goalId: string): Promise<Goal[]> {
  const currentGoals = await getCurrentGoals();
  const newGoals = currentGoals.filter(g => g.id !== goalId);
  await saveCurrentGoals(newGoals);

  const queueJson = await AsyncStorage.getItem(DELETED_GOALS_QUEUE_KEY);
  const queue = queueJson ? JSON.parse(queueJson) : [];
  queue.push({ goalId, deletionTime: Date.now() });
  await AsyncStorage.setItem(DELETED_GOALS_QUEUE_KEY, JSON.stringify(queue));

  return newGoals;
}

export async function processGoalReplacementQueue(): Promise<Goal[]> {
  const queueJson = await AsyncStorage.getItem(DELETED_GOALS_QUEUE_KEY);
  const queue = queueJson ? JSON.parse(queueJson) as { goalId: string; deletionTime: number }[] : [];
  const currentGoals = await getCurrentGoals();
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  
  const { newGoals, goalsWereAdded } = addNewGoalsFromQueue(queue, currentGoals, now, twentyFourHours);
  
  const remainingQueue = queue.filter(item => now - item.deletionTime < twentyFourHours);

  if (goalsWereAdded) {
    await saveCurrentGoals(newGoals);
  }

  if (queue.length !== remainingQueue.length) {
    await AsyncStorage.setItem(DELETED_GOALS_QUEUE_KEY, JSON.stringify(remainingQueue));
  }

  return newGoals;
}

function addNewGoalsFromQueue(queue: any[], currentGoals: Goal[], now: number, twentyFourHours: number) {
  let goalsWereAdded = false;
  const newGoals = [...currentGoals];
  const goalsToAdd = ACTIVE_GOAL_COUNT - newGoals.length;
  
  if (goalsToAdd <= 0) {
    return { newGoals, goalsWereAdded };
  }

  const eligibleItems = queue.filter(item => now - item.deletionTime > twentyFourHours);
  
  for (let i = 0; i < Math.min(goalsToAdd, eligibleItems.length); i++) {
    const currentGoalIds = newGoals.map(g => g.id);
    const newGoal = getRandomGoal(currentGoalIds);
    newGoals.push(newGoal);
    goalsWereAdded = true;
  }
  
  return { newGoals, goalsWereAdded };
}

export async function clearAllGoals(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CURRENT_GOALS_KEY);
    await AsyncStorage.removeItem(DELETED_GOALS_QUEUE_KEY);
  } catch (e) {
    console.error("Failed to clear all goals", e);
  }
} 