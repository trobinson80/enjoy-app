// src/hooks/useMovies.js
import { useState, useEffect } from 'react';
import moviesData from './movies.json'; // Adjust the path as needed

const useMovies = () => {
  const [movies, setMovies] = useState(moviesData.movies);

  useEffect(() => {
    // Here you would normally fetch data from an API
    // For local JSON files, just set the imported data
    setMovies(moviesData.movies);
  }, []);

  /*
  const refillMovies = () => {
    const movieList = moviesData.movies;
    const shuffled = movieList.sort(() => 0.5 - Math.random());
    const selectedMovies = shuffled.slice(0, 3); // Change 3 to the desired number of random movies
    return selectedMovies;
  }*/

  //return { movies, refillMovies };
  return movies
};

export default useMovies;
