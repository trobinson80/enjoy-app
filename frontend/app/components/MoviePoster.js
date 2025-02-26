import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

function MoviePoster({image}) {
    console.log("🎬 MoviePoster rendering with image URL:", image);
    return (
        <View style={styles.container}>
            <Image 
                resizeMode='cover' 
                style={styles.image} 
                source={{uri: image}}
                onError={(error) => console.log("❌ Image loading error:", error.nativeEvent.error)}
                onLoad={() => console.log("✅ Image loaded successfully")}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: 300,
        height: 450,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    image: {
        width: '100%',
        height: '100%',
    }
});

export default MoviePoster;