import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCTg_hJA20UNwS77mv7yCFxe73jEuFhIVo",
  authDomain: "fir-auth-b5f8a.firebaseapp.com",
  projectId: "fir-auth-b5f8a",
  storageBucket: "fir-auth-b5f8a.appspot.com",
  messagingSenderId: "1023645176130",
  appId: "1:1023645176130:web:8d06fbfa1bc885e90e78db",
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app);

export { db, auth };
