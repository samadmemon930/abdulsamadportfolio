// config.js
const firebaseConfig = {
    apiKey: ENV.VITE_FIREBASE_API_KEY,
    authDomain: ENV.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: ENV.VITE_FIREBASE_DATABASE_URL,
    projectId: ENV.VITE_FIREBASE_PROJECT_ID,
    storageBucket: ENV.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: ENV.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: ENV.VITE_FIREBASE_APP_ID
};

// Firebase initialize karein
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully!");
}