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
import * as Speech from "expo-speech";
import { SimpleLineIcons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import defaultImage from "../../img.png";

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
  const [voices, setVoices] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  const getRandomVoiceIdentifier = () => {
    const randomIndex = Math.floor(Math.random() * preferredVoices.length);
    return preferredVoices[randomIndex].identifier; // Returns a random voice identifier
  };
  const preferredVoices = [
    { name: "Samantha", identifier: "com.apple.voice.compact.en-US.Samantha" },
    { name: "Daniel", identifier: "com.apple.voice.compact.en-GB.Daniel" },
  ];
  const [selectedVoice, setSelectedVoice] = useState(
    getRandomVoiceIdentifier()
  );
  const [speechRate, setSpeechRate] = useState(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenText, setSpokenText] = useState("");

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

  const increaseSpeechRate = () => {
    const newRate = speechRate + 0.1; // Increase the speech rate by 0.1
    setSpeechRate(newRate); // Update the speech rate state
    stopSpeech(); // Stop the current speech synthesis process
    speak(spokenText, newRate); // Start a new speech synthesis process with the updated rate
  };
  const speak = (text, rate = speechRate) => {
    setIsSpeaking(true);
    setSpokenText(text);
    const textChunks = chunkText(text, 4000);
    speakChunks(textChunks, rate);
  };

  const speakChunks = (chunks, rate) => {
    if (chunks.length === 0) {
      setIsSpeaking(false);
      return;
    }

    const chunk = chunks.shift();
    const randomVoice = getRandomVoiceIdentifier(); // Get a random voice identifier
    Speech.speak(chunk, {
      rate,
      voice: randomVoice, // Use the random voice for this chunk
      onStart: () => {
        setIsSpeaking(true);
      },
      onDone: () => {
        speakChunks(chunks, rate); // Continue with the next chunk
      },
    });
  };
  const stopSpeech = () => {
    Speech.stop();
    setIsSpeaking(false);
    setSpokenText("");
  };

  const resumeSpeech = () => {
    if (spokenText) {
      speak(spokenText, speechRate);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Speech.getAvailableVoicesAsync().then((availableVoices) => {
      if (isMounted) {
        // Filter only the 5 preferred voices. Daniel will be the initial voice, cause that guy sounds best imo.
        const filteredVoices = availableVoices.filter((voice) =>
          preferredVoices.some(
            (pVoice) => pVoice.identifier === voice.identifier
          )
        );
        setVoices(filteredVoices);
      }
    });

    return () => {
      isMounted = false;
      Speech.stop();
    };
  }, []);

  function chunkText(text, maxLength) {
    const chunks = [];
    let i = 0;
    while (i < text.length) {
      chunks.push(text.substring(i, i + maxLength));
      i += maxLength;
    }
    return chunks;
  }

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
  function composeTextToSpeak() {
    let textToSpeak = "";
    const { description, historical, info, nearloc, visitorinfo } = destination; // Destructuring for easier access

    if (description) {
      textToSpeak += `${description}\n`;
    }
    if (historical) {
      textToSpeak += `Historical Significance: ${historical}\n`;
    }
    if (info) {
      textToSpeak += `Interesting Information: ${info}\n`;
    }
    if (nearloc) {
      textToSpeak += `Nearby Locations: ${nearloc}\n`;
    }
    if (visitorinfo) {
      textToSpeak += `Visitor Information: ${visitorinfo}`;
    }
    return textToSpeak;
  }
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Swiper for destination images or a placeholder if no images are available */}
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
          <Image style={styles.image} source={defaultImage} />
          {/* <Text style={styles.noImageText}>No Images Available</Text> */}
        </View>
      )}

      {/* Modal for full-screen image display */}
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

      {/* Details section including title, description, and additional information */}
      <View style={styles.detailSection}>
        {/* Title and audio controls container */}
        <View style={styles.controlRow}>
          {/* Title */}
          <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit>
            {destination.name}
          </Text>

          {/* Audio controls */}
          <View style={styles.playButton}>
            <TouchableOpacity
              onPress={
                isSpeaking
                  ? stopSpeech
                  : () => speak(composeTextToSpeak(destination), speechRate)
              }
              style={styles.audioButton}
            >
              <Icon
                name={isSpeaking ? "stop" : "play"}
                size={24}
                color="#000"
              />
              <Text style={styles.audioControlLabel}>
                {isSpeaking ? "Stop Audio" : "Play Audio"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={increaseSpeechRate}
              style={styles.speedControl}
            >
              <MaterialCommunityIcons
                name="play-speed"
                size={24}
                color="black"
              />
              <Text>{speechRate.toFixed(1)}X</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Description and other details */}
        <Text style={styles.description}>{destination.description}</Text>
        <Text style={[styles.info, styles.infoTitle]}>
          Historical significance
        </Text>
        <Text style={styles.info}>{destination.historical}</Text>
        <Text style={[styles.info, styles.infoTitle]}>
          Interesting information
        </Text>
        <Text style={styles.info}>{destination.info}</Text>

        {/* MapView for location display if available */}
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

        {/* Nearby locations and visitor information */}
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#212121",
    flex: 1,
    paddingRight: 10,
    marginBottom: 8,
    lineHeight: 26,
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
  audioControlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
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
  controlRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    // justifyContent: "space-between",
    paddingVertical: 16,
  },
  playButton: {
    marginHorizontal: 8,
    flexDirection: "row",
  },
  audioControlLabel: {
    fontSize: 16,
    color: "#212121",
    // flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
  },
  speedControl: {
    // flexDirection: "row",
    alignItems: "center",
  },
  speedControl: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  speechRateText: {
    marginLeft: 4,
    fontSize: 16,
    color: "#212121",
  },
  audioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10, // Adjust space between audio button and speed control
  },
});

export default DetailedDestinationScreen;
