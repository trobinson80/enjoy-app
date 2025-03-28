import json
from pathlib import Path
from enum import Enum
import random

class ServiceFlag(Enum):
    NETFLIX = "NETFLIX"
    PRIME = "PRIME"
    APPLE = "APPLE"
    MAX = "MAX"
    DISNEY = "DISNEY"
    HULU = "HULU"

class MovieLists:
    movies_lists = {}

    def __init__(self):
        self.services = ["NETFLIX", "PRIME", "APPLE", "MAX", "DISNEY", "HULU"]
        self.movie_files = {
            'NETFLIX': '../data-collection/movie-data/movies_netflix.json',
            'PRIME': '../data-collection/movie-data/movies_prime.subscription.json',
            'APPLE': '../data-collection/movie-data/movies_apple.subscription.json',
            'MAX': '../data-collection/movie-data/movies_hbo.json',
            'DISNEY': '../data-collection/movie-data/movies_disney.json',
            'HULU': '../data-collection/movie-data/movies_hulu.json'
        }
        self.load_movies(self.services)

    def load_movies(self, selected_services):
        """Load movies from selected streaming services"""
        for service in selected_services:
            try:
                file_path = Path(self.movie_files.get(service, ""))
                if file_path.exists():
                    with open(file_path, 'r') as file:
                        service_movies = json.load(file)
                        print(f"Loaded {len(service_movies)} movies from {service}")
                        self.movies_lists[service] = service_movies
                else:
                    print(f"Warning: Movie file for {service} not found at {file_path}")
            except Exception as e:
                print(f"Error loading movies for {service}: {str(e)}")
    
    def get_movies(self, service_flags: int, return_length: int):
            """Retrieve a random selection of up to 60 movies based on an integer flag"""
            all_movies = []
            services = [ServiceFlag.NETFLIX, ServiceFlag.PRIME, ServiceFlag.APPLE, 
                        ServiceFlag.MAX, ServiceFlag.DISNEY, ServiceFlag.HULU]
            print(service_flags)
            for i, service in enumerate(services):
                if service_flags & (1 << i):  # Check if the bit at position i is set
                    all_movies.extend(self.movies_lists.get(service.value, []))
                    print(service.value)
            
            return random.sample(all_movies, return_length)