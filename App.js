import { StatusBar } from 'expo-status-bar';
//import { StyleSheet, Text, View , Image} from 'react-native';
import React from 'react';
import MoviePickerScreen from './app/screens/MoviePickerScreen';
import MoviePoster from './app/components/MoviePoster';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./app/screens/LoginScreen";


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MoviePicker" component={MoviePickerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}