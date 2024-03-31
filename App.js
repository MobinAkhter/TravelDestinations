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
import { Share } from "react-native";

const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : "ca-app-pub-1134256608400195/2590704352";

const Drawer = createDrawerNavigator();

const CustomDrawerItem = ({ label, navigation, targetScreen, icon }) => (
  <TouchableOpacity
    style={styles.drawerItemCustom}
    onPress={() => {
      if (typeof targetScreen === "function") {
        targetScreen();
      } else {
        navigation.navigate(targetScreen);
      }
    }}
  >
    {icon && <Ionicons name={icon} size={24} style={styles.drawerItemIcon} />}
    <Text style={styles.drawerItemLabel}>{label}</Text>
  </TouchableOpacity>
);

const CustomDrawerContent = (props) => {
  return (
    <DrawerContentScrollView {...props}>
      <SafeAreaView style={styles.drawerHeader}>
        <Image source={require("./crescent.png")} style={styles.logo} />
        <Text style={[styles.appName]}>Muslim Travel</Text>
      </SafeAreaView>

      <View style={styles.drawerItemsContainer}>
        <DrawerItemList {...props} />
      </View>
      <View style={styles.bottomDrawerSection}>
        <CustomDrawerItem
          label="Share Muslim Travel"
          navigation={props.navigation}
          targetScreen={onShare}
          icon="share-social-outline" // Ionicons name for a share icon
        />
      </View>
      <Text style={styles.version}>Version 1.0.1</Text>
    </DrawerContentScrollView>
  );
};

const onShare = async () => {
  try {
    const result = await Share.share({
      message:
        "Check out Muslim Travel app to explore Islamic heritage sites around the world! Download now and start your journey.\n\nhttps://play.google.com/store/apps/details?id=com.mobinakhter123.MuslimTravelDestinations&pcampaignid=web_share",
    });

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        // shared with activity type of result.activityType
      } else {
        // shared
      }
    } else if (result.action === Share.dismissedAction) {
      // dismissed
    }
  } catch (error) {
    alert(error.message);
  }
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
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
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

  drawerItemsContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },

  version: {
    fontSize: 14,
    textAlign: "center",
    color: "#92929d",
    paddingBottom: 10,
  },
  iconStyle: {
    width: 24,
    height: 24,
  },
  bottomDrawerSection: {
    borderTopColor: "#f4f4f4",
    borderTopWidth: 1,
    paddingTop: 10,
    paddingBottom: 20, // Added bottom padding
  },
  drawerItemCustom: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16, // Match the padding of DrawerItemList items
  },
  drawerItemIcon: {
    marginRight: 32, // Adjust based on your visual preference
  },
  drawerItemLabel: {
    fontSize: 16,
    fontWeight: "bold", // Match the font weight of DrawerItemList items
    color: "#92929d", // Match the inactive color of DrawerItemList items
  },
});
