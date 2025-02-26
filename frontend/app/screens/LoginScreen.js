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
import { signIn, signUp, getUserProfile } from "../auth/authService"; // Firebase Auth
import API_URL from "../../config";
import * as authStorage from "../auth/authStorage";

const LoginScreen = ({ navigation }) => {
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
  
      // Save the user session and update app state
      await authStorage.saveUserSession(data.uid, data.email, idToken);
      
      // Force a session check which will update the app state
      await authStorage.getUserSession();
  
      return data;
    } catch (error) {
      console.error("Backend error:", error.message);
      Alert.alert("Error", "Failed to authenticate with server.");
      return null;
    }
  };

  const handleLogin = async () => {
    try {
      // First authenticate the user
      const userCredential = await signIn(email, password);
      console.log("Login response:", userCredential); // Debug log

      if (!userCredential || !userCredential.user) {
        throw new Error('Failed to get user data from authentication');
      }

      const firebaseUser = userCredential.user;
      console.log("Firebase user:", firebaseUser); // Debug log

      // Fetch user profile from Firestore
      const userProfile = await getUserProfile(firebaseUser.uid);
      console.log("Firestore profile:", userProfile); // Debug log

      // Save to local storage with profile data
      await authStorage.saveUserSession(
        firebaseUser.uid,
        firebaseUser.email,
        firebaseUser.accessToken || firebaseUser.stsTokenManager?.accessToken,
        userProfile?.name || ''
      );

      // Navigate to home screen or handle successful login
      // ... your navigation code ...

    } catch (error) {
      console.error("Login error:", error);
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

          <Button title="Sign Up" onPress={() => handleLogin()} />
          <View style={styles.spacing} />
          <Button title="Sign In" onPress={() => handleLogin()} />
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

// Styles remain the same
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
