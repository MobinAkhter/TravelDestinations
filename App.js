import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect, useContext } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { UserContext } from "./contexts/userContext";
import UserProvider from "./contexts/userContext";
import { BookmarkStack } from "./navigation/AuthenticatedStack";
import { LogBox, TouchableOpacity } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { auth } from "./firebase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import UserProfileScreen from "./screens/SecondaryScreens/UserProfileScreen";
import DonationScreen from "./screens/SecondaryScreens/DonationScreen";
import ContactScreen from "./screens/SecondaryScreens/ContactScreen";
import AboutUsScreen from "./screens/SecondaryScreens/AboutUsScreen";
import { Ionicons } from "@expo/vector-icons";
import AuthenticatedStack from "./navigation/AuthenticatedStack";

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const { setUser } = props;
  const navigation = useNavigation();

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    navigation.navigate("Login");
  };
  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: "#e0f2e9" }}>
      {/* Header Logo */}
      <View
        style={{
          marginTop: 30,
          marginLeft: 20,
          marginBottom: 20,
          flexDirection: "row",
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#a8d5ba",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* <Image
            source={require("./logo.png")}
            style={{ width: 80, height: 80, borderRadius: 40 }}
          /> */}
        </View>
        <View
          style={{
            marginLeft: 16,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#30a46c" }}>
            Herb Mate
          </Text>
        </View>
      </View>

      {/* Drawer Items */}
      <DrawerItemList {...props} />
      {/* Privacy Policy Link */}
      <DrawerItem
        label="Privacy Policy"
        icon={({ color, size }) => (
          <MaterialCommunityIcons
            name="shield-lock-outline"
            size={size}
            color={color}
          />
        )}
        onPress={() =>
          Linking.openURL("https://www.iubenda.com/privacy-policy/75131283")
        }
      />
      {/* Logout */}
      <DrawerItem
        label="Logout"
        icon={({ color, size }) => (
          <Icon name="exit-outline" color={color} size={size} />
        )}
        onPress={() => {
          handleLogout();
        }}
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    marginTop: 15,
    marginLeft: 20,
    marginBottom: 20,
    flexDirection: "row",
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#a8d5ba",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    marginLeft: 16,
    justifyContent: "center",
  },
});
function DrawerNavigator() {
  const { setUser } = React.useContext(UserContext);
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => (
        <CustomDrawerContent setUser={setUser} {...props} />
      )}
      drawerStyle={{ backgroundColor: "#e0f2e9" }}
    >
      <Drawer.Screen
        name="Home"
        component={AuthenticatedStack}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="home-outline" color={color} size={size} />
          ),
          headerLeft: () => (
            <TouchableOpacity>
              <Ionicons name="bookmarks-outline" size={28} color={"white"} />
            </TouchableOpacity>
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={UserProfileScreen}
        options={({ navigation }) => ({
          headerTitle: "Your Profile",
          headerStyle: { backgroundColor: "#35D96F" },
          headerTitleAlign: "center",
          headerTintColor: "white",
          drawerIcon: ({ color, size }) => (
            <Icon name="person-outline" color={color} size={size} />
          ),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="menu-outline" size={28} />
            </TouchableOpacity>
          ),
        })}
      />
      <Drawer.Screen
        name="Bookmarks"
        component={BookmarkStack}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="bookmarks-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Donate"
        component={DonationScreen}
        options={({ navigation }) => ({
          headerTitle: "Donate",
          headerStyle: { backgroundColor: "#35D96F" },
          headerTitleAlign: "center",
          headerTintColor: "white",
          drawerIcon: ({ color, size }) => (
            <Icon name="heart-outline" color={color} size={size} />
          ),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="menu-outline" size={28} />
            </TouchableOpacity>
          ),
        })}
      />

      <Drawer.Screen
        name="Contact Us"
        component={ContactScreen}
        options={({ navigation }) => ({
          headerTitle: "Contact Us",
          headerStyle: { backgroundColor: "#35D96F" },
          headerTitleAlign: "center",
          headerTintColor: "white",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="email-outline"
              size={size}
              color={color}
            />
          ),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="menu-outline" size={28} />
            </TouchableOpacity>
          ),
        })}
      />
      <Drawer.Screen
        name="About Us"
        component={AboutUsScreen}
        options={({ navigation }) => ({
          headerTitle: "About Us",
          headerStyle: { backgroundColor: "#35D96F" },
          headerTitleAlign: "center",
          headerTintColor: "white",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-group-outline"
              size={size}
              color={color}
            />
          ),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="menu-outline" size={28} />
            </TouchableOpacity>
          ),
        })}
      />
    </Drawer.Navigator>
  );
}
function Navigation() {
  LogBox.ignoreAllLogs();

  const { user } = useContext(UserContext);
  const [appState, setAppState] = useState({
    loading: true,
    isFirstLaunch: null,
  });

  useEffect(() => {
    async function initializeApp() {
      try {
        const value = await AsyncStorage.getItem("alreadyLaunched");
        const isFirstLaunch = value === null;
        if (isFirstLaunch) {
          await AsyncStorage.setItem("alreadyLaunched", "true");
        }
        setAppState({ loading: false, isFirstLaunch });
      } catch (error) {
        console.error("Error initializing app:", error);
        setAppState({ loading: false, isFirstLaunch: false }); // Fallback state
      }
    }

    initializeApp();
  }, []);

  if (appState.loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <NavigationContainer>
      {user ? <DrawerNavigator /> : <AuthenticatedStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <UserProvider>
      <StatusBar style="light" />
      <Navigation />
    </UserProvider>
  );
}
