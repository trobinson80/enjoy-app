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
        friend_request_uids = user_data.get("friendRequests", [])
        friend_uids = user_data.get("Friends", [])

        # Fetch names for friend requests
        friend_requests = []
        for rid in friend_request_uids:
            r_doc = db.collection("users").document(rid).get()
            if r_doc.exists:
                r_data = r_doc.to_dict()
                friend_requests.append({
                    "uid": rid,
                    "name": r_data.get("name", "Unknown")
                })

        # Fetch names for existing friends
        friends = []
        for fid in friend_uids:
            f_doc = db.collection("users").document(fid).get()
            if f_doc.exists:
                f_data = f_doc.to_dict()
                friends.append({
                    "uid": fid,
                    "name": f_data.get("name", "Unknown")
                })

        return jsonify({
            "friendRequests": friend_requests,
            "friends": friends
        }), 200

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
    
@app.route("/confirm_friend_request", methods=["POST"])
def confirm_friend_request():
    try:
        data = request.get_json()
        current_uid = data.get("current_uid")
        requester_uid = data.get("requester_uid")

        if not current_uid or not requester_uid:
            return jsonify({"error": "Both user IDs are required"}), 400

        current_user_ref = db.collection("users").document(current_uid)
        requester_user_ref = db.collection("users").document(requester_uid)

        current_user_ref.update({
            "Friends": firestore.ArrayUnion([requester_uid]),
            "friendRequests": firestore.ArrayRemove([requester_uid])
        })

        requester_user_ref.update({
            "Friends": firestore.ArrayUnion([current_uid]),
            "friendRequests": firestore.ArrayRemove([current_uid])
        })

        return jsonify({"message": "Friend request confirmed"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/decline_friend_request", methods=["POST"])
def decline_friend_request():
    try:
        data = request.get_json()
        current_uid = data.get("current_uid")
        requester_uid = data.get("requester_uid")

        if not current_uid or not requester_uid:
            return jsonify({"error": "Both user IDs are required"}), 400

        current_user_ref = db.collection("users").document(current_uid)
        requester_user_ref = db.collection("users").document(requester_uid)

        current_user_ref.update({
            "friendRequests": firestore.ArrayRemove([requester_uid])
        })

        requester_user_ref.update({
            "friendRequests": firestore.ArrayRemove([current_uid])
        })

        current_user_ref.update({
            "Friends": firestore.ArrayRemove([requester_uid])
        })

        requester_user_ref.update({
            "Friends": firestore.ArrayRemove([current_uid])
        })

        return jsonify({"message": "Friend request declined or friend removed"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/create_movie_session", methods=["POST"])
def create_movie_session():
    try:
        data = request.get_json()
        owner = data.get("owner")
        invited_friend = data.get("invitedFriend")
        selected_services = data.get("selectedServices")

        if not owner or not selected_services:
            return jsonify({"error": "Missing required fields"}), 400

        # Create a new session doc with auto ID
        session_ref = db.collection("sessions").document()
        session_data = {
            "sessionId": session_ref.id,
            "owner": owner,
            "invitedFriend": invited_friend,
            "selectedServices": selected_services,
            "likedMovies": [],
            "dislikedMovies": [],
            "createdAt": firestore.SERVER_TIMESTAMP
        }
        session_ref.set(session_data)

        return jsonify({"message": "Session created", "sessionId": session_ref.id}), 200

    except Exception as e:
        print(f"❌ Error creating session: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/get_movie_session", methods=["GET"])
def get_movie_session():
    try:
        session_id = request.args.get("sessionId")
        if not session_id:
            return jsonify({"error": "Missing sessionId"}), 400

        session_ref = db.collection("sessions").document(session_id)
        session_doc = session_ref.get()

        if not session_doc.exists:
            return jsonify({"error": "Session not found"}), 404

        session_data = session_doc.to_dict()
        return jsonify(session_data), 200

    except Exception as e:
        print(f"❌ Error fetching movie session: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/movie_sessions", methods=["GET"])
def get_movie_sessions():
    try:
        uid = request.args.get("uid")
        if not uid:
            return jsonify({"error": "User ID is required"}), 400

        sessions_ref = db.collection("sessions")
        # Query where user is either the owner or invitedFriend
        owned_sessions = sessions_ref.where("owner", "==", uid).stream()
        invited_sessions = sessions_ref.where("invitedFriend", "==", uid).stream()

        all_sessions = []
        for session_doc in list(owned_sessions) + list(invited_sessions):
            session_data = session_doc.to_dict()
            invited_uid = session_data.get("invitedFriend")

            # Attempt to get invited friend's name (if exists)
            invited_friend_name = None
            if invited_uid:
                invited_doc = db.collection("users").document(invited_uid).get()
                if invited_doc.exists:
                    invited_friend_name = invited_doc.to_dict().get("name", "Unknown")

            all_sessions.append({
                "sessionId": session_data.get("sessionId"),
                "owner": session_data.get("owner"),
                "invitedFriend": invited_uid,
                "invitedFriendName": invited_friend_name,
                "selectedServices": session_data.get("selectedServices", {}),
                "createdAt": session_data.get("createdAt")
            })

        return jsonify({"sessions": all_sessions}), 200

    except Exception as e:
        print(f"❌ Error fetching sessions: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/delete_session", methods=["DELETE"])
def delete_session():
    try:
        data = request.get_json()
        session_id = data.get("sessionId")

        if not session_id:
            return jsonify({"error": "Missing sessionId"}), 400

        session_ref = db.collection("sessions").document(session_id)
        if not session_ref.get().exists:
            return jsonify({"error": "Session not found"}), 404

        session_ref.delete()
        return jsonify({"message": "Session deleted"}), 200

    except Exception as e:
        print(f"❌ Error deleting session: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)