import React, { useState } from "react";
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert, StyleSheet } from "react-native";
import axios from "axios";
import API_URL from "../../config";

const AddFriendsScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/search_users`, {
        params: { query: searchQuery }
      });
      setUsers(response.data.users);
    } catch (error) {
      Alert.alert("Error", "Could not search users.");
    }
    setLoading(false);
  };

  const sendFriendRequest = async (username) => {
    try {
      await axios.post(`${API_URL}/send_request`, { receiver: username });
      Alert.alert("Success", `Friend request sent to ${username}!`);
    } catch (error) {
      Alert.alert("Error", "Failed to send request.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Friends</Text>

      {/* Search Input */}
      <TextInput
        placeholder="Search by username..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.input}
      />
      <Button title="Search" onPress={searchUsers} disabled={loading} />

      {/* Search Results */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text>{item.name}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => sendFriendRequest(item.name)}
            >
              <Text style={styles.addButtonText}>Add Friend</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
  userItem: { flexDirection: "row", justifyContent: "space-between", padding: 15, borderBottomWidth: 1 },
  addButton: { backgroundColor: "#007AFF", padding: 8, borderRadius: 5 },
  addButtonText: { color: "#fff", fontWeight: "bold" },
});

export default AddFriendsScreen;
