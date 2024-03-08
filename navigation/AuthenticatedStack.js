import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import WelcomeScreen from "../screens/MainFlow/WelcomeScreen";
import RemedyListScreen from "../screens/MainFlow/RemedyListScreen";
import AboutRemedyScreen from "../screens/MainFlow/AboutRemedyScreen";
import SearchResultScreen from "../screens/SearchResultScreen";
import DonationScreen from "../screens/SecondaryScreens/DonationScreen";

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
      <Stack.Screen
        name="Welcome" // Renamed to avoid duplication
        component={WelcomeScreen}
        options={({ navigation }) => ({
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
              <Ionicons name="menu-outline" size={28} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen name="Remedies List" component={RemedyListScreen} />
      <Stack.Screen name="Remedy Details" component={AboutRemedyScreen} />
      <Stack.Screen name="Search Result" component={SearchResultScreen} />
      <Stack.Screen name="DonationScreen" component={DonationScreen} />
    </Stack.Navigator>
  );
}

export default AuthenticatedStack;
