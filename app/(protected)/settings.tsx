import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FileText, ShieldCheck, Trash } from 'lucide-react-native';
import { Link } from 'phosphor-react-native';
import { themeColors } from '@/styles/theme';
import { BottomNavBar } from '@/components/BottomNavBar';
import { FAB } from '@/components/FAB';
import { clearAllUserData } from '../../services/userDataService';

const MenuItem = ({ icon, text, onPress, isDestructive = false, showLink = true }: { icon: React.ReactNode; text: string; onPress: () => void; isDestructive?: boolean; showLink?: boolean; }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemContent}>
      {icon}
      <Text style={[styles.menuItemText, isDestructive && styles.destructiveText]}>{text}</Text>
    </View>
    {showLink && <Link size={20} color={isDestructive ? themeColors.iconRed : themeColors.inactiveNavText} />}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const router = useRouter();

  const handleClearData = () => {
    Alert.alert(
      'Delete All Data',
      'Are you sure? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllUserData();
              // After clearing data, redirect to a fresh home screen
              router.replace('/(protected)/home');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete all data. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContentContainer}>
          <View style={styles.bodyContent}>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            <View style={styles.card}>
              <MenuItem
                icon={<FileText size={20} color={themeColors.primaryText} />}
                text="Terms of Service"
                onPress={() => router.push('https://www.shitventures.xyz/terms' as any)}
              />
              <View style={styles.divider} />
              <MenuItem
                icon={<ShieldCheck size={20} color={themeColors.primaryText} />}
                text="Privacy Policy"
                onPress={() => router.push('https://www.shitventures.xyz/privacy' as any)}
              />
              <View style={styles.divider} />
              <MenuItem
                icon={<Trash size={20} color={themeColors.iconRed} />}
                text="Delete My Data"
                onPress={handleClearData}
                isDestructive
                showLink={false}
              />
            </View>
            <Text style={styles.dataNotice}>
              All your data is stored locally on this device. Deleting it will reset the app to its initial state.
            </Text>
          </View>
        </ScrollView>
        <BottomNavBar activeScreen="settings" />
        <FAB />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.gradientStart,
  },
  scrollContentContainer: {
    paddingBottom: 120,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: themeColors.primaryText,
    fontFamily: 'SFProDisplay-Bold',
    marginBottom: 8,
  },
  card: {
    backgroundColor: themeColors.cardBackground,
    borderRadius: 18,
    paddingHorizontal: 16,
    marginTop: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: themeColors.primaryText,
    fontFamily: 'SFProDisplay-Medium',
    marginLeft: 16,
  },
  destructiveText: {
    color: themeColors.iconRed,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: themeColors.navBorder,
    marginLeft: 52, 
  },
  dataNotice: {
    fontSize: 13,
    color: themeColors.secondaryText,
    fontFamily: 'SFProDisplay-Regular',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
}); 