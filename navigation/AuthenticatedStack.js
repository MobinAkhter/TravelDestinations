import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/styles";
import { TouchableOpacity } from "react-native";
import { Platform } from "react-native";
import WelcomeScreen from "../screens/MainFlow/WelcomeScreen";
import ConditionScreen from "../screens/MainFlow/ConditionScreen";
import RemedyListScreen from "../screens/MainFlow/RemedyListScreen";
import AboutRemedyScreen from "../screens/MainFlow/AboutRemedyScreen";
import UserProfileScreen from "../screens/SecondaryScreens/UserProfileScreen";
import BookmarkScreen from "../screens/SecondaryScreens/BookmarkScreen";
import SearchResultScreen from "../screens/SearchResultScreen";
import SortedRemedies from "../screens/BottomTabs/AtoZ/SortedRemedies";
import DonationScreen from "../screens/SecondaryScreens/DonationScreen";
import PreparationScreen from "../screens/BottomTabs/Preparation/PreparationScreen";
import PreparationDetails from "../screens/BottomTabs/Preparation/PreparationDetails";
import NotesScreen from "../screens/BottomTabs/Notes/NotesScreen";
import Icon from "react-native-vector-icons/Ionicons";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#35D96F" },
        headerTintColor: "white",
        headerTitleAlign: "center",
        contentStyle: { backgroundColor: Colors.white },
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
      <Stack.Screen name="ProfileScreen" component={UserProfileScreen} />
      <Stack.Screen name="Condition List" component={ConditionScreen} />
      <Stack.Screen name="Remedies List" component={RemedyListScreen} />
      <Stack.Screen name="Remedy Details" component={AboutRemedyScreen} />
      <Stack.Screen name="Search Result" component={SearchResultScreen} />
      <Stack.Screen name="DonationScreen" component={DonationScreen} />
      <Stack.Screen name="Herb Preparation" component={PreparationScreen} />
      <Stack.Screen
        name="Herb Preparation Details"
        component={PreparationDetails}
      />
    </Stack.Navigator>
  );
}
// At this point the bugs are the initial load one, and search result
function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#35D96F" },
        headerTintColor: "white",
        headerTitleAlign: "center",
        contentStyle: { backgroundColor: Colors.white },
      }}
    >
      <Stack.Screen
        name="UserProfileScreen" // Ensured unique name
        component={UserProfileScreen}
        options={({ navigation }) => ({
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
              <Ionicons name="menu-outline" size={28} />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
}

export function BookmarkStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#35D96F" },
        headerTintColor: "white",
        headerTitleAlign: "center",
        contentStyle: { backgroundColor: Colors.white },
      }}
    >
      <Stack.Screen
        name="Your Bookmarks" // Ensured unique name
        component={BookmarkScreen}
        options={({ navigation }) => ({
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
              <Ionicons name="menu-outline" size={28} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="Remedy Details" // Ensured unique name
        component={AboutRemedyScreen}
        options={{
          headerShown: true,
          headerTitle: "Remedy Details",
          headerStyle: { backgroundColor: "#35D96F" },
          headerTintColor: "white",
        }}
      />
      <Stack.Screen
        name="BookmarkPreparationScreen"
        component={PreparationScreen}
      />
      <Stack.Screen
        name="BookmarkPreparationDetailsScreen"
        component={PreparationDetails}
      />
    </Stack.Navigator>
  );
}

// function RecommendationStack() {
//   return (
//     <Stack.Navigator
//       screenOptions={{
//         headerStyle: { backgroundColor: "#35D96F" },
//         headerTintColor: "white",
//         headerTitleAlign: "center",
//         contentStyle: { backgroundColor: Colors.white },
//       }}
//     >
//       <Stack.Screen
//         name="ViewSymptomsScreen" // Ensured unique name
//         component={ViewAllRecommendationsScreen}
//         options={({ navigation }) => ({
//           headerLeft: () => (
//             <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
//               <Ionicons name="menu-outline" size={28} />
//             </TouchableOpacity>
//           ),
//         })}
//       />
//       <Stack.Screen
//         name="AboutRecommendationSystemScreen" // Ensured unique name
//         component={DataAnalyticsScreen}
//       />
//       <Stack.Screen
//         name="SpecificQuestionScreen"
//         component={QuestionTier2Screen}
//       />
//       <Stack.Screen
//         name="EnterYourInfoScreen"
//         component={QuestionTier3Screen}
//       />
//       <Stack.Screen
//         name="SymptomDetailsReviewScreen" // Ensured unique name
//         component={RecommendedRemedyReviewScreen}
//       />
//       <Stack.Screen
//         name="ViewSymptomsDetailsScreen" // Ensured unique name
//         component={ViewRecommendationDetailScreen}
//       />
//       <Stack.Screen
//         name="RecommendedRemedyScreen" // Ensured unique name
//         component={RecommendedRemedyScreen}
//       />
//       <Stack.Screen
//         name="RecommendedRemediesScreen" // Ensured unique name
//         component={RecommendedRemediesScreen}
//       />
//       <Stack.Screen
//         name="RecommendationRemedyDetailsScreen"
//         component={AboutRemedyScreen}
//       />
//       <Stack.Screen
//         name="RecommendationPreparationScreen"
//         component={PreparationScreen}
//       />
//       <Stack.Screen
//         name="RecommendationPreparationDetailsScreen"
//         component={PreparationDetails}
//       />
//     </Stack.Navigator>
//   );
// }

function AZHerbStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#35D96F" },
        headerTintColor: "white",
        headerTitleAlign: "center",
        contentStyle: { backgroundColor: Colors.white },
      }}
    >
      <Stack.Screen
        name="A-Z Herbs" // Ensured unique name
        component={SortedRemedies}
        options={({ navigation }) => ({
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
              <Ionicons name="menu-outline" size={28} />
            </TouchableOpacity>
          ),
        })}
      />
      {/* <Stack.Screen name="Remedy Details" component={AboutRemedyScreen} /> */}
    </Stack.Navigator>
  );
}

export function PreparationStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#35D96F" },
        headerTintColor: "white",
        headerTitleAlign: "center",
        contentStyle: { backgroundColor: Colors.white },
      }}
    >
      <Stack.Screen
        name="Herbs Preparation"
        component={PreparationScreen}
        options={({ navigation }) => ({
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
              <Ionicons name="menu-outline" size={28} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen name="Preparation Details" component={PreparationDetails} />
    </Stack.Navigator>
  );
}

function NotesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#35D96F" },
        headerTintColor: "white",
        headerTitleAlign: "center",
        contentStyle: { backgroundColor: Colors.white },
      }}
    >
      <Stack.Screen
        name="Your Notes"
        component={NotesScreen}
        options={({ navigation }) => ({
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
              <Ionicons name="menu-outline" size={28} />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
}

function AuthenticatedStack() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#35D96F",
        tabBarInactiveTintColor: "#A9A9A9",
      }}
    >
      <Tab.Screen
        name="Home" // Changed for clarity and to ensure uniqueness
        component={HomeStack} // Changed to use the corrected HomeStack
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="md-home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="A-Z Herbs" // Ensured unique name
        component={AZHerbStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="md-book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Preparation" // Ensured unique name
        component={PreparationStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="eyedrop-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Notes" // Ensured unique name
        component={NotesStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="document-text-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default AuthenticatedStack;
