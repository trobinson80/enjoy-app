import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as authStorage from '../auth/authStorage';
import { updatePassword, updateUserProfile } from '../auth/authService';

const EditProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const userData = await authStorage.getUserSession();
    setUser(userData);
    setFormData(prev => ({
      ...prev,
      name: userData?.name || '',
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      
      // Debug log to see user object structure
      console.log("Current user object:", user);
      
      // Update name
      if (formData.name && user) {  // Add null check
        const updatedUser = {
          ...user,
          name: formData.name,
        };

        // Save to Firestore - use the correct uid path
        await updateUserProfile(updatedUser.uid || user.id, {  // Add fallback
          name: formData.name,
          email: user.email,
          updatedAt: new Date().toISOString(),
        });

        // Save to local storage
        await authStorage.saveUserSession(
          updatedUser.uid || user.id,  // Add fallback
          updatedUser.email,
          updatedUser.token,
          formData.name
        );

        // Update local state
        setUser(updatedUser);
        console.log("✅ Successfully updated user data in both Firestore and local storage");
      } else {
        throw new Error("No user data available");
      }

      setLoading(false);
      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      setLoading(false);
      Alert.alert("Error", error.message);
    }
  };

  const handleUpdatePassword = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert("Error", "New passwords don't match");
      return;
    }

    try {
      setLoading(true);
      await updatePassword(formData.currentPassword, formData.newPassword);
      setLoading(false);
      Alert.alert("Success", "Password updated successfully!");
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", error.message);
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Current Display Name</Text>
          <Text style={styles.emailText}>
            {user.name || user.email}
          </Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.emailText}>{user.email}</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>New Display Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="Enter your name"
          />
        </View>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Update Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Current Password</Text>
          <TextInput
            style={styles.input}
            value={formData.currentPassword}
            onChangeText={(text) => setFormData(prev => ({ ...prev, currentPassword: text }))}
            secureTextEntry
            placeholder="Enter current password"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            value={formData.newPassword}
            onChangeText={(text) => setFormData(prev => ({ ...prev, newPassword: text }))}
            secureTextEntry
            placeholder="Enter new password"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
            secureTextEntry
            placeholder="Confirm new password"
          />
        </View>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleUpdatePassword}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Update Password</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  emailText: {
    fontSize: 16,
    color: '#666',
    padding: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen; 