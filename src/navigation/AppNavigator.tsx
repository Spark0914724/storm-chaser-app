import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Text} from 'react-native';

import WeatherScreen from '../screens/Weather/WeatherScreen';
import DocumentScreen from '../screens/Document/DocumentScreen';
import StormLogScreen from '../screens/StormLog/StormLogScreen';
import StormDetailScreen from '../screens/StormDetail/StormDetailScreen';
import MapScreen from '../screens/Map/MapScreen';
import {Colors} from '../theme';

// ─── Tab param list ───────────────────────────────────────────────────────────
export type TabParamList = {
  Weather: undefined;
  Document: undefined;
  StormLog: undefined;
  Map: undefined;
};

// ─── Root stack param list ────────────────────────────────────────────────────
export type RootStackParamList = {
  Tabs: undefined;
  StormDetail: {stormId: string};
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

/** Tab icon helper — uses emoji as lightweight icons until vector icons are linked */
const TabIcon = ({label, focused}: {label: string; focused: boolean}) => {
  const icons: Record<string, string> = {
    Weather: '🌩',
    Document: '📷',
    StormLog: '📋',
    Map: '🗺',
  };
  return (
    <Text style={{fontSize: 22, opacity: focused ? 1 : 0.5}}>
      {icons[label] ?? '●'}
    </Text>
  );
};

const TabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: Colors.surface,
        borderTopColor: Colors.border,
        height: 60,
        paddingBottom: 8,
      },
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textMuted,
      tabBarIcon: ({focused}) => (
        <TabIcon label={route.name} focused={focused} />
      ),
    })}>
    <Tab.Screen name="Weather" component={WeatherScreen} />
    <Tab.Screen name="Document" component={DocumentScreen} />
    <Tab.Screen name="StormLog" component={StormLogScreen} />
    <Tab.Screen name="Map" component={MapScreen} />
  </Tab.Navigator>
);

const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="StormDetail"
        component={StormDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Storm Detail',
          headerStyle: {backgroundColor: Colors.surface},
          headerTintColor: Colors.textPrimary,
        }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
