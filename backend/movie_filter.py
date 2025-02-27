from enum import Flag, auto
import json
import random
from pathlib import Path

class StreamingService(Flag):
    NETFLIX = auto()  # 1
    PRIME = auto()    # 2
    APPLE = auto()    # 4
    MAX = auto()      # 8
    DISNEY = auto()   # 16
    HULU = auto()     # 32

class MovieFilter:
    # Default filter includes all services (63 = 111111 in binary)
    DEFAULT_FILTER = StreamingService.NETFLIX.value | StreamingService.PRIME.value | \
                    StreamingService.APPLE.value | StreamingService.MAX.value | \
                    StreamingService.DISNEY.value | StreamingService.HULU.value
    
    def __init__(self):
        self.movie_files = {
            'NETFLIX': '../data-collection/movie-data/movies_netflix.json',
            'PRIME': '../data-collection/movie-data/movies_prime.subscription.json',
            'APPLE': '../data-collection/movie-data/movies_apple.subscription.json',
            'MAX': '../data-collection/movie-data/movies_hbo.json',
            'DISNEY': '../data-collection/movie-data/movies_disney.json',
            'HULU': '../data-collection/movie-data/movies_hulu.json'
        }
        self.movies = []
        
    def load_movies(self, selected_services):
        """Load movies from selected streaming services"""
        self.movies = []
        for service in selected_services:
            try:
                file_path = Path(self.movie_files[service])
                if file_path.exists():
                    with open(file_path, 'r') as file:
                        service_movies = json.load(file)
                        print(f"Loaded {len(service_movies)} movies from {service}")
                        self.movies.extend(service_movies)
                else:
                    print(f"Warning: Movie file for {service} not found at {file_path}")
            except Exception as e:
                print(f"Error loading movies for {service}: {str(e)}")

    @staticmethod
    def get_movie_list(filter_flag=None, num_movies=60):
        """
        Get a list of movies based on streaming service filter
        
        Args:
            filter_flag (int): Binary flag indicating selected streaming services
            num_movies (int): Number of movies to return
            
        Returns:
            list: List of movies from selected streaming services
        """
        # Use default filter (all services) if none provided or if filter is 0
        if not filter_flag:
            filter_flag = MovieFilter.DEFAULT_FILTER
            print(f"Using default filter (all services)")
        
        # Create instance to load movies
        movie_filter = MovieFilter()
        
        # Parse selected services
        selected_services = []
        for service in StreamingService:
            if filter_flag & service.value:
                selected_services.append(service.name)
        
        print(f"Selected streaming services: {selected_services}")

        # Load movies from selected services
        movie_filter.load_movies(selected_services)
        
        if not movie_filter.movies:
            print("Warning: No movies found for selected services")
            return []

        # Shuffle all movies and return the first num_movies
        all_movies = movie_filter.movies.copy()  # Create a copy to avoid modifying original
        random.shuffle(all_movies)  # Shuffle in place
        return all_movies[:num_movies]  # Return first num_movies