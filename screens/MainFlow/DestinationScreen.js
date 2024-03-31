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
  const themeColor = countryThemeColors[country] || "#FFFFFF";
  const inactiveColor = `${themeColor}80`;

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
    navigation.setOptions({
      headerStyle: { backgroundColor: themeColor },
      headerTintColor: "#fff",
    });
    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor(themeColor);
      StatusBar.setBarStyle("light-content");
    }
  }, [country, navigation, themeColor]);

  const renderItem = ({ item }) => {
    const imageUri =
      item.image && item.image.length > 0
        ? { uri: item.image[0] }
        : require("../../img.png");

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
            {truncateDescription(item.description, 95)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const truncateDescription = (description, maxLength) =>
    description?.length > maxLength
      ? `${description.substring(0, maxLength - 3)}...`
      : description;

  const FilterButton = ({ title, active }) => (
    <TouchableOpacity
      onPress={() => setFilter(title)}
      style={[
        styles.filterButtonContainer,
        {
          borderColor: themeColor,
          backgroundColor: active ? themeColor : "white",
        },
      ]}
    >
      <Text
        style={[
          styles.filterButtonText,
          { color: active ? "#FFFFFF" : themeColor },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.rootContainer}>
      <View style={styles.filterContainer}>
        {["All", "Historical", "Religious"].map((f) => (
          <FilterButton key={f} title={f} active={filter === f} />
        ))}
      </View>
      <FlatList
        data={destinations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
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
    justifyContent: "space-around",
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
    marginHorizontal: 10,
    alignSelf: "center",
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
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    marginBottom: 20,
  },
  filterButtonContainer: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default DestinationScreen;
