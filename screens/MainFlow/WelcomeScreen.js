import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
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
      onPress={() => navigation.navigate("CityScreen", { country: item.name })}
      style={styles.card}
    >
      <View style={styles.cardContent}>
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
          placeholder="Search for remedy/conditions"
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
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowColor: "#000",
    shadowOffset: { height: 2, width: 0 },
    elevation: 3,
    borderColor: "#35D96F",
    borderWidth: 3,
    width: Dimensions.get("window").width / 2 - 50,
  },
  cardContent: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  cardText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "400",
  },
  row: {
    justifyContent: "space-between",
  },
});
