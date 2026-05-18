// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "dora-ai-2dc53.firebaseapp.com",
    projectId: "dora-ai-2dc53",
    storageBucket: "dora-ai-2dc53.firebasestorage.app",
    messagingSenderId: "782415055058",
    appId: "1:782415055058:web:48e776a575fa246d8a050b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider();

export { auth, provider }