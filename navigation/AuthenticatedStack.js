import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../screens/MainFlow/WelcomeScreen";
import CityScreen from "../screens/MainFlow/CityScreen";
import DestinationScreen from "../screens/MainFlow/DestinationScreen";
import DetailedDestinationScreen from "../screens/MainFlow/DetailedDestinationScreen";
import SearchResultScreen from "../screens/SearchResultScreen";
import DonationScreen from "../screens/SecondaryScreens/DonationScreen";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SplashScreen from "../screens/Auth/SplashScreen";

const Stack = createNativeStackNavigator();

function AuthenticatedStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#35D96F" },
        headerTintColor: "white",
        headerTitleAlign: "center",
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={({ navigation }) => ({
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              accessibilityLabel="Navigation Menu"
            >
              <Ionicons name="menu-outline" size={28} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen name="Cities" component={CityScreen} />
      <Stack.Screen
        name="Significant Locations"
        component={DestinationScreen}
      />
      <Stack.Screen
        name="About Location"
        component={DetailedDestinationScreen}
      />
      <Stack.Screen name="Search Result" component={SearchResultScreen} />
      <Stack.Screen name="DonationScreen" component={DonationScreen} />
    </Stack.Navigator>
  );
}

export default AuthenticatedStack;
