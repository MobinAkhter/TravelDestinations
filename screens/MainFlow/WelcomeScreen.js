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
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db, firestore } from "../../firebase";
import { Entypo } from "@expo/vector-icons";
import { removeSpace, iconMapper } from "../../utils";
import MIcon from "../../components/ui/MIcon";
import SearchBar from "../../components/ui/SearchBar";

import { getFirestore, collection, getDocs } from "firebase/firestore";
const WelcomeScreen = ({}) => {
  const navigation = useNavigation();
  const [bodyParts, setBodyParts] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  // const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // AsyncStorage.clear();
    const fetchBodyParts = async () => {
      try {
        // Try to get the cached body parts from AsyncStorage
        const cachedBodyParts = await AsyncStorage.getItem("bodyParts");

        // If cached data exists, parse it and set it as the state
        if (cachedBodyParts) {
          const parsedBodyParts = JSON.parse(cachedBodyParts);
          console.log("Fetching body parts from cache...");
          await setBodyParts(parsedBodyParts); // add await here
        }

        // Always fetch the latest data from Firestore and update the state and cache
        const parts = [];
        const querySnapshot = await getDocs(collection(db, "BodyParts"));
        querySnapshot.forEach((doc) => {
          console.log(`${doc.id}`);
        });

        // // console.log("Fetching body parts from Firestore...");
        querySnapshot.forEach((doc) => {
          parts.push({
            ...doc.data(),
            key: doc.id,
          });
        });

        console.log(parts);

        // Update state with the latest body parts
        setBodyParts(parts);

        // Cache the latest body parts
        await AsyncStorage.setItem("bodyParts", JSON.stringify(parts));
        console.log("Caching");
      } catch (error) {
        console.error(error);
      }
    };

    fetchBodyParts();
  }, []);

  const renderBodyPartCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("Condition List", { bp: item.name })}
      style={styles.card}
    >
      <View style={styles.cardContent}>
        <MIcon {...iconMapper[removeSpace(item.name)]} size={30} />
        <Text style={styles.cardText}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const navigateToSearchResult = () => {
    console.log("nav to search results???");
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
        <View style={styles.bodyPartsContainer}>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={bodyParts}
            renderItem={renderBodyPartCard}
            keyExtractor={(item) => item.key}
            numColumns={2}
            columnWrapperStyle={styles.row}
            // ListFooterComponent={renderFooter}
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
  bodyPartsContainer: {
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
