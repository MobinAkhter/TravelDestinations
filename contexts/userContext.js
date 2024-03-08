import React, { useEffect, useState, createContext } from "react";
import * as Notifications from "expo-notifications";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

export const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    if (user) {
      saveTokenToDatabase(user);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        if (firebaseUser.emailVerified) {
          setUser(firebaseUser);
        } else {
          // Handle unverified email case here
          console.log("Please verify your email");
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.warn("Failed to get push token for push notification.");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", token);
  }

  async function saveTokenToDatabase(currentUser) {
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        expoPushToken: token,
      });
      console.log("Token saved to database");
    } catch (error) {
      console.error("Error saving token to database:", error);
    }
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserProvider;
