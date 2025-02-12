import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { signIn, signUp } from "../auth/authService"; // Import Firebase auth functions
import { useNavigation } from "@react-navigation/native";
import API_URL from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const sendTokenToBackend = async (idToken) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`, // Send token in header
        },
        body: JSON.stringify({ email }), // Send additional user data if needed
      });
      print(idToken)
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }
      console.log("Backend response:", data);
    } catch (error) {
      console.error("Backend error:", error.message);
      Alert.alert("Error", "Failed to authenticate with server.");
    }
  };

  const handleSignUp = async () => {
    try {
      const user = await signUp(email, password);
      const idToken = await user.getIdToken();
      await AsyncStorage.setItem("idToken", idToken);

      await sendTokenToBackend(idToken)

      Alert.alert("User created!", `Welcome, ${user.email}`);
      navigation.replace("MoviePicker"); // Navigate after sign-up
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleSignIn = async () => {
    try {
      const user = await signIn(email, password);
      const idToken = await user.getIdToken();
      await AsyncStorage.setItem("idToken", idToken);

      await sendTokenToBackend(idToken)

      Alert.alert("Success", `Welcome back, ${user.email}`);
      navigation.replace("MoviePicker"); // Navigate after sign-in
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Email:</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        value={email}
        onChangeText={setEmail}
      />

      <Text>Password:</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Sign Up" onPress={handleSignUp} />
      <Button title="Sign In" onPress={handleSignIn} />
    </View>
  );
};

export default LoginScreen;
