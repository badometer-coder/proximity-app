```typescript
import React from 'react';
import { View, ViewStyle, StyleProp, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { theme } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: Style