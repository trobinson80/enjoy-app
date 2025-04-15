import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Button, StyleSheet } from "react-native";
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

  useEffect(() => {
    fetchSessions();
  }, []);

  const renderSession = ({ item }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => navigation.navigate("MoviePickerScreen", { sessionId: item.sessionId })}
    >
      <Text style={styles.sessionTitle}>
        {item.name || `Session with ${item.invitedFriendName || "Friend"}`}
      </Text>
      <Text style={styles.sessionMeta}>
        Services: {Object.entries(item.selectedServices || {})
          .filter(([_, v]) => v)
          .map(([k]) => k)
          .join(", ") || "All"}
      </Text>
    </TouchableOpacity>
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
        <Text style={styles.noSessions}>You haven’t started any sessions yet. 👀</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  header: { fontSize: 22, fontWeight: "bold", marginVertical: 15 },
  sessionCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  sessionTitle: { fontSize: 18, fontWeight: "600" },
  sessionMeta: { color: "#555", marginTop: 5 },
  noSessions: { marginTop: 30, textAlign: "center", color: "#888" },
});

export default MovieSessionsScreen;