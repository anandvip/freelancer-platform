/**
 * Firebase Configuration 
 * 
 * IMPORTANT: Replace this with your actual Firebase config
 * You can get this from your Firebase project settings
 */

// Your Firebase configuration object
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firestore instance
const db = firebase.firestore();

// Get Auth instance
const auth = firebase.auth();

// Export Firebase services to make them available to other scripts
window.db = db;
window.auth = auth;
