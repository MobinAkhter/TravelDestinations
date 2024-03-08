import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import AuthenticatedStack from "./navigation/AuthenticatedStack"; // Adjust the path as needed
import AboutUsScreen from "./screens/SecondaryScreens/AboutUsScreen";
import ContactScreen from "./screens/SecondaryScreens/ContactScreen";
import DonationScreen from "./screens/SecondaryScreens/DonationScreen";
import { StatusBar } from "expo-status-bar";

const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Home" component={AuthenticatedStack} />
      {/* Add more Drawer.Screen components for other screens */}
      <Drawer.Screen name="Donate" component={DonationScreen} />
      <Drawer.Screen name="Contact Us" component={ContactScreen} />
      <Drawer.Screen name="About Us" component={AboutUsScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <DrawerNavigator />
      </NavigationContainer>
    </>
  );
}
