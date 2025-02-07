import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { signIn, signUp } from "../auth/authService"; // Import Firebase auth functions
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    try {
      const user = await signUp(email, password);
      Alert.alert("User created!", `Welcome, ${user.email}`);
      navigation.replace("MoviePicker"); // Navigate after sign-up
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleSignIn = async () => {
    try {
      const user = await signIn(email, password);
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
