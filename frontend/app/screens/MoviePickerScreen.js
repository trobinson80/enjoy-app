import React, { useState, useRef } from "react";
import Screen from "../components/Screen";
import { StyleSheet, ActivityIndicator, View, Animated, Text, Modal, TouchableOpacity, Pressable } from "react-native";
import MoviePoster from "../components/MoviePoster";
//import useMovies from '../hooks/useMovies';
import movieData from "../data/movies.json"; // Import JSON
import { imageMapping } from "../utils/imageMapping";
import { useEffect } from "react";
import API_URL from "../../config";
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

console.log(movieData);
console.log(imageMapping);

function MoviePickerScreen() {
  const [curMovie, setCurMovie] = useState(null);
  const [moviesList, setMoviesList] = useState([]);
  const [curMovieIndex, setCurMovieIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [currentPoster, setCurrentPoster] = useState(null);  // Only keeping this state
  const [nextIndex, setNextIndex] = useState(0);
  const [curTitle, setCurTitle] = useState("");
  const [selectedServices, setSelectedServices] = useState({
    Netflix: false,  // 1     (000001)
    Prime: false,    // 2     (000010)
    Apple: false,    // 4     (000100)
    Max: false,      // 8     (001000)
    Disney: false,   // 16    (010000)
    Hulu: false      // 32    (100000)
  });
  
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const updateMaxKey = (verticalPoster) => {
    const currentMaxKey = Object.keys(verticalPoster).reduce((max, key) => {
      return parseInt(key.slice(1)) > parseInt(max.slice(1)) ? key : max;
    });
    return currentMaxKey;
  };

  const getFilterValue = () => {
    const serviceValues = {
      Netflix: 1,
      Prime: 2,
      Apple: 4,
      Max: 8,
      Disney: 16,
      Hulu: 32
    };

    return Object.entries(selectedServices)
      .reduce((acc, [service, isSelected]) => {
        return acc + (isSelected ? serviceValues[service] : 0);
      }, 0);
  };

  const fetchMovies = async () => {
    try {
      const filterValue = getFilterValue();
      console.log("🎬 Fetching movies with filter:", filterValue.toString(2).padStart(6, '0'));
      const response = await fetch(`${API_URL}/movies?filter=${filterValue}`);
      if (response.ok) {
        const data = await response.json();
        console.log("📥 Received movies data:", data.length, "movies");
        setMoviesList(data);
        setCurMovie(data[0] || null);
        setCurMovieIndex(0);
        setNextIndex(1);
        setCurrentPoster(getImage(0));
      } else {
        console.error("❌ Error fetching movies:", response.statusText);
      }
    } catch (error) {
      console.error("❌ Error in fetchMovies:", error);
    } finally {
      setLoading(false);
    }
  };

  const iterateMovie = (isLike) => {
    setCurMovieIndex(nextIndex);
    setNextIndex(nextIndex + 1);
    if (nextIndex >= 60) {
      console.log("📋 Reached end of current list, fetching new movies...");
      setLoading(true);
      fetchMovies();
    } else {
      console.log(`🎬 Showing movie ${nextIndex + 1} of 60 (${isLike ? 'Liked' : 'Disliked'})`);
      setCurMovie(moviesList[curMovieIndex]);
    }
  };

  const getImage = (index) => {
    const posterList = moviesList[index]?.imageSet?.verticalPoster;
    if (posterList) {
      const maxPosterKey = updateMaxKey(posterList);
      return posterList[maxPosterKey];
    }
    console.log("⚠️ No poster found for movie");
    return null;
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      const isLike = translationX > 0;
      
      console.log(`👆 Swipe registered: ${isLike ? '👍 LIKE' : '👎 DISLIKE'} for "${curMovie.title}"`);
      
      // Set current image from nextMovie's poster immediately
      if (moviesList[nextIndex]?.imageSet?.verticalPoster) {
        const posterList = moviesList[nextIndex].imageSet.verticalPoster;
        const maxPosterKey = Object.keys(posterList).reduce((max, key) => {
          return parseInt(key.slice(1)) > parseInt(max.slice(1)) ? key : max;
        });
        setCurrentPoster(posterList[maxPosterKey]);
        setCurTitle(moviesList[nextIndex].title);
      }
      
      // First fade out and slide away
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start(() => {
        iterateMovie(isLike);
        translateX.setValue(0);
        opacity.setValue(1);
      });

      // Slide animation happens in parallel
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

  // Initial fetch only
  useEffect(() => {
    fetchMovies();
    setCurrentPoster(getImage(0));
  }, []); // Empty dependency array means it only runs once on mount

  // Set initial movies when moviesList changes
  useEffect(() => {
    if (moviesList.length > 0) {
      setCurMovie(moviesList[0]);
      setNextIndex(1);
      setCurTitle(moviesList[0].title);
      // Set initial poster from first movie
      if (moviesList[0]?.imageSet?.verticalPoster) {
        const posterList = moviesList[0].imageSet.verticalPoster;
        const maxPosterKey = Object.keys(posterList).reduce((max, key) => {
          return parseInt(key.slice(1)) > parseInt(max.slice(1)) ? key : max;
        });
        setCurrentPoster(posterList[maxPosterKey]);
      }
    }
  }, [moviesList]);

  const toggleService = (service) => {
    setSelectedServices(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  return (
    <Screen style={styles.screen}>
      {/* Streaming Services Dropdown */}
      <TouchableOpacity 
        style={styles.dropdownButton}
        onPress={() => setDropdownVisible(true)}
      >
        <Text style={styles.dropdownButtonText}>Select Streaming Services</Text>
        <Ionicons name="chevron-down" size={24} color="black" />
      </TouchableOpacity>

      {/* Dropdown Modal */}
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
                onPress={() => toggleService(service)}
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
                style={[
                  styles.posterContainer,
                  {
                    transform: [{ translateX }],
                    opacity
                  },
                ]}
              >
                <View style={styles.debugPosterArea}>
                  <MoviePoster 
                    image={currentPoster} 
                    translateX={translateX}
                  />
                </View>
                <Text style={styles.movieTitle}>
                  {curTitle || "Movie Title Should Be Here"}
                </Text>
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
  screen: {
    flex: 1,
    backgroundColor: "#f8f4f4",
    padding: 25,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  debugPosterArea: {
    width: 300,
    height: 450,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  noMovieContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMovieText: {
    fontSize: 18,
    color: '#666',
  },
  movieTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radio: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000',
  },
  radioText: {
    fontSize: 16,
  },
  doneButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MoviePickerScreen;
