import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getUserSession } from "../auth/authStorage";
import axios from "axios";
import API_URL from "../../config";

const MovieSessionsScreen = () => {
  const navigation = useNavigation();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const user = await getUserSession();
      const res = await axios.get(`${API_URL}/movie_sessions`, {
        params: { uid: user.uid },
      });
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId) => {
    Alert.alert("Delete Session", "Are you sure you want to delete this session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/delete_session`, {
              data: { sessionId },
            });
            setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
          } catch (err) {
            console.error("Error deleting session:", err);
            Alert.alert("Error", "Failed to delete session.");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const renderSession = ({ item }) => (
    <View style={styles.sessionRow}>
      <TouchableOpacity
        style={styles.sessionCard}
        onPress={() =>
          navigation.navigate("MoviePickerScreen", { sessionId: item.sessionId })
        }
      >
        <Text style={styles.sessionTitle}>
          {item.name || `Session with ${item.invitedFriendName || "Friend"}`}
        </Text>
        <Text style={styles.sessionMeta}>
          Services:{" "}
          {Object.entries(item.selectedServices || {})
            .filter(([_, v]) => v)
            .map(([k]) => k)
            .join(", ") || "All"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => deleteSession(item.sessionId)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>✖</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button
        title="➕ New Session"
        onPress={() => navigation.navigate("CreateMovieSessionScreen")}
      />
      <Text style={styles.header}>Your Sessions</Text>

      {loading ? (
        <Text>Loading sessions...</Text>
      ) : sessions.length > 0 ? (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.sessionId}
          renderItem={renderSession}
        />
      ) : (
        <Text style={styles.noSessions}>
          You haven’t started any sessions yet. 👀
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  header: { fontSize: 22, fontWeight: "bold", marginVertical: 15 },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sessionCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  sessionTitle: { fontSize: 18, fontWeight: "600" },
  sessionMeta: { color: "#555", marginTop: 5 },
  deleteButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  noSessions: { marginTop: 30, textAlign: "center", color: "#888" },
});

export default MovieSessionsScreen;