import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../../firebase";
import {
  collection,
  query,
  orderBy,
  startAfter,
  limit,
  getDocs,
} from "firebase/firestore";

const PAGE_SIZE = 100;

const AlphabetIndex = ({ selectedLetter, onLetterPress }) => {
  return (
    <View style={styles.alphabetContainer}>
      <ScrollView
        contentContainerStyle={styles.alphabetScrollView}
        showsVerticalScrollIndicator={false}
      >
        {Array.from(Array(26)).map((_, i) => {
          const letter = String.fromCharCode(65 + i);
          const isSelected = letter === selectedLetter;
          return (
            <TouchableOpacity
              key={letter}
              style={
                isSelected ? styles.selectedLetter : styles.letterContainer
              }
              onPress={() => onLetterPress(letter)}
            >
              <Text style={styles.letter}>{letter}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const SortedRemedies = () => {
  const [herbs, setHerbs] = useState([]);
  const [lastVisibleRemedy, setLastVisibleRemedy] = useState(null);
  const [allHerbsLoaded, setAllHerbsLoaded] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState("A");
  const listRef = useRef(null);
  const navigation = useNavigation();

  const fetchHerbs = async () => {
    let herbsQuery = query(
      collection(db, "Remedies"),
      orderBy("name"),
      limit(PAGE_SIZE)
    );

    if (lastVisibleRemedy) {
      herbsQuery = query(herbsQuery, startAfter(lastVisibleRemedy));
    }

    const querySnapshot = await getDocs(herbsQuery);

    if (!querySnapshot.empty) {
      const newHerbs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHerbs((prevHerbs) => [...prevHerbs, ...newHerbs]);
      setLastVisibleRemedy(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } else {
      setAllHerbsLoaded(true);
    }
  };

  useEffect(() => {
    fetchHerbs();
  }, []);

  const navigateToDetails = (herb) => {
    navigation.navigate("Remedy Details", { rem: herb });
  };

  const onLetterPress = (letter) => {
    setSelectedLetter(letter);
    const index = herbs.findIndex((herb) => herb.name.startsWith(letter));
    if (index !== -1) {
      listRef.current.scrollToIndex({ index, animated: true });
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={herbs}
        keyExtractor={(item) => item.id}
        ref={listRef}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => navigateToDetails(item)}
          >
            <Image
              source={
                item.image && item.image[0]
                  ? { uri: item.image[0] }
                  : require("../../../assets/leaf_icon.jpeg")
              }
              style={styles.herbImage}
            />
            <Text style={styles.herbName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        onEndReached={allHerbsLoaded ? null : fetchHerbs}
        onEndReachedThreshold={0.9}
      />
      <AlphabetIndex
        selectedLetter={selectedLetter}
        onLetterPress={onLetterPress}
      />
    </View>
  );
};

export default SortedRemedies;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  herbImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 25,
  },
  herbName: {
    fontSize: 18,
    marginRight: 70,
  },
  alphabetContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 30,
    justifyContent: "center",
  },
  alphabetScrollView: {
    alignItems: "center",
  },
  selectedLetter: {
    backgroundColor: "#87ceeb",
    borderRadius: 10,
    alignItems: "center",
  },
  letter: {
    fontSize: 14,
    padding: 4,
    color: "black",
  },
});
