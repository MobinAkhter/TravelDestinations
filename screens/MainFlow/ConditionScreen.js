import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Fontisto } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../../firebase";

function ConditionScreen({ route }) {
  const { bp } = route.params;
  const navigation = useNavigation();
  const [conditions, setConditions] = useState([]);
  const col = collection(db, "BodyParts");
  //   const user = auth.currentUser.uid;

  // Loads the conditions from cache or database
  const loadConditions = async () => {
    // AsyncStorage.clear();
    try {
      const cacheKey = `conditions_${bp}`;
      const cachedConditions = await AsyncStorage.getItem(cacheKey);

      if (cachedConditions !== null) {
        console.log(`Fetching conditions from cache for body part: ${bp}`);
        setConditions(JSON.parse(cachedConditions));
      } else {
        console.log(`Fetching conditions from Firestore for body part: ${bp}`);
        const conditionsRef = collection(db, "BodyParts", bp, "Conditions");
        const querySnapshot = await getDocs(conditionsRef);

        const con = [];
        querySnapshot.forEach((doc) => {
          con.push({
            ...doc.data(),
            key: doc.id,
          });
        });

        await AsyncStorage.setItem(cacheKey, JSON.stringify(con));
        setConditions(con);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadConditions();
  }, []);

  const getCardStyle = (numItems) => ({
    width:
      numItems <= 2
        ? Dimensions.get("window").width - 20
        : Dimensions.get("window").width / 3 - 20,
    height: 150,
    margin: 10,
    backgroundColor: "#2E8B57",
    borderRadius: 10,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: "#333",
    shadowOpacity: 0.3,
    shadowRadius: 2,
  });

  //console log the selected condition
  const selectedCondition = async (conditionName) => {
    console.log("Selected the following condition" + conditionName);

    // Get the user's document reference
    const userDocRef = doc(db, "users", user);

    // Use the get() method to fetch the user's document
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      // Check if the document exists
      const userData = userDocSnapshot.data();

      //check if the searches property of the user is at least 20
      if (userData && userData.searches) {
        if (userData.searches.length <= 19) {
          userData.searches.push(conditionName);

          // Update the user's document in the database
          await userDocRef.update({
            searches: userData.searches,
          });
        } else {
          console.log("Cannot add conditions anymore");
        }
      }
    }
  };

  // TODO: Uncomment the lines of code below, if there is some caching problem, herbs from db are not showing up etc.
  useEffect(() => {
    // Clear the AsyncStorage cache
    AsyncStorage.clear()
      .then(() => {
        console.log("Cache cleared for testing!");
        loadConditions();
      })
      .catch((error) => {
        console.log("Error clearing cache:", error);
        loadConditions(); // You might still want to load conditions even if clearing cache fails.
      });
  }, []);

  return (
    <View style={styles.rootContainer}>
      <Text style={styles.title}>
        {bp === "Digestive" && (
          <MaterialCommunityIcons
            styles={styles.icon}
            name="stomach"
            size={40}
            color="black"
          />
        )}
        {bp === "Circulatory" && (
          <Fontisto name="blood-drop" size={40} color="black" />
        )}
        {bp === "Head and Neck" && (
          <FontAwesome5 name="head-side-virus" size={40} color="black" />
        )}
        {bp === "Mental" && (
          <MaterialCommunityIcons name="brain" size={40} color="black" />
        )}
        {bp === "Respiratory" && (
          <FontAwesome5 name="lungs" size={40} color="black" />
        )}
        {bp === "Skeletal" && (
          <FontAwesome5 name="bone" size={40} color="black" />
        )}
        {bp === "Skin" && <Ionicons name="body" size={40} color="black" />}
        {bp} Conditions
      </Text>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={conditions}
        renderItem={({ item }) => (
          <View style={styles.container}>
            <TouchableOpacity
              style={getCardStyle(conditions.length)}
              onPress={() => {
                navigation.navigate("Remedies List", {
                  bp: bp,
                  con: item.name,
                });

                selectedCondition(item.name);
              }}
            >
              <Text
                style={styles.itemText}
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => item.id || String(index)}
        numColumns={3}
        key={3}
      />
    </View>
  );
}

export default ConditionScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    paddingTop: 14, // personal preference
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    alignSelf: "center",
    marginVertical: 20,
  },
  itemText: {
    fontSize: 15,
    color: "white",
    textAlign: "center", // We can comment this out, still looks fine, might help with the text cutting off
    flexShrink: 1,
    fontWeight: "bold",
  },
});
