import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {StormType} from '../models';
import {Colors, Typography} from '../theme';

interface StormTypeOption {
  value: StormType;
  label: string;
  icon: string;
  color: string;
}

const STORM_TYPES: StormTypeOption[] = [
  {value: 'tornado', label: 'Tornado', icon: '🌪', color: Colors.tornado},
  {value: 'hurricane', label: 'Hurricane', icon: '🌀', color: Colors.hurricane},
  {value: 'thunderstorm', label: 'Thunderstorm', icon: '⛈', color: Colors.thunderstorm},
  {value: 'hail', label: 'Hail', icon: '🧊', color: Colors.hail},
  {value: 'blizzard', label: 'Blizzard', icon: '❄️', color: Colors.blizzard},
  {value: 'flood', label: 'Flood', icon: '🌊', color: Colors.flood},
  {value: 'other', label: 'Other', icon: '🌩', color: Colors.other},
];

interface StormTypePickerProps {
  selected: StormType;
  onSelect: (type: StormType) => void;
}

/**
 * StormTypePicker — horizontal scrollable storm type selector.
 */
const StormTypePicker: React.FC<StormTypePickerProps> = ({selected, onSelect}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.container}>
    {STORM_TYPES.map(option => {
      const isSelected = selected === option.value;
      return (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.chip,
            isSelected && {backgroundColor: option.color, borderColor: option.color},
          ]}
          onPress={() => onSelect(option.value)}
          accessibilityRole="button"
          accessibilityState={{selected: isSelected}}
          accessibilityLabel={option.label}>
          <Text style={styles.chipIcon}>{option.icon}</Text>
          <Text
            style={[
              styles.chipLabel,
              isSelected && styles.chipLabelSelected,
            ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
    marginRight: 8,
  },
  chipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  chipLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chipLabelSelected: {
    color: Colors.textPrimary,
  },
});

export default StormTypePicker;
