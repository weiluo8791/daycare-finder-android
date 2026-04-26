import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/constants';

import LandingScreen from '../screens/LandingScreen';
import SearchScreen from '../screens/SearchScreen';
import MapScreen from '../screens/MapScreen';
import DaycareDetailScreen from '../screens/DaycareDetailScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProviderLoginScreen from '../screens/ProviderLoginScreen';
import ProviderRegisterScreen from '../screens/ProviderRegisterScreen';
import ProviderDashboardScreen from '../screens/ProviderDashboardScreen';
import ClaimDaycareScreen from '../screens/ClaimDaycareScreen';
import EditListingScreen from '../screens/EditListingScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="DaycareDetail" component={DaycareDetailScreen} />
    </Stack.Navigator>
  );
}

function ProviderStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProviderDashboard" component={ProviderDashboardScreen} />
      <Stack.Screen name="ProviderLogin" component={ProviderLoginScreen} />
      <Stack.Screen name="ProviderRegister" component={ProviderRegisterScreen} />
      <Stack.Screen name="ClaimDaycare" component={ClaimDaycareScreen} />
      <Stack.Screen name="EditListing" component={EditListingScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'home';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Favorites') iconName = focused ? 'heart' : 'heart-outline';
          else if (route.name === 'Dashboard') iconName = focused ? 'business' : 'business-outline';
          else if (route.name === 'Admin') iconName = focused ? 'shield' : 'shield-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={LandingScreen} />
      <Tab.Screen name="Search" component={SearchStack} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Dashboard" component={ProviderStack} />
      <Tab.Screen
        name="Admin"
        component={AdminDashboardScreen}
        options={{
          tabBarButton: user?.role === 'admin' ? undefined : () => null,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="DaycareDetail" component={DaycareDetailScreen} />
        <Stack.Screen name="ProviderLogin" component={ProviderLoginScreen} />
        <Stack.Screen name="ProviderRegister" component={ProviderRegisterScreen} />
        <Stack.Screen name="ClaimDaycare" component={ClaimDaycareScreen} />
        <Stack.Screen name="EditListing" component={EditListingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
