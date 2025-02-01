import React from 'react';
import Screen from '../components/Screen';
import { Button, StyleSheet } from 'react-native';
import MoviePoster from '../components/MoviePoster';
//import useMovies from '../hooks/useMovies';
import { useState } from 'react';

const movies = [
    {
        title: "Step Brothers",
        path: require('../assets/step-brothers.jpg')
    },
    {
        title: "The Hangover",
        path: require('../assets/the-hangover.jpg')
    },
    {
        title: "The Internship",
        path: require('../assets/the-internship.jpg')
    },
    {
        title: "Grown Ups",
        path: require('../assets/grown-ups.jpg')
    },
    {
        title: "Wedding Crashers",
        path: require('../assets/wedding-crashers.jpg')
    }
]
/*
const setMovieList = () => {
    let shuffledList = movies;
    shuffledList = shuffledList.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}*/

function MoviePickerScreen(props) {

    const [curMovie, setCurMovie] = useState([]);
    const [movieList, setMovieList] = useState([]);

    console.log(curMovie);

    return (
        <Screen style={styles.screen}>
            <MoviePoster image={curMovie.path}/>
            <Button title='Like' onPress={() => {setCurMovie(movies.pop())}}/>
        </Screen>
    );
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: '#f8f4f4',
        padding: 60
    },
})

export default MoviePickerScreen;