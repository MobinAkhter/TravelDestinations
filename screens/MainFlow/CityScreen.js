import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../../firebase"; // Ensure this path is correct

const CityScreen = ({ route }) => {
  const { country } = route.params;
  const navigation = useNavigation();
  const [cities, setCities] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCities();
  }, [country]);

  const fetchCities = async () => {
    const cacheKey = `cities_${country}`;
    try {
      setRefreshing(true);
      let cachedCities = await AsyncStorage.getItem(cacheKey);
      if (cachedCities) {
        console.log("Loading cities from cache");
        setCities(JSON.parse(cachedCities));
      } else {
        console.log("Fetching cities from Firestore");
        const citiesRef = collection(db, "Countries", country, "Cities");
        const querySnapshot = await getDocs(citiesRef);
        const loadedCities = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        await AsyncStorage.setItem(cacheKey, JSON.stringify(loadedCities));
        setCities(loadedCities);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    AsyncStorage.removeItem(`cities_${country}`).then(fetchCities);
  };

  const renderCityCard = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("Significant Locations", {
          country,
          city: item.name,
        })
      }
      style={getCardStyle(cities.length)}
    >
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );

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

  return (
    <View style={styles.rootContainer}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={cities}
        renderItem={renderCityCard}
        keyExtractor={(item) => item.id}
        numColumns={3}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    paddingTop: 14,
  },
  itemText: {
    fontSize: 15,
    color: "white",
    textAlign: "center",
    flexShrink: 1,
    fontWeight: "bold",
  },
});

export default CityScreen;
