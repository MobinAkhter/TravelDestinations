import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
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
import MIcon from "../../components/ui/MIcon";
import SearchBar from "../../components/ui/SearchBar";

import { getFirestore, collection, getDocs } from "firebase/firestore";

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const [countries, setCountries] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerStyle: {
          backgroundColor: "#35D96F", // Your default Welcome screen header color
        },
      });

      // If you're also changing the StatusBar color, reset that as well
      if (Platform.OS === "android") {
        StatusBar.setBackgroundColor("#35D96F");
      }

      return () => {
        // You can define any cleanup logic here if needed when the screen is unfocused
      };
    }, [navigation])
  );

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const cachedCountries = await AsyncStorage.getItem("countries");
        const countriesCollectionRef = collection(db, "Countries");
        const querySnapshot = await getDocs(countriesCollectionRef);
        const loadedCountries = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          key: doc.id,
        }));

        // Compare loadedCountries with cachedCountries to decide if update is needed
        if (
          !cachedCountries ||
          JSON.stringify(loadedCountries) !== cachedCountries
        ) {
          console.log("Updating countries from Firestore");
          setCountries(loadedCountries);
          await AsyncStorage.setItem(
            "countries",
            JSON.stringify(loadedCountries)
          );
        } else {
          console.log("Loading countries from cache");
          setCountries(JSON.parse(cachedCountries));
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, []);

  const renderCountryCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("Cities", { country: item.name })}
      style={styles.card}
    >
      <View style={styles.cardContent}>
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        <Text style={styles.cardText}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const navigateToSearchResult = () => {
    navigation.navigate("Search Result", {
      searchVal: searchInput,
    });
  };

  return (
    <KeyboardAvoidingView style={styles.rootContainer}>
      <SafeAreaView>
        <SearchBar
          searchValue={searchInput}
          setSearchValue={setSearchInput}
          placeholder="Search for cities/location"
          onSearchPress={navigateToSearchResult}
        />
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
    flexGrow: 1, // Take up all available space for the content
    justifyContent: "center", // Space between image and text
    alignItems: "center", // Center align items
    padding: 16, // Padding inside the card
  },
  cardText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    position: "absolute", // Position text over the image
    bottom: 10, // Distance from the bottom of the card
    left: 10, // Distance from the left of the card
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Semi-transparent background
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  row: {
    // flexDirection: "row",
    justifyContent: "space-between",
  },
  cardImage: {
    width: "100%",
    height: undefined, // Height is undefined to maintain aspect ratio
    aspectRatio: 1.6, // Aspect ratio of the flag, adjust as needed
    resizeMode: "cover", // Cover the entire area of the image container
  },
});
