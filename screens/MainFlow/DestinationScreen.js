import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  StatusBar,
  Platform,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../firebase";
import { countryThemeColors } from "../../constants/themeColors";
import { collection, getDocs, query, where } from "firebase/firestore";

function DestinationScreen({ route }) {
  const { country, city } = route.params;
  const navigation = useNavigation();
  const [destinations, setDestinations] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchDestinations = async () => {
      let destinationsRef = collection(
        db,
        "Countries",
        country,
        "Cities",
        city,
        "Locations"
      );
      if (filter !== "All") {
        destinationsRef = query(destinationsRef, where("type", "==", filter));
      }
      const querySnapshot = await getDocs(destinationsRef);
      const loadedDestinations = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setDestinations(
        loadedDestinations.filter(
          (doc) => doc.type === filter || filter === "All" || !doc.type
        )
      );
    };

    fetchDestinations();
  }, [country, city, filter]);

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

  const renderItem = ({ item, index }) => {
    const imageUri =
      item.image && item.image.length > 0
        ? { uri: item.image[0] }
        : require("../../logo-1.png");

    const numColumns = destinations.length === 1 ? 1 : 2;
    const width =
      numColumns === 1 ? "95%" : Dimensions.get("window").width / 2 - 20;

    return (
      <TouchableOpacity
        style={[styles.card, { width }]}
        onPress={() =>
          navigation.navigate("About Location", {
            country,
            city,
            locationId: item.id,
          })
        }
      >
        <Image source={imageUri} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardDescription}>
            {truncateDescription(item.description, 100)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const truncateDescription = (description, maxLength) =>
    description?.length > maxLength
      ? `${description.substring(0, maxLength - 3)}...`
      : description;

  return (
    <View style={styles.rootContainer}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          padding: 10,
        }}
      >
        {["All", "Historical", "Religious"].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={{
              padding: 10,
              backgroundColor: filter === f ? "#007BFF" : "#E0E0E0",
            }}
          >
            <Text style={{ color: filter === f ? "#FFFFFF" : "#000000" }}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={destinations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 10,
  },
  row: { justifyContent: "space-around" },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 10,
    marginVertical: 10,
    width: "48%",
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginHorizontal: 10,
    alignSelf: "center",
  },
  cardImage: { width: "100%", height: 150 },
  cardContent: { padding: 10 },
  cardTitle: { fontWeight: "bold", fontSize: 18, marginBottom: 5 },
  cardDescription: { color: "#666", marginBottom: 10 },
});

export default DestinationScreen;
