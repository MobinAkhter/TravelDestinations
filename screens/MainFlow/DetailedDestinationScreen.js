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
  Linking,
} from "react-native";
import Swiper from "react-native-swiper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { countryThemeColors } from "../../constants/themeColors";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Modal } from "react-native";
import { PinchGestureHandler, State } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const openMaps = (lat, lng, label) => {
  // Depending on the platform, the URL scheme may differ
  const scheme = Platform.select({
    ios: "maps:0,0?q=",
    android: "geo:0,0?q=",
  });
  const latLng = `${lat},${lng}`;
  const url = Platform.select({
    ios: `${scheme}${label}@${latLng}`,
    android: `${scheme}${latLng}(${label})`,
  });

  Linking.openURL(url);
};

const DetailedDestinationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { country, city, locationId } = route.params;
  const [destination, setDestination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const scale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const pinchHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      scale.value = event.scale;
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    },
    onEnd: () => {
      scale.value = withTiming(1); // Optional: animate the scale back to 1 when the gesture ends
    },
  });

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: focalX.value },
      { translateY: focalY.value },
      { scale: scale.value },
      { translateX: -focalX.value },
      { translateY: -focalY.value },
    ],
  }));

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
      // console.log(`Fetching details for: ${country}/${city}/${locationId}`);
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
    if (destination) {
      navigation.setOptions({
        title: destination.name, // Set the header title to the destination name
      });
    }
  }, [destination, navigation]);

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
  const openImageFullScreen = (img) => {
    setSelectedImage(img);
    setModalVisible(true);
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
            <TouchableOpacity
              key={index}
              style={styles.slide}
              onPress={() => openImageFullScreen(img)}
              accessible={true}
              accessibilityLabel={`Image ${index + 1} for ${destination.name}`}
            >
              <Image style={styles.image} source={{ uri: img }} />
            </TouchableOpacity>
          ))}
        </Swiper>
      ) : (
        <View style={styles.slide}>
          <Text style={styles.noImageText}>No Images Available</Text>
        </View>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <PinchGestureHandler
              onGestureEvent={pinchHandler}
              onHandlerStateChange={pinchHandler}
            >
              <Animated.Image
                style={[styles.fullScreenImage, animatedImageStyle]}
                source={{ uri: selectedImage }}
              />
            </PinchGestureHandler>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.detailSection}>
        <Text style={styles.title}>{destination.name}</Text>
        <Text style={styles.description}>{destination.description}</Text>
        {/* Display additional fields as needed */}
        <Text style={styles.info}>{destination.historical}</Text>
        <Text style={styles.info}>{destination.info}</Text>
        {/* Location and Nearloc fields might require additional formatting if they are not simple strings */}
        {destination.location && (
          <View>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: destination.location.latitude,
                longitude: destination.location.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{
                  latitude: destination.location.latitude,
                  longitude: destination.location.longitude,
                }}
                title={destination.name}
              />
            </MapView>
            <TouchableOpacity
              style={styles.directionButton}
              onPress={() =>
                openMaps(
                  destination.location.latitude,
                  destination.location.longitude,
                  destination.name
                )
              }
            >
              <Text>Get Directions</Text>
            </TouchableOpacity>
          </View>
        )}
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
  container: {
    flex: 1,
    backgroundColor: "#fff", // Light background to improve readability
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  detailSection: {
    padding: 20, // Increase padding for better spacing
    backgroundColor: "#f8f9fa", // Slightly off-white background to reduce glare
  },
  title: {
    fontSize: 26, // Increase font size for better visibility
    fontWeight: "bold",
    color: "#212529", // Dark color for better contrast
    marginBottom: 16, // Increase space after the title
  },
  description: {
    fontSize: 18,
    lineHeight: 24, // Increase lineHeight for better readability
    color: "#495057", // Softer color to reduce eye strain
    marginBottom: 12,
  },
  info: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 10,
    color: "#343a40", // Ensuring good contrast for readability
  },
  shareButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#007bff", // Use a vibrant color for action items
    borderRadius: 8,
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
    height: 200, // Fixed height for consistency
    borderRadius: 8, // Rounded corners for a softer look
    marginBottom: 16, // Space after the image
  },
  map: {
    height: 200, // or another appropriate size for your layout
  },
  directionButton: {
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignSelf: "center",
    marginTop: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  modalView: {
    width: "90%", // Take up to 90% of screen width
    height: "90%", // Take up to 90% of screen height
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10, // Adjust padding as needed
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fullScreenImage: {
    width: "100%", // You can adjust this
    height: "100%", // You can adjust this
    resizeMode: "cover", // Ensures the image fits and is centered
  },
  modalCloseButton: {
    padding: 10,
    elevation: 2,
    backgroundColor: "#2196F3",
    borderRadius: 5,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  noImageText: {
    color: "#6c757d", // Soft color for text indicating no images are available
    fontStyle: "italic", // Style to indicate this is a status message, not data
  },
});

export default DetailedDestinationScreen;
