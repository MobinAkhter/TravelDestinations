import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../firebase";

import { collection, getDocs } from "firebase/firestore";

function DestinationScreen({ route }) {
  const { country, city } = route.params; // Expects both country and city to be passed in
  const navigation = useNavigation();
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        // Path corrected to fetch locations within a city, within a country
        const destinationsRef = collection(
          db,
          "Countries",
          country,
          "Cities",
          city,
          "Locations"
        );
        const querySnapshot = await getDocs(destinationsRef);
        const loadedDestinations = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setDestinations(loadedDestinations);
      } catch (error) {
        console.error("Error fetching destinations:", error);
      }
    };

    fetchDestinations();
  }, [country, city]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        /* Handle destination selection if necessary */
      }}
      style={styles.card}
    >
      <Image
        source={{ uri: item.image || "../../logo-1.png" }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDescription}>
          {truncateDescription(item.description, 60)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const truncateDescription = (description, maxLength) =>
    description?.length > maxLength
      ? `${description.substring(0, maxLength - 3)}...`
      : description;

  return (
    <View style={styles.rootContainer}>
      <FlatList
        showsVerticalScrollIndicator={false}
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
  row: {
    justifyContent: "space-around", // This distributes space evenly around the items.
  },
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
    marginHorizontal: 10, // Spacing from the screen edges
  },
  cardImage: {
    width: "100%",
    height: 150,
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 5,
  },
  cardDescription: {
    color: "#666",
    marginBottom: 10,
  },
  learnMore: {
    fontSize: 16,
    color: "#1e90ff",
    fontWeight: "bold",
  },
});

export default DestinationScreen;
