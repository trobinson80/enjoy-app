import { StatusBar } from 'expo-status-bar';
import React from 'react';
import MoviePickerScreen from './app/screens/MoviePickerScreen';
//import ProfileScreen from './app/screens/ProfileScreen';
//import FriendsScreen from './app/screens/FriendsScreen';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import LoginScreen from "./app/screens/LoginScreen";
import { Ionicons } from "react-native-vector-icons"; // For icons
import { View, Text } from "react-native";
import LogoutDrawer from "./app/auth/logoutDrawer"; // Import custom drawer

// Dummy Home Screen (Can be replaced with a dashboard)
const HomeScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Home Screen</Text>
  </View>
);

// Create Stack Navigator
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Drawer Navigator (Main App)
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <LogoutDrawer {...props} />}
      screenOptions={({ route }) => ({
        drawerIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Watch Party") iconName = "film-outline";
          else if (route.name === "Profile") iconName = "person-outline";
          else if (route.name === "Friends") iconName = "people-outline";
          else iconName = "home-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Watch Party" component={MoviePickerScreen} />
      <Drawer.Screen name="Profile" component={HomeScreen} />
      <Drawer.Screen name="Friends" component={HomeScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Show Login First, Then Navigate to Drawer */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainApp" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}