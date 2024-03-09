import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Share,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from "react-native";
import Swiper from "react-native-swiper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { countryThemeColors } from "../../constants/themeColors";

const DetailedDestinationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { country, city, locationId } = route.params;
  const [destination, setDestination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDestinationDetails = async () => {
      setIsLoading(true);
      const destinationRef = doc(
        db,
        "Countries",
        country,
        "Cities",
        city,
        "Locations",
        locationId
      );
      console.log(`Fetching details for: ${country}/${city}/${locationId}`);
      try {
        const docSnap = await getDoc(destinationRef);
        if (docSnap.exists()) {
          console.log("Fetched destination data:", docSnap.data());
          setDestination(docSnap.data());
        } else {
          console.log("No such destination found with ID:", locationId);
        }
      } catch (error) {
        console.error("Error fetching destination details:", error);
      }
      setIsLoading(false);
    };

    fetchDestinationDetails();
  }, [country, city, locationId]);

  useEffect(() => {
    const themeColor = countryThemeColors[country] || "#FFFFFF";
    navigation.setOptions({
      headerStyle: { backgroundColor: themeColor },
      headerTintColor: "#fff",
    });
    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor(themeColor);
      StatusBar.setBarStyle("light-content");
    }
  }, [country]);

  const onShare = async () => {
    if (destination) {
      try {
        const result = await Share.share({
          message: `Check out this place: ${destination.name} - ${destination.description}`,
        });
        console.log("Share result:", result);
      } catch (error) {
        console.error("Error sharing destination:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!destination) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No details available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {destination.image && destination.image.length > 0 ? (
        <Swiper height={240} activeDotColor="#FFF">
          {destination.image.map((img, index) => (
            <View key={index} style={styles.slide}>
              <Image style={styles.image} source={{ uri: img }} />
            </View>
          ))}
        </Swiper>
      ) : (
        <View style={styles.slide}>
          <Text>No Images Available</Text>
        </View>
      )}
      <View style={styles.detailSection}>
        <Text style={styles.title}>{destination.name}</Text>
        <Text style={styles.description}>{destination.description}</Text>
        {/* Display additional fields as needed */}
        <Text style={styles.info}>{destination.historicalsig}</Text>
        <Text style={styles.info}>{destination.interestinginfo}</Text>
        {/* Location and Nearloc fields might require additional formatting if they are not simple strings */}
        <Text
          style={styles.info}
        >{`Location: ${destination.location.latitude}, ${destination.location.longitude}`}</Text>
        <Text style={styles.info}>{`Nearby: ${destination.nearloc}`}</Text>
        <Text style={styles.info}>{destination.visitorinfo}</Text>

        <TouchableOpacity onPress={onShare} style={styles.shareButton}>
          <Text>Share this place</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Add your styles here
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  detailSection: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
  },
  shareButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignSelf: "center",
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

export default DetailedDestinationScreen;
