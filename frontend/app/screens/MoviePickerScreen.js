import React, { useState, useRef, useEffect } from "react";
import Screen from "../components/Screen";
import { StyleSheet, ActivityIndicator, View, Animated, Text, Modal, TouchableOpacity } from "react-native";
import MoviePoster from "../components/MoviePoster";
import { imageMapping } from "../utils/imageMapping";
import API_URL from "../../config";
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from "@react-navigation/native";

function MoviePickerScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { sessionId } = route.params;

  const [curMovie, setCurMovie] = useState(null);
  const [moviesList, setMoviesList] = useState([]);
  const [curMovieIndex, setCurMovieIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [currentPoster, setCurrentPoster] = useState(null);
  const [nextIndex, setNextIndex] = useState(0);
  const [curTitle, setCurTitle] = useState("");
  const [selectedServices, setSelectedServices] = useState({});

  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const updateMaxKey = (verticalPoster) => {
    return Object.keys(verticalPoster).reduce((max, key) => {
      return parseInt(key.slice(1)) > parseInt(max.slice(1)) ? key : max;
    });
  };

  const fetchMovies = async (services = selectedServices) => {
    try {
      const serviceValues = {
        Netflix: 1,
        Prime: 2,
        Apple: 4,
        Max: 8,
        Disney: 16,
        Hulu: 32
      };

      let filterValue = Object.entries(services).reduce((acc, [key, val]) => {
        return acc + (val ? serviceValues[key] : 0);
      }, 0);

      if (filterValue === 0) filterValue = 63;

      console.log("🎬 Fetching movies with filter:", filterValue.toString(2).padStart(6, '0'));
      const response = await fetch(`${API_URL}/movies?filter=${filterValue}`);
      if (response.ok) {
        const data = await response.json();
        setMoviesList(data);
        setCurMovie(data[0] || null);
        setCurMovieIndex(0);
        setNextIndex(1);
        setCurrentPoster(getImage(data, 0));
      } else {
        console.error("❌ Error fetching movies:", response.statusText);
      }
    } catch (error) {
      console.error("❌ Error in fetchMovies:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImage = (list, index) => {
    const posterList = list[index]?.imageSet?.verticalPoster;
    if (posterList) {
      const maxPosterKey = updateMaxKey(posterList);
      return posterList[maxPosterKey];
    }
    return null;
  };

  const iterateMovie = (isLike) => {
    setCurMovieIndex(nextIndex);
    setNextIndex(nextIndex + 1);
    if (nextIndex >= moviesList.length) {
      setLoading(true);
      fetchMovies();
    } else {
      setCurMovie(moviesList[nextIndex]);
    }
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      const isLike = translationX > 0;

      if (moviesList[nextIndex]?.imageSet?.verticalPoster) {
        const posterList = moviesList[nextIndex].imageSet.verticalPoster;
        const maxPosterKey = updateMaxKey(posterList);
        setCurrentPoster(posterList[maxPosterKey]);
        setCurTitle(moviesList[nextIndex].title);
      }

      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start(() => {
        iterateMovie(isLike);
        translateX.setValue(0);
        opacity.setValue(1);
      });

      Animated.spring(translateX, {
        toValue: isLike ? 500 : -500,
        useNativeDriver: true,
        stiffness: 40,
        damping: 15,
        mass: 0.5,
        velocity: isLike ? 2 : -2,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01
      }).start();
    }
  };

  useEffect(() => {
    const loadSessionAndMovies = async () => {
      try {
        const response = await fetch(`${API_URL}/get_movie_session?sessionId=${sessionId}`);
        console.log(response)
        const sessionData = await response.json();
        console.log(sessionData)
        if (!sessionData.selectedServices) throw new Error("Invalid session data");
        setSelectedServices(sessionData.selectedServices);
        fetchMovies(sessionData.selectedServices);
      } catch (error) {
        console.error("❌ Error loading session:", error);
      }
    };
    loadSessionAndMovies();
  }, []);

  return (
    <Screen style={styles.screen}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
        <Text style={styles.backButtonText}>Back to Sessions</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.dropdownButton}
        onPress={() => setDropdownVisible(true)}
      >
        <Text style={styles.dropdownButtonText}>Select Streaming Services</Text>
        <Ionicons name="chevron-down" size={24} color="black" />
      </TouchableOpacity>

      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Streaming Services</Text>
            {Object.keys(selectedServices).map((service) => (
              <TouchableOpacity
                key={service}
                style={styles.radioButton}
                onPress={() => setSelectedServices(prev => ({ ...prev, [service]: !prev[service] }))}
              >
                <View style={styles.radio}>
                  {selectedServices[service] && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioText}>{service}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={() => setDropdownVisible(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading movies...</Text>
        </View>
      ) : (
        <GestureHandlerRootView style={styles.container}>
          {curMovie ? (
            <PanGestureHandler
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
            >
              <Animated.View
                style={[styles.posterContainer, { transform: [{ translateX }], opacity }]}
              >
                <View style={styles.debugPosterArea}>
                  <MoviePoster image={currentPoster} translateX={translateX} />
                </View>
                <Text style={styles.movieTitle}>{curTitle || "Movie Title Should Be Here"}</Text>
              </Animated.View>
            </PanGestureHandler>
          ) : (
            <View style={styles.noMovieContainer}>
              <Text style={styles.noMovieText}>No movies available</Text>
            </View>
          )}
        </GestureHandlerRootView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8f4f4", padding: 25 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  debugPosterArea: { width: 300, height: 450, alignItems: 'center', justifyContent: 'center' },
  posterContainer: { width: '100%', alignItems: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16 },
  noMovieContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noMovieText: { fontSize: 18, color: '#666' },
  movieTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
  dropdownButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', borderRadius: 10, marginBottom: 20, elevation: 5 },
  dropdownButtonText: { fontSize: 16, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  radioButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  radio: { height: 24, width: 24, borderRadius: 12, borderWidth: 2, borderColor: '#000', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  radioSelected: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#000' },
  radioText: { fontSize: 16 },
  doneButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, marginTop: 20, alignItems: 'center' },
  doneButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backButtonText: { fontSize: 16, marginLeft: 5 },
});

export default MoviePickerScreen;