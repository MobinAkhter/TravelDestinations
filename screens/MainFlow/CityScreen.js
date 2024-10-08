import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../../firebase";
import { countryThemeColors } from "../../constants/themeColors";

function getComplementaryTextColor(backgroundColor) {
  const color = backgroundColor.replace("#", "");
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 125 ? "#000000" : "#FFFFFF";
}

const CityScreen = ({ route }) => {
  const { country } = route.params;
  const navigation = useNavigation();
  const [cities, setCities] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCities();
  }, [country]);

  useEffect(() => {
    const themeColor = countryThemeColors[country] || "#FFFFFF";
    const headerTitle = `Cities of ${country}`;
    navigation.setOptions({
      headerTitle,
      headerStyle: {
        backgroundColor: themeColor,
      },
      headerTintColor: "#fff",
    });

    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor(themeColor);
      StatusBar.setBarStyle("light-content"); // or 'dark-content'
    }
  }, [country, navigation]);

  const fetchCities = async () => {
    const cacheKey = `cities_${country}`;
    try {
      setRefreshing(true);
      let cachedCities = await AsyncStorage.getItem(cacheKey);
      if (cachedCities) {
        setCities(JSON.parse(cachedCities));
      } else {
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
    AsyncStorage.removeItem(`cities_${country}`)
      .then(fetchCities)
      .catch((error) => {
        console.error("Error on refreshing cities:", error);
      })
      .finally(() => setRefreshing(false));
  };

  const renderCityCard = ({ item }) => {
    const backgroundColor = countryThemeColors[country] || "#DDD";
    const textColor = getComplementaryTextColor(backgroundColor);
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Significant Locations", {
            country,
            city: item.name,
          })
        }
        style={[styles.card, { backgroundColor }]}
      >
        <Text style={[styles.itemText, { color: textColor }]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };
  if (cities.length > 0) {
    return (
      <FlatList
        showsVerticalScrollIndicator={false}
        data={cities}
        renderItem={renderCityCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    );
  } else {
    return (
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.noCitiesText}>
          No cities available at the moment. Manually refresh by pulling down
          from the top of the screen. Otherwise, check back soon!
        </Text>
      </ScrollView>
    );
  }
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    paddingTop: 14,
  },
  card: {
    width: Dimensions.get("window").width / 3 - 20,
    height: 150,
    margin: 10,
    borderRadius: 10,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: "#333",
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  itemText: {
    fontSize: 15,
    textAlign: "center",
    flexShrink: 1,
    fontWeight: "bold",
  },
  noCitiesText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
});

export default CityScreen;
