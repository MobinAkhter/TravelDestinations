import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View, Text, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

function RemedyListScreen({ route }) {
  const { bp, con } = route.params;
  const navigation = useNavigation();
  const [remedies, setRemedies] = useState([]);
  const cacheKey = `remedies_${bp}_${con}`;
  const conditionName = route.params?.con;

  useEffect(() => {
    const truncateTitle = (title, maxLength) => {
      if (title.length > maxLength) {
        return title.substring(0, maxLength - 3) + "...";
      }
      return title;
    };

    if (conditionName) {
      const truncatedTitle = truncateTitle(`Remedies for ${conditionName}`, 30);
      navigation.setOptions({
        title: truncatedTitle,
      });
    }
  }, [conditionName, navigation]);

  useEffect(() => {
    // AsyncStorage.clear();
    const fetchRemedies = async () => {
      try {
        const cachedRemedies = await AsyncStorage.getItem(cacheKey);
        if (cachedRemedies) {
          setRemedies(JSON.parse(cachedRemedies));
          console.log("Remedies retrieved from cache");
        } else {
          const conditionRef = doc(db, "BodyParts", bp, "Conditions", con);
          const conditionSnap = await getDoc(conditionRef);
          if (conditionSnap.exists()) {
            const conditionData = conditionSnap.data();
            if (conditionData && conditionData.remedies) {
              const remediesDetails = await Promise.all(
                conditionData.remedies.map(async (remedyId) => {
                  const remedyRef = doc(db, "Remedies", remedyId);
                  const remedySnap = await getDoc(remedyRef);
                  return remedySnap.exists()
                    ? { id: remedySnap.id, ...remedySnap.data() }
                    : null;
                })
              );
              const validRemedies = remediesDetails.filter(Boolean);
              setRemedies(validRemedies);
              await AsyncStorage.setItem(
                cacheKey,
                JSON.stringify(validRemedies)
              );
              console.log("Remedies retrieved from Firestore");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching remedies:", error);
      }
    };
    fetchRemedies();
  }, [bp, con]);

  const renderItem = ({ item }) => {
    const imageSource = item?.image?.[0]
      ? { uri: item.image[0] }
      : require("../../assets/leaf_icon.jpeg");
    const learnMorePressed = (item) => {
      navigation.navigate("Remedy Details", { rem: item });
    };
    return (
      <View style={styles.card}>
        <Image source={imageSource} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardDescription}>
            {truncateDescription(item.description, 60)}
          </Text>
          <Text onPress={() => learnMorePressed(item)} style={styles.learnMore}>
            Learn more
          </Text>
        </View>
      </View>
    );
  };

  const truncateDescription = (description, maxLength) => {
    return description?.length > maxLength
      ? description.substring(0, maxLength - 3) + "..."
      : description;
  };

  return (
    <View style={styles.rootContainer}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={remedies}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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

export default RemedyListScreen;
