import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../screens/MainFlow/WelcomeScreen";
import ConditionScreen from "../screens/MainFlow/ConditionScreen";
import RemedyListScreen from "../screens/MainFlow/RemedyListScreen";
import AboutRemedyScreen from "../screens/MainFlow/AboutRemedyScreen";
import SearchResultScreen from "../screens/SearchResultScreen";
import DonationScreen from "../screens/SecondaryScreens/DonationScreen";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Stack = createNativeStackNavigator();

function AuthenticatedStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#35D96F" },
        headerTintColor: "white",
        headerTitleAlign: "center",
        contentStyle: { backgroundColor: "WHITE" },
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={({ navigation }) => ({
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
              <Ionicons name="menu-outline" size={28} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen name="Condition List" component={ConditionScreen} />
      <Stack.Screen name="Remedies List" component={RemedyListScreen} />
      <Stack.Screen name="Remedy Details" component={AboutRemedyScreen} />
      <Stack.Screen name="Search Result" component={SearchResultScreen} />
      <Stack.Screen name="DonationScreen" component={DonationScreen} />
    </Stack.Navigator>
  );
}

export default AuthenticatedStack;
