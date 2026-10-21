import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatRelativeTime } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';

export const ProximityHeader = ({ lastUpdated }: { lastUpdated: string | null }) => {
  const { mode, toggle, colors } = useTheme();
  const insets = useSafe