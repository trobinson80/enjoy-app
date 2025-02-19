import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const LogoutDrawer = (props) => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    await AsyncStorage.removeItem("idToken"); // Clear stored token
    navigation.replace("Login"); // Redirect to login
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Scrollable Drawer Items */}
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Logout Button at Bottom */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logoutContainer: {
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 20, // Ensures it sits at the bottom
  },
  logoutButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LogoutDrawer;
