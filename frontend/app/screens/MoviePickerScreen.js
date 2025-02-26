import React from "react";
import Screen from "../components/Screen";
import { Button, StyleSheet, ActivityIndicator, View } from "react-native";
import MoviePoster from "../components/MoviePoster";
//import useMovies from '../hooks/useMovies';
import movieData from "../data/movies.json"; // Import JSON
import { imageMapping } from "../utils/imageMapping";
import { useState, useEffect } from "react";
import API_URL from "../../config";

console.log(movieData);
console.log(imageMapping);

function MoviePickerScreen() {
  const [curMovie, setCurMovie] = useState(null);
  const [moviesList, setMoviesList] = useState([]); // To store movies from API
  const [curMovieIndex, setCurMovieIndex] = useState(-1); // Change to -1
  const [loading, setLoading] = useState(true); // Track loading state

  // Fetch the list of movies from the API when the component mounts
  const fetchMovies = async () => {
    try {
      const response = await fetch(`${API_URL}/movies?filter=111111`); // Adjust your API endpoint
      if (response.ok) {
        const data = await response.json();
        setMoviesList(data); // Set movies list in state
        setCurMovie(data[0] || null); // Set first movie as the current movie
        setCurMovieIndex(0);
        setLoading(false); // Stop loading once data is fetched
      } else {
        console.error("Error fetching movies: ", response.statusText);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching movies: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const getImage = () => {
    const posterList = curMovie?.imageSet?.verticalPoster;
    if (posterList != null) {
      const maxPosterKey = updateMaxKey(posterList);
      curImage = posterList[maxPosterKey];
    }

    return curImage;
  };

  function updateMaxKey(verticalPoster) {
    const currentMaxKey = Object.keys(verticalPoster).reduce((max, key) => {
      return parseInt(key.slice(1)) > parseInt(max.slice(1)) ? key : max;
    });
    return currentMaxKey;
  }

  const iterateMovie = () => {
    const nextIndex = curMovieIndex + 1;
    setCurMovieIndex(nextIndex);
    
    if (nextIndex >= 60) {
      console.log("📋 Reached end of current list, fetching new movies...");
      setLoading(true);
      fetchMovies();
    } else {
      console.log(`🎬 Showing movie ${nextIndex + 1} of 60`);
      setCurMovie(moviesList[nextIndex]);
    }
  };

  return (
    <Screen style={styles.screen}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <>
          {curMovie && <MoviePoster image={getImage()} />}
          <View style={styles.buttonContainer}>
            <Button title="Dislike" onPress={iterateMovie} color="red" />
            <Button title="Like" onPress={iterateMovie} />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    marginBottom: 50,
    backgroundColor: "#f8f4f4",
    padding: 25,
  },
  buttonContainer: {
    flexDirection: 'row',  // Places buttons side by side
    justifyContent: 'space-evenly',  // Adds spacing between buttons
    marginBottom: 10,  // Adjust spacing from the movie poster
  }
});

export default MoviePickerScreen;
