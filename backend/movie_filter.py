from enum import Enum
import json
import random

with open("../data-collection/movie-data/movies_hbo.json", "r") as file:
    movies = json.load(file)

class MovieFilter(Enum):
    ALL = "all"
    RECENT = "recent"
    OLD = "old"

    def get_movie_list(filter_flag=111111, num_movies=60) :
        return random.sample(movies, min(len(movies), num_movies))

