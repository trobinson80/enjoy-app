import { StatusBar } from 'expo-status-bar';
//import { StyleSheet, Text, View , Image} from 'react-native';
import React from 'react';
import MoviePickerScreen from './app/screens/MoviePickerScreen';
import MoviePoster from './app/components/MoviePoster';


const posters = [
  {label:'Step Brothers', value:require('./app/assets/step-brothers.jpg')},
  {label:'The Hangover', value:require('./app/assets/the-hangover.jpg')},
  {label:'The Internship', value:require('./app/assets/the-internship.jpg')},
  {label:'Grown Ups', value:require('./app/assets/grown-ups.jpg')},
  {label:'Wedding Crashers', value:require('./app/assets/wedding-crashers.jpg')}
]

export default function App() {
  return (
    //<MoviePoster image={posters[1].value}/>
    <MoviePickerScreen />
  );
}