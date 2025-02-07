import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration (replace with your actual credentials)
const firebaseConfig = {
  apiKey: 'AIzaSyDamZQFcXSNODDXymZ8KEEpw9p8bQVMnWU',
  authDomain: 'enjoy-bd18e.firebaseapp.com',
  projectId: 'enjoy-bd18e',
  storageBucket:'enjoy-bd18e.appspot.com',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
