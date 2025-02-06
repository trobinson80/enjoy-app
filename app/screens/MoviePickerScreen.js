import React from 'react';
import Screen from '../components/Screen';
import { Button, StyleSheet } from 'react-native';
import MoviePoster from '../components/MoviePoster';
//import useMovies from '../hooks/useMovies';
import movieData from '../data/movies.json'; // Import JSON
import { imageMapping } from '../utils/imageMapping';
import { useState } from 'react';

console.log(movieData)
console.log(imageMapping)

function MoviePickerScreen() {

    const [curMovie, setCurMovie] = useState(movieData[0] || null);

    const getImage = (filename) => {
        console.log('getImage: getting image for filename ', filename);

        if (!filename || !imageMapping[filename]) {
            console.error('Invalid image path: ', filename);
            return null
        }
        return imageMapping[filename]
    }

    const getRandomMovie = () => {
        const randomIndex = Math.floor(Math.random() * movieData.length);
        setCurMovie(movieData[randomIndex]);
    };

    return (
        <Screen style={styles.screen}>
            {curMovie && curMovie.path && <MoviePoster image={getImage(curMovie.path)} />}
            <Button title="Like" onPress={getRandomMovie} />
        </Screen>
    );
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: '#f8f4f4',
        padding: 60
    }
});

export default MoviePickerScreen;
