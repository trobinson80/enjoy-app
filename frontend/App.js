import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, AppState } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Ionicons from "react-native-vector-icons/Ionicons";

import LoginScreen from "./app/screens/LoginScreen";
import MoviePickerScreen from "./app/screens/MoviePickerScreen";
import MovieSessionsScreen from "./app/screens/MovieSessionsScreen";
import CreateMovieSessionScreen from "./app/screens/CreateMovieSessionScreen";

import FriendsScreen from "./app/screens/FriendsScreen";
import LogoutDrawer from "./app/auth/logoutDrawer";
import * as authStorage from "./app/auth/authStorage"; // Auth session functions
import { setStateChangeCallback } from "./app/auth/authStorage";
import ProfileScreen from "./app/screens/ProfileScreen";
import EditProfileScreen from './app/screens/EditProfileScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Dummy Home Screen
const HomeScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Home Screen</Text>
  </View>
);

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
      <Drawer.Screen name="Watch Party" component={MovieSessionsScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Edit Profile',
        }}
      />
      <Drawer.Screen name="Friends" component={FriendsScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    const session = await authStorage.getUserSession();
    console.log("👤 App.js - Current user:", session?.email || 'none');
    setUser(session);
    setLoading(false);
  };

  const handleUserStateChange = (newUserState) => {
    console.log("🔄 App.js - Updating user:", newUserState?.email || 'none');
    setUser(newUserState);
  };

  useEffect(() => {
    setStateChangeCallback(handleUserStateChange);
    checkSession();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        console.log("📱 App became active, checking session");
        checkSession();
      }
    });

    return () => {
      subscription.remove();
      setStateChangeCallback(null);
      console.log("🧹 Cleanup: removed state change callback");
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainApp" component={DrawerNavigator} />
            <Stack.Screen name="MoviePickerScreen" component={MoviePickerScreen} />
            <Stack.Screen name="CreateMovieSessionScreen" component={CreateMovieSessionScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
