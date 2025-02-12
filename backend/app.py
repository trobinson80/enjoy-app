from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import auth, credentials

app = Flask(__name__)
CORS(app)  # Allow requests from React Native frontend

# Initialize Firebase Admin SDK
cred = credentials.Certificate("../firebaseServiceAccountKey.json")  # Update with your Firebase service account JSON file
firebase_admin.initialize_app(cred)


@app.route("/login", methods=["POST"])
def login():
    try:
        # data = request.get_json() # placeholder if we ever decide to put data in the request body
        id_token = request.headers.get("Authorization").split("Bearer ")[-1]  # Extract token

        # Verify Firebase token
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token["uid"]
        email = decoded_token.get("email", "No email found")

        return jsonify({"message": "Authenticated", "uid": uid, "email": email}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 401


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
