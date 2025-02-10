import React, { useState, useEffect } from 'react';
//import movies from '../data/movies.json'

const useRandomMovies = () => {
  const [randomMovies, setRandomMovies] = useState([]);
  const [data, setData] = useState(null);

  useEffect(() => {
    /*
    const fetchData = async () => {
      try {
        const data = require('./data/data.json');
        
        console.log("Get JSON DATA")
        const response = await fetch('.\movies.json');
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };*/
    const e = require("./movies.json");

    setData(e.movies);

    getRandomMovies();

    return 
  }, []);

  //Function to get a random subset of movies from the list
  const getRandomMovies = () => {

    if (data != null) {
      console.log("Return JSON DATA");
      const shuffled = data.sort(() => 0.5 - Math.random());
      const selectedMovies = shuffled.slice(0, 3); // Change 3 to the desired number of random movies
      console.log(selectedMovies)
      setRandomMovies(selectedMovies);
    }
  };

  // Call the function to get random movies when the component mounts
  useState(() => {
    getRandomMovies();
  }, []);

  if (randomMovies.length == 0) {
    getRandomMovies();
  }

  return randomMovies;
};

export default useRandomMovies;