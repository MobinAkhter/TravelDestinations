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
import { SimpleLineIcons } from "@expo/vector-icons";

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
        title: destination.name,
        headerRight: () => (
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity style={{ marginRight: 16 }} onPress={onShare}>
              <SimpleLineIcons name="share" size={24} color="black" />
            </TouchableOpacity>
          </View>
        ),
      });
    }
  }, [navigation, destination]);

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
        <Text style={[styles.info, styles.infoTitle]}>
          Historical significance
        </Text>
        <Text style={styles.info}>{destination.historical}</Text>

        <Text style={[styles.info, styles.infoTitle]}>
          Interesting information
        </Text>
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
        <Text style={[styles.info, styles.infoTitle]}>Nearby</Text>
        <Text style={styles.info}>{destination.nearloc}</Text>

        <Text style={[styles.info, styles.infoTitle]}>
          Information For Visitors
        </Text>
        <Text style={styles.info}>{destination.visitorinfo}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  detailSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#fafafa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212121",
    marginTop: 24,
    marginBottom: 4,
  },
  description: {
    fontSize: 18,
    lineHeight: 24,
    color: "#444444",
    marginBottom: 4,
  },
  infoTitle: {
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 4,
    color: "#343a40",
  },
  info: {
    fontSize: 16,
    lineHeight: 22,
    color: "#666", // Subtle color for informational text
    marginBottom: 4,
  },
  shareButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#007bff", // Blue color for call-to-action button
    borderRadius: 8,
    alignSelf: "flex-start", // Align to the start for easy thumb reach
  },
  slide: {
    height: 240, // Maintain consistent height for images
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%", // Image takes full space of the swiper
    resizeMode: "cover", // Cover the whole swiper area
  },
  map: {
    height: 200,
    borderRadius: 8, // Rounded corners for map
    marginVertical: 20, // Space before and after map
  },
  directionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#28a745", // Green color for direction button
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 8,
    color: "#fff",
    marginBottom: 8,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)", // Dark background for modal focus
  },
  modalView: {
    width: "90%",
    height: "75%", // Height adjusted to show some background
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8, // Consistent rounded corners
  },
  modalCloseButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 8,
    backgroundColor: "#dc3545", // Red color for close button
    borderRadius: 16,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  noImageText: {
    fontStyle: "italic",
    color: "#6c757d",
  },
});

export default DetailedDestinationScreen;
