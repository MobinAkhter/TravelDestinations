import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Image,
  StatusBar,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../../firebase";
import SearchBar from "../../components/ui/SearchBar";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : "ca-app-pub-1134256608400195/5476614344";

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const [countries, setCountries] = useState([]);
  const interstitialAdRef = useRef(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    interstitialAdRef.current = InterstitialAd.createForAdRequest(adUnitId);

    const loadAd = () => {
      interstitialAdRef.current.load();
    };

    const onAdLoaded = () => {
      setAdLoaded(true);
    };

    const onAdClosed = () => {
      // Ad closed by user, reload ad for next time
      loadAd();
    };

    // Event listeners
    const loadedListener = interstitialAdRef.current.addAdEventListener(
      AdEventType.LOADED,
      onAdLoaded
    );
    const closedListener = interstitialAdRef.current.addAdEventListener(
      AdEventType.CLOSED,
      onAdClosed
    );

    loadAd();

    return () => {
      loadedListener.remove();
      closedListener.remove();
      interstitialAdRef.current = null;
    };
  }, []);

  const showAdIfLoaded = () => {
    return new Promise((resolve, reject) => {
      if (adLoaded) {
        interstitialAdRef.current
          .show()
          .then(() => {
            setAdLoaded(false);
            resolve();
          })
          .catch(reject);
      } else {
        reject("Ad not loaded");
      }
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerStyle: {
          backgroundColor: "#35D96F",
        },
      });

      if (Platform.OS === "android") {
        StatusBar.setBackgroundColor("#35D96F");
      }
    }, [navigation])
  );

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const cachedCountries = await AsyncStorage.getItem("countries");
        const countriesCollectionRef = collection(db, "Countries");
        const querySnapshot = await getDocs(countriesCollectionRef);
        const loadedCountries = querySnapshot.docs
          .map((doc) => ({
            ...doc.data(),
            key: doc.id,
          }))
          .filter((country) => country.hasCities !== false); // Filter out countries that explicitly have hasCities set to false

        const countriesToCache = JSON.stringify(loadedCountries);
        if (!cachedCountries || countriesToCache !== cachedCountries) {
          setCountries(loadedCountries);
          await AsyncStorage.setItem("countries", countriesToCache);
        } else {
          setCountries(JSON.parse(cachedCountries));
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, []);

  const handlePressCountry = (countryName) => {
    showAdIfLoaded()
      .then(() => {
        navigation.navigate("Cities", { country: countryName });
      })
      .catch((error) => {
        console.error(error);
        // If ad is not loaded or an error occurs, navigate anyway
        navigation.navigate("Cities", { country: countryName });
      });
  };

  const renderCountryCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => handlePressCountry(item.name)}
      style={styles.card}
    >
      <View style={styles.cardContent}>
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        <Text style={styles.cardText}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView style={styles.rootContainer}>
      <SafeAreaView>
        <View style={styles.countriesContainer}>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={countries}
            renderItem={renderCountryCard}
            keyExtractor={(item) => item.key}
            numColumns={2}
            columnWrapperStyle={styles.row}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  rootContainer: {
    alignItems: "center",
    paddingTop: 18,
  },
  searchContainer: {
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 20,
    height: 50,
    marginBottom: 10,
  },
  countriesContainer: {
    marginTop: 5,
    flex: 1,
  },
  searchWrapper: {
    backgroundColor: "white",
    marginRight: 12,
    borderRadius: 16,
    width: "65%",
  },
  searchInput: {
    height: "100%",
    paddingHorizontal: 16,
  },
  searchBtn: {
    width: 45,
    backgroundColor: "#35D96F",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    margin: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0", // A light grey background for contrast
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowColor: "#000",
    shadowOffset: { height: 1, width: 0 },
    elevation: 2,
    borderWidth: 0.5,
    borderColor: "#ddd",
    width: Dimensions.get("window").width / 2 - 50,
    overflow: "hidden",
  },
  cardContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  row: {
    justifyContent: "space-between",
  },
  cardImage: {
    width: "100%",
    height: undefined, // Height is undefined to maintain aspect ratio
    aspectRatio: 1.6, // Aspect ratio of the flag, adjust as needed
    resizeMode: "cover", // Cover the entire area of the image container
  },
});
