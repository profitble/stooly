import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { FileText, ShieldCheck, Trash } from 'lucide-react-native';
import { Link } from 'phosphor-react-native';
import { BottomNavBar } from '@/components/BottomNavBar';
import { FAB } from '@/components/FAB';
import { clearAllUserData } from '../../services/userDataService';
import {
  Box,
  Text,
  ScrollView,
  Pressable,
} from '@gluestack-ui/themed';
import { moderateScale } from '@/styles/sizing';

const MenuItem = ({ icon, text, onPress, isDestructive = false, showLink = true }: { icon: React.ReactNode; text: string; onPress: () => void; isDestructive?: boolean; showLink?: boolean; }) => (
  <Pressable
    flexDirection="row"
    justifyContent="space-between"
    alignItems="center"
    paddingVertical={20}
    onPress={onPress}
  >
    <Box flexDirection="row" alignItems="center">
      {icon}
      <Text
        color={isDestructive ? '$iconRed' : '$primaryText'}
        fontWeight="$medium"
        marginLeft={16}
        sx={{ fontSize: moderateScale(16) }}
      >
        {text}
      </Text>
    </Box>
    {showLink && <Link size={20} color={isDestructive ? '#ef4444' : '#9ca3af'} />}
  </Pressable>
);

export default function SettingsScreen() {
  const router = useRouter();

  const handleClearData = () => {
    Alert.alert(
      'Delete All Data',
      'Are you sure? This will delete everything and can\'t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllUserData();
              router.replace('/(protected)/home');
            } catch (error) {
              Alert.alert('Error', 'Couldn\'t delete data. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <Box flex={1} backgroundColor="$gradientStart">
      <Box flex={1}>
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 120,
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
              Settings
            </Text>
            
            <Box
              backgroundColor="$cardBackground"
              borderRadius={18}
              paddingHorizontal={16}
              marginTop={16}
              sx={{
                _ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                },
              }}
            >
              <MenuItem
                icon={<FileText size={20} color="#111" />}
                text="Terms of Service"
                onPress={() => router.push('https://www.shitventures.xyz/terms' as any)}
              />
              <Box height={StyleSheet.hairlineWidth} backgroundColor="$navBorder" marginLeft={52} />
              <MenuItem
                icon={<ShieldCheck size={20} color="#111" />}
                text="Privacy Policy"
                onPress={() => router.push('https://www.shitventures.xyz/privacy' as any)}
              />
              <Box height={StyleSheet.hairlineWidth} backgroundColor="$navBorder" marginLeft={52} />
              <MenuItem
                icon={<Trash size={20} color="#ef4444" />}
                text="Delete My Data"
                onPress={handleClearData}
                isDestructive
                showLink={false}
              />
            </Box>
            <Text
              color="$secondaryText"
              textAlign="center"
              marginTop={16}
              paddingHorizontal={16}
              sx={{ fontSize: moderateScale(13) }}
            >
              All your data is stored locally on this device. Deleting it will reset the app to its initial state.
            </Text>
          </Box>
        </ScrollView>
        <BottomNavBar activeScreen="settings" />
        <FAB />
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({}); 