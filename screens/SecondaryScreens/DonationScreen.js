import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Text,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const DonationScreen = () => {
  const handleButtonPress = (url, platformName) => {
    Alert.alert(
      "Redirecting...",
      `You will be redirected to ${platformName} to complete your donation. If you have the app installed, it will open. Otherwise, your web browser will be used.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        { text: "Continue", onPress: () => Linking.openURL(url) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Support Our Mission</Text>
      <Text style={styles.explanationText}>
        Your support allows us to continue sharing the profound benefits of
        herbs, advancing our app, and keeping it free of ads. Every cup of
        coffee you buy us fuels our passion and ability to bring ancient herbal
        wisdom to the palm of your hand.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          handleButtonPress(
            "https://www.buymeacoffee.com/herbmateine",
            "Buy Me A Coffee"
          )
        }
      >
        <Ionicons name="md-cafe" size={24} color="white" />
        <Text style={styles.buttonText}>Buy Me A Coffee</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#E5E5E5",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#34A853",
    marginBottom: 20,
    textAlign: "center",
  },
  explanationText: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
    color: "#333",
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#35D96F",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    marginLeft: 10,
  },
});

export default DonationScreen;
