import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import AuthenticatedStack from "./navigation/AuthenticatedStack";
import AboutUsScreen from "./screens/SecondaryScreens/AboutUsScreen";
import ContactScreen from "./screens/SecondaryScreens/ContactScreen";
import DonationScreen from "./screens/SecondaryScreens/DonationScreen";
import { StatusBar } from "expo-status-bar";
import "expo-dev-client";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : "ca-app-pub-1134256608400195/2590704352";

const Drawer = createDrawerNavigator();

const CustomDrawerItem = ({ label, navigation, targetScreen }) => (
  <TouchableOpacity
    style={styles.drawerItem}
    onPress={() => navigation.navigate(targetScreen)}
  >
    <Text style={styles.drawerItemLabel}>{label}</Text>
  </TouchableOpacity>
);

const CustomDrawerContent = (props) => {
  return (
    <DrawerContentScrollView {...props}>
      <SafeAreaView style={styles.drawerHeader}>
        <Image source={require("./crescent.jpeg")} style={styles.logo} />
        <Text style={[styles.appName]}>Muslim Travel</Text>
      </SafeAreaView>
      <View style={styles.drawerItemsContainer}>
        <DrawerItemList {...props} />
        {/* Additional custom drawer items here if needed */}
      </View>
      <Text style={styles.version}>Version 1.0.0</Text>
      {/* Replace with your current app version */}
    </DrawerContentScrollView>
  );
};

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: "#5E72E4", // Default active tint color, can be overridden by country-specific colors
        drawerInactiveTintColor: "#92929d",
        drawerLabelStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={AuthenticatedStack}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen name="Donate" component={DonationScreen} />
      <Drawer.Screen name="Contact Us" component={ContactScreen} />
      {/* <Drawer.Screen name="About Us" component={AboutUsScreen} /> */}
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <DrawerNavigator />
        {/* AdMob banner */}
        {/* <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        /> */}
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
    backgroundColor: "white",
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  appName: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  drawerItem: {
    height: 48,
    justifyContent: "center",
    marginHorizontal: 10,
  },
  drawerItemLabel: {
    fontSize: 16,
  },
  drawerItemsContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  drawerItem: {
    // ... existing styles
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  drawerItemLabel: {
    // ... existing styles
    marginLeft: 15,
  },
  version: {
    fontSize: 14,
    textAlign: "center",
    color: "#92929d",
    paddingBottom: 10,
  },
  // If you've added custom icons
  iconStyle: {
    width: 24,
    height: 24,
  },
  // ... other styles
});
