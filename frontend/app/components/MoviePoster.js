import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

function MoviePoster({image}) {
    return (
        <View >
            <Image resizeMode='contain' style={styles.image} source={{uri : image}}/>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000',
        flex: 1
    },
    image: {
        width: '100%',
        height: '100%'
    }
})

export default MoviePoster;