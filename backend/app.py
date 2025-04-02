from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase_admin import firestore  # Import Firestore module
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

db = firestore.client()  # Initialize Firestore client

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

@app.route("/search_users", methods=["GET"])
def search_users():
    try:
        query = request.args.get("query", "").strip().lower()
        print(query)
        if not query:
            return jsonify({"error": "Query cannot be empty"}), 400

        users_ref = db.collection("users")  # Firestore collection
        matching_users = []

        # Query Firestore for users with name or email containing `query`
        users = users_ref.stream()
        for user in users:
            user_data = user.to_dict()
            if query in user_data.get("name", "").lower() or query in user_data.get("email", "").lower():
                matching_users.append({
                    "uid": user.id,
                    "name": user_data.get("name", "Unknown"),
                    "email": user_data.get("email", "No email"),
                })

        return jsonify({"users": matching_users}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/add_friend", methods=["POST"])
def add_friend():
    try:
        data = request.get_json()
        current_uid = data.get("current_uid")  # Assume frontend sends current user ID
        target_uid = data.get("target_uid")
        print(current_uid)
        print(target_uid)
        
        if not current_uid or not target_uid:
            return jsonify({"error": "Both current and target user IDs are required"}), 400
        
        target_user_ref = db.collection("users").document(target_uid)
        target_user_ref.update({"friendRequests": firestore.ArrayUnion([current_uid])})
        
        return jsonify({"message": "Friend request sent"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/friend_requests", methods=["GET"])
def get_friend_requests():
    try:
        uid = request.args.get("uid")
        if not uid:
            return jsonify({"error": "User ID is required"}), 400
        
        user_ref = db.collection("users").document(uid)
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404
        
        user_data = user_doc.to_dict()
        friend_requests = user_data.get("friendRequests", [])

        return jsonify({"friendRequests": friend_requests}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get_user", methods=["GET"])
def get_user():
    try:
        uid = request.args.get("uid")
        if not uid:
            return jsonify({"error": "User ID is required"}), 400
        print(uid)
        user_ref = db.collection("users").document(uid)
        print(user_ref)
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404
        
        user_data = user_doc.to_dict()
        return jsonify({"uid": uid, "name": user_data.get("name", "Unknown")}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)