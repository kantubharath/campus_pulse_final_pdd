// navigation/AppNavigator.js
import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import CategoriesScreen from '../screens/CategoriesScreen';
import CommunityScreen from '../screens/CommunityScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import EventRegistrationScreen from '../screens/EventRegistrationScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import ModifyEventScreen from '../screens/ModifyEventScreen';
import MyEventsScreen from '../screens/MyEventsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SignUpScreen from '../screens/SignUpScreen';
import SplashScreen from '../screens/SplashScreen';
import PaymentScreen from '../screens/PaymentScreen';
import PaymentOverviewScreen from '../screens/PaymentOverviewScreen';
import AllEventsScreen from '../screens/AllEventsScreen';
import ProfileEventsScreen from '../screens/ProfileEventsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import HelpCenterScreen from '../screens/suport/HelpCenterScreen';
import ContactSupportScreen from '../screens/suport/ContactSupportScreen';
import TermsOfServiceScreen from '../screens/suport/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/suport/PrivacyPolicyScreen';
import AdminScreen from '../screens/AdminScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator for main screens
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Community') {
            iconName = 'chat';
          } else if (route.name === 'Categories') {
            iconName = 'calendar-today';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#ddd',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Categories" component={CategoriesScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

// Main Stack Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EventDetails"
          component={EventDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EventRegistration"
          component={EventRegistrationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateEvent"
          component={CreateEventScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='MyEvents'
          component={MyEventsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='ModifyEvent'
          component={ModifyEventScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name='PaymentScreen'
          component={PaymentScreen}
          options={{ headerShown:false }}
        />
        <Stack.Screen 
          name="PaymentOverView"
          component={PaymentOverviewScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AllEvents"
          component={AllEventsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ProfileEvents"
          component={ProfileEventsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="EditProfile"
          component={EditProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name='HelpCenter'
          component={HelpCenterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name='ContactSupport'
          component={ContactSupportScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name='TermsOfService'
          component={TermsOfServiceScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name='PrivacyPolicy'
          component={PrivacyPolicyScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name='Admin'
          component={AdminScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;