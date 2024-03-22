import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const SplashScreen = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0);

  useEffect(() => {
    StatusBar.setBarStyle("light-content");
    navigation.setOptions({ headerTitle: "Muslim Travel" }); // Set the header title

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace("Welcome");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#f2f2f2", "#d4e9e2"]} style={styles.background}>
        <Animated.Image
          source={require("../../crescent.png")}
          resizeMode="contain"
          style={[
            styles.logo,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        />
        <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
          Embark on a Journey
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
          Unveil the Heritage of Islam with Muslim Travel
        </Animated.Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: width * 0.6, // Reduced logo size
    height: width * 0.6, // Keep the aspect ratio
    marginBottom: 30, // Increased spacing between logo and text
  },
  title: {
    fontSize: 24, // Slightly reduced font size for title
    fontWeight: "bold", // Bold font weight for title
    color: "#3A5A40",
    textShadowColor: "rgba(0, 0, 0, 0.25)", // Lighter text shadow for subtlety
    textShadowOffset: { width: 0, height: 1 }, // Reduced shadow offset
    textShadowRadius: 3, // Reduced shadow spread
  },
  subtitle: {
    fontSize: 16, // Subtitle font size remains the same
    color: "#3A5A40",
    fontStyle: "italic", // Maintain italic style for subtitle
    textShadowColor: "rgba(0, 0, 0, 0.25)", // Lighter text shadow for subtlety
    textShadowOffset: { width: 0, height: 1 }, // Reduced shadow offset
    textShadowRadius: 3, // Reduced shadow spread
  },
});

export default SplashScreen;
