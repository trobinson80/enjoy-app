import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { getUserSession } from "../auth/authStorage";
import API_URL from "../../config";

const CreateMovieSessionScreen = () => {
  const [selectedServices, setSelectedServices] = useState({
    Netflix: false,
    Prime: false,
    Apple: false,
    Max: false,
    Disney: false,
    Hulu: false,
  });

  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const user = await getUserSession();
        const res = await axios.get(`${API_URL}/friend_requests`, {
          params: { uid: user.uid },
        });
        setFriends(res.data.friends || []);
      } catch (err) {
        console.error("Error fetching friends:", err);
        Alert.alert("Error", "Could not load friends.");
      }
    };
    fetchFriends();
  }, []);

  const toggleService = (service) => {
    setSelectedServices((prev) => ({
      ...prev,
      [service]: !prev[service],
    }));
  };

  const createSession = async () => {
    try {
      const user = await getUserSession();
      const response = await axios.post(`${API_URL}/create_movie_session`, {
        owner: user.uid,
        invitedFriend: selectedFriend,
        selectedServices,
      });

      if (response.data.sessionId) {
        navigation.navigate("MoviePickerScreen", {
          sessionId: response.data.sessionId,
        });
      } else {
        Alert.alert("Error", "Failed to create session.");
      }
    } catch (error) {
      console.error("Error creating session:", error);
      Alert.alert("Error", "Could not create session.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Select Streaming Services</Text>
        {Object.keys(selectedServices).map((service) => (
          <TouchableOpacity
            key={service}
            style={[
              styles.serviceButton,
              selectedServices[service] && styles.serviceSelected,
            ]}
            onPress={() => toggleService(service)}
          >
            <Text
              style={[
                styles.serviceText,
                selectedServices[service] && styles.serviceTextSelected,
              ]}
            >
              {service}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.title}>Invite a Friend</Text>
        {friends.map((friend) => (
          <TouchableOpacity
            key={friend.uid}
            style={[
              styles.friendButton,
              selectedFriend === friend.uid && styles.friendSelected,
            ]}
            onPress={() => setSelectedFriend(friend.uid)}
          >
            <Text
              style={[
                styles.friendText,
                selectedFriend === friend.uid && styles.friendTextSelected,
              ]}
            >
              {friend.name}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={{ marginTop: 20 }}>
          <Button
            title="Create Session"
            onPress={createSession}
            disabled={!selectedFriend}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    alignItems: "center",
    justifyContent: "flex-start", // changed from default stretch
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginVertical: 20,
    textAlign: "center",
  },
  serviceButton: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginBottom: 10,
  },
  serviceSelected: {
    backgroundColor: "#007AFF",
  },
  serviceText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  serviceTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  friendButton: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginBottom: 10,
  },
  friendSelected: {
    backgroundColor: "#34C759",
  },
  friendText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  friendTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default CreateMovieSessionScreen;
