import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert, StyleSheet } from "react-native";
import axios from "axios";
import API_URL from "../../config";
import { getUserSession } from "../auth/authStorage";

const AddFriendsScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    fetchFriendData();
  }, []);

  const fetchFriendData = async () => {
    try {
      const currentUser = await getUserSession();
      const response = await axios.get(`${API_URL}/friend_requests`, {
        params: { uid: currentUser.uid },
      });

      setFriendRequests(response.data.friendRequests || []);
      setFriends(response.data.friends || []);
    } catch (error) {
      Alert.alert("Error", "Failed to load friend data.");
    }
  };

  const handleConfirmRequest = async (requesterUid, requesterName) => {
    try {
      const currentUser = await getUserSession();
      await axios.post(`${API_URL}/confirm_friend_request`, {
        current_uid: currentUser.uid,
        requester_uid: requesterUid,
      });
      Alert.alert("Success", "Friend request accepted!");
      setFriendRequests((prev) => prev.filter((req) => req.uid !== requesterUid));
      setFriends((prev) => [...prev, { uid: requesterUid, name: requesterName }]);
    } catch (error) {
      Alert.alert("Error", "Failed to confirm request.");
    }
  };

  const handleDeclineRequest = async (requesterUid) => {
    try {
      const currentUser = await getUserSession();
      await axios.post(`${API_URL}/decline_friend_request`, {
        current_uid: currentUser.uid,
        requester_uid: requesterUid,
      });
      Alert.alert("Success", "Friend request declined.");
      setFriendRequests((prev) => prev.filter((req) => req.uid !== requesterUid));
      setFriends((prev) => prev.filter((friend) => friend.uid !== requesterUid));
    } catch (error) {
      Alert.alert("Error", "Failed to decline request.");
    }
  };  

  const handleRemoveFriend = async (friendUid) => {
    try {
      const currentUser = await getUserSession();
      await axios.post(`${API_URL}/decline_friend_request`, {
        current_uid: currentUser.uid,
        requester_uid: friendUid,
      });
      Alert.alert("Success", "Friend removed.");
      setFriends(prev => prev.filter(friend => friend.uid !== friendUid));
    } catch (error) {
      Alert.alert("Error", "Failed to remove friend.");
    }
  };  

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

  const sendFriendRequest = async (targetUid) => {
    try {
      const currentUser = await getUserSession();
      await axios.post(`${API_URL}/add_friend`, { current_uid: currentUser.uid, target_uid: targetUid });
      Alert.alert("Success", "Friend request sent!");
    } catch (error) {
      Alert.alert("Error", "Failed to send request.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friend Requests</Text>
      {friendRequests.length > 0 ? (
        <FlatList
          data={friendRequests}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <View style={styles.requestItem}>
              <Text>{item.name}</Text>
              <View style={styles.requestButtons}>
                <TouchableOpacity
                  style={[styles.requestButton, { backgroundColor: "green" }]}
                  onPress={() => handleConfirmRequest(item.uid, item.name)}
                >
                  <Text style={styles.requestButtonText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.requestButton, { backgroundColor: "red" }]}
                  onPress={() => handleDeclineRequest(item.uid)}
                >
                  <Text style={styles.requestButtonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <Text>No pending friend requests</Text>
      )}

      <Text style={styles.title}>Friends</Text>
      {friends.length > 0 ? (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              <Text>{item.name}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFriend(item.uid)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text>No friends yet. Go socialize!</Text>
      )}

      <Text style={styles.title}>Add Friends</Text>
      <TextInput
        placeholder="Search by username..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.input}
      />
      <Button title="Search" onPress={searchUsers} disabled={loading} />
      <FlatList
        data={users}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text>{item.name}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => sendFriendRequest(item.uid)}
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
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc"
  },
  addButton: { backgroundColor: "#007AFF", padding: 8, borderRadius: 5 },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  requestItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc"
  },
  requestButtons: { flexDirection: "row", gap: 10 },
  requestButton: { padding: 8, borderRadius: 5 },
  requestButtonText: { color: "#fff", fontWeight: "bold" },
  removeButton: { backgroundColor: "#FF3B30", padding: 8, borderRadius: 5 },
  removeButtonText: { color: "#fff", fontWeight: "bold" },
});

export default AddFriendsScreen;
