import { initializeApp } from "firebase/app";
import { getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCkLpjuE9-Ou1ho1_T7kXqC_tQoylpT-OM",
  authDomain: "muslimtravel-c58ed.firebaseapp.com",
  projectId: "muslimtravel-c58ed",
  storageBucket: "muslimtravel-c58ed.appspot.com",
  messagingSenderId: "1086510129841",
  appId: "1:1086510129841:web:b295a267d5b869b77cb890",
  measurementId: "G-YSVDMJCQ5B",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);

export { db };
