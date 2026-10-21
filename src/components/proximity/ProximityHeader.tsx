import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface ProximityHeaderProps {
  lastUpdated?: Date | null;
}

export const ProximityHeader: React.FC<ProximityHeaderProps> = ({ lastUpdated }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // "