import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors, Typography} from '../../theme';

const StormLogScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={Typography.h2}>Storm Log</Text>
      <Text style={styles.placeholder}>Coming soon…</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    ...Typography.bodySmall,
    marginTop: 8,
  },
});

export default StormLogScreen;
