import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Platform,
} from "react-native";
import { signIn, signUp } from "../auth/authService"; // Firebase Auth
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
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ email }),
      });

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

      await sendTokenToBackend(idToken);

      Alert.alert("User created!", `Welcome, ${user.email}`);
      navigation.replace("MainApp");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleSignIn = async () => {
    try {
      const user = await signIn(email, password);
      const idToken = await user.getIdToken();
      await AsyncStorage.setItem("idToken", idToken);

      await sendTokenToBackend(idToken);

      Alert.alert("Success", `Welcome back, ${user.email}`);
      navigation.replace("MainApp");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.innerContainer}
        >
          <Text style={styles.title}>Login</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />

          <Button title="Sign Up" onPress={handleSignUp} />
          <View style={styles.spacing} />
          <Button title="Sign In" onPress={handleSignIn} />
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  spacing: {
    height: 10,
  },
});

export default LoginScreen;
