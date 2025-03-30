/**
 * Firebase Configuration 
 * 
 * IMPORTANT: Replace this with your actual Firebase config
 * You can get this from your Firebase project settings
 */

// Your Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyAKoE80NGi-FeS463s4H89lFtPU4x8PIbs",
    authDomain: "sample-firebase-ai-app-1-4eff8.firebaseapp.com",
    projectId: "sample-firebase-ai-app-1-4eff8",
    storageBucket: "sample-firebase-ai-app-1-4eff8.firebasestorage.app",
    messagingSenderId: "869552079174",
    appId: "1:869552079174:web:8cb882bd74e94955216547"
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
