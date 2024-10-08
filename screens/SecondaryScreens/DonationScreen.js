import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Text,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const DonationScreen = () => {
  const navigation = useNavigation();

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

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: "#35D96F",
      },
      headerTitleStyle: {
        color: "white", // Making the title white
      },
      headerTitleAlign: "center",
    });
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Support Our Mission</Text>
      <Text style={styles.explanationText}>
        Your contributions empower us to enhance this journey of discovery. With
        every donation, you become a part of our mission to illuminate the rich
        tapestry of Muslim cultures and histories. Together, we can expand our
        horizons, bringing treasured insights and destinations closer to those
        who seek them. Your support is more than a donation—it's a bridge
        connecting travelers to the vast and vibrant Muslim world.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          handleButtonPress(
            "https://www.buymeacoffee.com/muslimtravel",
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
