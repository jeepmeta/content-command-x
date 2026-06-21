import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CategoryBadgeProps {
  categoryName: string;
  config?: {
    icon: any;
    color: string;
    bg: string;
    border: string;
    fill: string;
  };
  size?: 'sm' | 'md';
}

export default function CategoryBadge({ categoryName, config, size = 'md' }: CategoryBadgeProps) {
  const isSmall = size === 'sm';
  const IconComp = config?.icon;
  
  return (
    <View style={
      styles.badge, 
      { 
        backgroundColor: config?.bg || 'rgba(163,163,172,0.1)', 
        borderColor: config?.border || 'rgba(163,163,172,0.2)' 
      }
    }>
      {IconComp && <IconComp size={isSmall ? 11 : 13} color={config?.color || '#a1a1aa'} style={{ marginRight: 4 }} />}
      <Text style={
        styles.text, 
        { 
          color: config?.color || '#a1a1aa', 
          fontSize: isSmall ? 9 : 10 
        }
      }>
        {categoryName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});