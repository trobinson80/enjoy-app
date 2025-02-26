import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, AppState } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Ionicons from "react-native-vector-icons/Ionicons";
import LoginScreen from "./app/screens/LoginScreen";
import MoviePickerScreen from "./app/screens/MoviePickerScreen";
import LogoutDrawer from "./app/auth/logoutDrawer";
import * as authStorage from "./app/auth/authStorage"; // Auth session functions
import { setStateChangeCallback } from "./app/auth/authStorage";

// Dummy Home Screen (Replace with Dashboard if needed)
const HomeScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Home Screen</Text>
  </View>
);

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored session
  const checkSession = async () => {
    const session = await authStorage.getUserSession();
    console.log("👤 App.js - Current user:", session?.email || 'none');
    setUser(session);
    setLoading(false);
  };

  // Update user state with logging
  const handleUserStateChange = (newUserState) => {
    console.log("🔄 App.js - Updating user:", newUserState?.email || 'none');
    setUser(newUserState);
  };

  useEffect(() => {
    // Register the callback for state changes
    setStateChangeCallback(handleUserStateChange);
    
    checkSession(); // Initial session check

    // Listen for app state changes
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
          <Stack.Screen name="MainApp" component={DrawerNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
