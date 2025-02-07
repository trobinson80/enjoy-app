import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import fbconfig from '../../firebase-config.json'

// Your Firebase configuration (replace with your actual credentials)
const firebaseConfig = {
  apiKey: fbconfig.apiKey,
  authDomain: fbconfig.authDomain,
  projectId: fbconfig.projectId,
  storageBucket:fbconfig.storageBucket,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
