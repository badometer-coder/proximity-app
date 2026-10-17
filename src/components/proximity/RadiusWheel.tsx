import React, { useRef, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

export const RadiusWheel = ({ value, onValueChange }: { value: number; onValueChange: (val: number) => void }) => {
  const scrollViewRef = useRef<ScrollView>(null);

  const items: number[] = [1, 2, 3, 4, 5];

  useEffect(() => {
    const index = items.indexOf(value / 1000);
    if (index !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: index * 70 - 150, animated: true });
    }
  }, [value, items]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={70}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((km) => {
          const meters = km * 1000;
          const isSelected = meters === value;
          return (
            <TouchableOpacity
              key={km}
              onPress={() => onValueChange(meters)}
              style={styles.itemContainer}
            >
              <View style={styles.textRow}>
                <Text style={[styles.text, isSelected && styles.textActive]}>
                  {km}
                </Text>
                <Text style={[styles.smallKm, isSelected && styles.smallKmActive]}>
                  km
                </Text>
              </View>
              
              {isSelected && <View style={styles.dot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    backgroundColor: theme.colors.surface, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.border, 
    height: 65, 
    justifyContent: 'center'
  },
  scrollContent: { 
    paddingHorizontal: 150, 
    alignItems: 'center',
    gap: 10,
  },
  itemContainer: { 
    width: 70, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  textRow: { 
    flexDirection: 'row', 
    alignItems: 'baseline',
  },
  text: { 
    fontSize: 16, 
    fontWeight: '400', 
    color: theme.colors.text.tertiary, 
  },
  textActive: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: theme.colors.primary.main, 
  },
  smallKm: { 
    fontSize: 9, 
    color: theme.colors.text.tertiary, 
    marginLeft: 2, 
  },
  smallKmActive: { 
    color: theme.colors.primary.main, 
  },
  dot: { 
    width: 4, 
    height: 4, 
    borderRadius: 2, 
    backgroundColor: theme.colors.primary.main, 
    marginTop: 6, 
  },
});