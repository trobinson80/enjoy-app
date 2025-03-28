from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import auth, credentials
from pathlib import Path
import json
from movieLists import MovieLists

app = Flask(__name__)
CORS(app)  # Allow requests from React Native frontend

# Initialize Firebase Admin SDK
cred = credentials.Certificate("../firebaseServiceAccountKey.json")  # Update with your Firebase service account JSON file
firebase_admin.initialize_app(cred)

ml = MovieLists()

@app.route("/login", methods=["POST"])
def login():
    try:
        # data = request.get_json() # placeholder if we ever decide to put data in the request body
        id_token = request.headers.get("Authorization").split("Bearer ")[-1]  # Extract token
        print("hello")
        print(movieLists.movies_lists["NETFLIX"])
        # Verify Firebase token
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token["uid"]
        email = decoded_token.get("email", "No email found")

        return jsonify({"message": "Authenticated", "uid": uid, "email": email}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 401

@app.route("/movies", methods=["GET"])
def get_movies():
    try:
        # Get filter parameter and convert to int, default to None instead of '0'
        filter_param = request.args.get('filter', default=None)
        filter_value = int(filter_param) if filter_param is not None else None
        # Log the filter value in binary for debugging
        if filter_value is not None:
            print(f"Received filter: {bin(filter_value)[2:].zfill(6)}")
        else:
            print("No filter provided, using default (all services)")    
        
        # Pass the filter value to get_movie_list
        movies = ml.get_movies(filter_value, 60)
        movie_len = str(len(movies))
        print("Movie Length: " + movie_len)
        return jsonify(movies), 200
    except Exception as e:
        print(f"Error in /movies endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
