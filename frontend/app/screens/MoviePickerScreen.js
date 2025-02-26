import React from "react";
import Screen from "../components/Screen";
import { StyleSheet, ActivityIndicator, View, Animated, Text } from "react-native";
import MoviePoster from "../components/MoviePoster";
//import useMovies from '../hooks/useMovies';
import movieData from "../data/movies.json"; // Import JSON
import { imageMapping } from "../utils/imageMapping";
import { useState, useEffect, useRef } from "react";
import API_URL from "../../config";
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';

console.log(movieData);
console.log(imageMapping);

function MoviePickerScreen() {
  const [curMovie, setCurMovie] = useState(null);
  const [moviesList, setMoviesList] = useState([]);
  const [curMovieIndex, setCurMovieIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  
  const translateX = useRef(new Animated.Value(0)).current;

  const updateMaxKey = (verticalPoster) => {
    const currentMaxKey = Object.keys(verticalPoster).reduce((max, key) => {
      return parseInt(key.slice(1)) > parseInt(max.slice(1)) ? key : max;
    });
    return currentMaxKey;
  };

  const fetchMovies = async () => {
    try {
      console.log("🎬 Fetching movies...");
      const response = await fetch(`${API_URL}/movies?filter=111111`);
      if (response.ok) {
        const data = await response.json();
        console.log("📥 Received movies data:", data.length, "movies");
        setMoviesList(data);
        setCurMovie(data[0] || null);
        setCurMovieIndex(0);
      } else {
        console.error("❌ Error fetching movies:", response.statusText);
      }
    } catch (error) {
      console.error("❌ Error in fetchMovies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const getImage = () => {
    console.log("🖼️ Getting image for movie:", curMovie?.title);
    const posterList = curMovie?.imageSet?.verticalPoster;
    if (posterList) {
      const maxPosterKey = updateMaxKey(posterList);
      return posterList[maxPosterKey];
    }
    console.log("⚠️ No poster found for movie");
    return null;
  };

  const iterateMovie = (isLike) => {
    const nextIndex = curMovieIndex + 1;
    setCurMovieIndex(nextIndex);
    
    if (nextIndex >= 60) {
      console.log("📋 Reached end of current list, fetching new movies...");
      setLoading(true);
      fetchMovies();
    } else {
      console.log(`🎬 Showing movie ${nextIndex + 1} of 60 (${isLike ? 'Liked' : 'Disliked'})`);
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
      
      // Determine if it's a like or dislike based on swipe direction
      const isLike = translationX > 0;
      
      // Animate card off screen
      Animated.timing(translateX, {
        toValue: isLike ? 500 : -500,
        duration: 200,
        useNativeDriver: true
      }).start(() => {
        // Reset position and iterate to next movie
        translateX.setValue(0);
        iterateMovie(isLike);
      });
    }
  };

  return (
    <Screen style={styles.screen}>
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
                  },
                ]}
              >
                <View style={styles.debugPosterArea}>
                  <MoviePoster image={getImage()} />
                </View>
                <Text style={styles.movieTitle}>
                  {curMovie.title || "Movie Title Should Be Here"}
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
  }
});

export default MoviePickerScreen;
