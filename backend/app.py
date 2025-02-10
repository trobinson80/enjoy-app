from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import auth, credentials
import os

'''
This file is currently a placeholder. Will configure the rest apis here but wanted to have my app.py file already in place
'''


app = Flask(__name__)
CORS(app)  # Allows frontend to communicate with backend

# Load Firebase credentials
cred = credentials.Certificate("firebase_service_account.json")  # Download from Firebase console
firebase_admin.initialize_app(cred)

@app.route('/protected', methods=['GET'])
def protected():
    # Verify Firebase ID token sent from frontend
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        decoded_token = auth.verify_id_token(token)
        return jsonify({'message': 'Access granted', 'user': decoded_token}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 401

if __name__ == '__main__':
    app.run(debug=True)
