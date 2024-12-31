// firebase.js
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";
import firebase from 'firebase/compat';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJpx_bn7o7l1PY2fQTFpPtjaTaqYQfYd8",
  authDomain: "mobileproje-a21ec.firebaseapp.com",
  projectId: "mobileproje-a21ec",
  storageBucket: "mobileproje-a21ec.appspot.com", // Doğru storageBucket
  messagingSenderId: "553863920300",
  appId: "1:553863920300:web:2fb99901a51f223c013d09",
  measurementId: "G-HNYQBEN4ND"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const initialAuth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
const db = getFirestore(app);

const auth = firebase.auth()

// Dışa Aktarım
export { auth, db };
export default app;
