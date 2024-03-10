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

const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : "ca-app-pub-1134256608400195/2590704352";

const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen
        name="Home"
        component={AuthenticatedStack}
        options={{
          headerShown: false,
        }}
      />
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
        {/* AdMob banner */}
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
      </NavigationContainer>
    </>
  );
}
