import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthScreen from './screens/authscreen';
import HomeScreen from './screens/homescreen';
import WorkoutScreen from './screens/workoutscreen';
import CoachingScreen from './screens/coachingscreen';
import ExercisesScreen from './screens/exercisescreen';
import ExerciseDetailScreen from './screens/exercisedetail';
import HowToScreen from './screens/howto';
import BuilderScreen from './screens/builder';
import InsightsScreen from './screens/insightsscreen';
import ProfileScreen from './screens/profilescreen';
import GenderScreen from './screens/genderscreen';
import WeightScreen from './screens/weightscreen';
import GoalScreen from './screens/goalscreen';
import EquipmentScreen from './screens/equipmentscreen';
import PlanScreen from './screens/planscreen';
import MusicScreen from './screens/musicscreen';
import DaysScreen from './screens/daysscreen';
import LimitsScreen from './screens/limitsscreen';
import DisclaimerScreen from './screens/disclaimerscreen';
import PlayerScreen from './screens/playerscreen';
import CampusScreen from './screens/campusscreen';
import BuddyScreen from './screens/buddyscreen';
import { colors } from './constants/theme';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();
const OnboardingStack = createNativeStackNavigator();
const WorkoutsStack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
    card: 'transparent',
    text: colors.text,
    border: 'transparent',
    primary: colors.accent,
  },
};

const icons = {
  Home: ['home-outline', 'home'],
  Plan: ['calendar-outline', 'calendar'],
  Workouts: ['barbell-outline', 'barbell'],
  Buddies: ['people-outline', 'people'],
  Insights: ['stats-chart-outline', 'stats-chart'],
  Profile: ['person-outline', 'person'],
};

function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <OnboardingStack.Screen name="Gender" component={GenderScreen} />
      <OnboardingStack.Screen name="Weight" component={WeightScreen} />
      <OnboardingStack.Screen name="Goal" component={GoalScreen} />
      <OnboardingStack.Screen name="Equipment" component={EquipmentScreen} />
      <OnboardingStack.Screen name="Days" component={DaysScreen} />
      <OnboardingStack.Screen name="Campus" component={CampusScreen} />
      <OnboardingStack.Screen name="Limits" component={LimitsScreen} />
      <OnboardingStack.Screen name="Disclaimer" component={DisclaimerScreen} />
    </OnboardingStack.Navigator>
  );
}

function WorkoutsNavigator() {
  return (
    <WorkoutsStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <WorkoutsStack.Screen name="Programs" component={WorkoutScreen} />
      <WorkoutsStack.Screen name="Coaching" component={CoachingScreen} />
      <WorkoutsStack.Screen name="Exercises" component={ExercisesScreen} />
      <WorkoutsStack.Screen name="Builder" component={BuilderScreen} />
      <WorkoutsStack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      <WorkoutsStack.Screen name="HowTo" component={HowToScreen} />
    </WorkoutsStack.Navigator>
  );
}

function TabBarBlur() {
  return (
    <View className="absolute inset-0 overflow-hidden border-t border-black/10">
      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      <View className="absolute inset-0 bg-white/70" />
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarBackground: () => <TabBarBlur />,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: 70,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const [outline, filled] = icons[route.name];
          return <Ionicons name={focused ? filled : outline} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Plan" component={PlanScreen} />
      <Tab.Screen name="Workouts" component={WorkoutsNavigator} />
      <Tab.Screen name="Buddies" component={BuddyScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { ready, profile } = useApp();
  const { authReady, user, guest } = useAuth();

  if (!ready || !authReady) {
    return (
      <View className="flex-1 items-center justify-center bg-background" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const signedIn = Boolean(user) || guest;

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      {!signedIn ? (
        <RootStack.Screen name="Auth" component={AuthScreen} />
      ) : profile.onboarded && profile.acceptedDisclaimer ? (
        <>
          <RootStack.Screen name="Main" component={MainTabs} />
          <RootStack.Screen name="Player" component={PlayerScreen} options={{ presentation: 'fullScreenModal' }} />
          <RootStack.Screen name="Music" component={MusicScreen} options={{ presentation: 'modal' }} />
          <RootStack.Screen name="Auth" component={AuthScreen} options={{ presentation: 'modal' }} />
        </>
      ) : profile.onboarded ? (
        <RootStack.Screen name="Disclaimer" component={DisclaimerScreen} />
      ) : (
        <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
      )}
    </RootStack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppProvider>
          <NavigationContainer theme={navTheme}>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
