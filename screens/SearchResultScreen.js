import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MIcon from "../components/ui/MIcon";
import { removeSpace, iconMapper } from "../utils";
import { db } from "../firebase";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import SearchBar from "../components/ui/SearchBar";
import { collection, query, getDocs, orderBy } from "firebase/firestore";

function SearchResultScreen({ route }) {
  const { searchVal } = route.params;
  const navigation = useNavigation();
  const [conditions, setConditions] = useState([]);
  const [remedies, setRemedies] = useState([]);
  const [searchValue, setSearchValue] = useState(searchVal);
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchVal);
  const [index, setIndex] = useState(0);
  const bpList = [
    "Circulatory",
    "Digestive",
    "Female Reproductive",
    "Head and Neck",
    "Male Reproductive",
    "Mental",
    "Respiratory",
    "Skeletal",
    "Skin",
    "Urinary",
  ];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);

  useEffect(() => {
    async function fetchData() {
      if (debouncedSearchValue.trim().length === 0) {
        setConditions([]);
        setRemedies([]);
        return; // Exit if search input is empty
      }
      let conditionList = [];
      let remList = [];
      for (const element of bpList) {
        const colRef = collection(db, `BodyParts/${element}/Conditions`);
        const q = query(colRef, orderBy("name"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          conditionList.push({
            ...doc.data(),
            key: doc.id,
            bp: element,
          });
        });
      }
      const q = query(collection(db, "Remedies"), orderBy("name"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        remList.push({
          ...doc.data(),
          id: doc.id,
        });
      });
      setConditions(conditionList);
      setRemedies(remList);
    }
    fetchData();
  }, [debouncedSearchValue]);

  const filteredConditions = useMemo(
    () =>
      conditions.filter((condition) =>
        condition.name
          .toLowerCase()
          .startsWith(debouncedSearchValue.toLowerCase())
      ),
    [debouncedSearchValue, conditions]
  );

  const filteredRemedies = useMemo(
    () =>
      remedies.filter((remedy) =>
        remedy.name.toLowerCase().startsWith(debouncedSearchValue.toLowerCase())
      ),
    [debouncedSearchValue, remedies]
  );

  const renderNotFound = (searchText) => (
    <Text style={styles.notFoundText}>No results found for "{searchText}"</Text>
  );

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: "green" }}
      style={{ backgroundColor: "white" }}
      labelStyle={{ color: "black" }}
    />
  );

  const renderRemedies = () => (
    <View>
      {filteredRemedies.length > 0 ? (
        <FlatList
          data={filteredRemedies}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              key={item.id}
              style={styles.listItem}
              onPress={() =>
                navigation.navigate("Remedy Details", { rem: item })
              }
            >
              <Image
                source={
                  item.image && item.image[0]
                    ? { uri: item.image[0] }
                    : require("../assets/leaf_icon.jpeg")
                }
                style={styles.herbImage}
              />
              <Text style={styles.herbName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        renderNotFound(debouncedSearchValue)
      )}
    </View>
  );

  const renderConditions = () => (
    <View>
      {filteredConditions.length > 0 ? (
        <FlatList
          data={filteredConditions}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              key={item.key}
              style={styles.listItem}
              onPress={() =>
                navigation.navigate("Remedies List", {
                  bp: item.bp,
                  con: item.name,
                })
              }
            >
              <View style={styles.bpIcon}>
                <MIcon size={10} {...iconMapper[removeSpace(item.bp)]} />
              </View>
              <Text style={styles.herbName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        renderNotFound(debouncedSearchValue)
      )}
    </View>
  );

  const renderScene = SceneMap({
    remedies: renderRemedies,
    conditions: renderConditions,
  });

  return (
    <View style={styles.rootContainer}>
      <SearchBar
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        placeholder="Search for remedies or conditions"
      />
      <TabView
        navigationState={{
          index,
          routes: [
            { key: "remedies", title: "Remedies" },
            { key: "conditions", title: "Conditions" },
          ],
        }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get("window").width }}
        renderTabBar={renderTabBar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  listItem: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  herbImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },

  herbName: {
    fontSize: 18,
    alignSelf: "center",
  },
  bpIcon: {
    marginRight: 10,
  },
  notFoundText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 18,
  },
});

export default SearchResultScreen;
