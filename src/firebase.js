// Import the necessary Firebase modules
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// Import other Firebase services as needed (e.g., auth, storage)

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCai3Vo2v5CcXvNZNHA_rfCRxRiPsuazmE",
  authDomain: "token-showcase.firebaseapp.com",
  projectId: "token-showcase",
  storageBucket: "token-showcase.firebasestorage.app",
  messagingSenderId: "1052474685254",
  appId: "1:1052474685254:web:190c4dae24be67cc1ad747"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (or any other service)
const db = getFirestore(app);

export { db }; // Export for use in other parts of your application
