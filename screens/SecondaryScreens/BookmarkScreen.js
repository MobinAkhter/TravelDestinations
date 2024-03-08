import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { AntDesign } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";

const BookmarkScreen = () => {
  const navigation = useNavigation();
  const user = auth.currentUser.uid;
  const userRef = doc(db, "users", user); // Adjusted for Firestore modular SDK
  const [bookmarkCollection, setBookmarkCollection] = useState([]);

  const fetchBookmarks = async () => {
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      setBookmarkCollection(userData.bookmarks || []);
    } else {
      setBookmarkCollection([]);
    }
  };

  const clickX = (name) => {
    Alert.alert(
      "Warning",
      `Are you sure you want to remove ${name} from your bookmarks?`,
      [
        { text: "Yes", onPress: () => removeBookmark(name) },
        {
          text: "No",
          style: "cancel",
        },
      ]
    );
  };

  const removeBookmark = async (remedyName) => {
    const newBookmarks = bookmarkCollection.filter(
      (item) => item.name !== remedyName
    );
    await updateDoc(userRef, { bookmarks: newBookmarks });
    fetchBookmarks(); // Refresh bookmarks after removal
  };

  const renderRightActions = (progress, dragX, name) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity
        onPress={() => clickX(name)}
        style={styles.deleteButton}
      >
        <Animated.View
          style={[styles.trashIconContainer, { transform: [{ scale }] }]}
        >
          <AntDesign name="delete" size={24} color="white" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(userRef, (doc) => {
      const userData = doc.data();
      setBookmarkCollection(userData?.bookmarks || []);
    });

    return unsubscribe; // Detach listener on unmount
  }, []);

  return (
    <View style={{ backgroundColor: "white", flex: 1 }}>
      <FlatList
        data={bookmarkCollection}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={(progress, dragX) =>
              renderRightActions(progress, dragX, item.name)
            }
          >
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Remedy Details", { rem: item })
              }
            >
              <View style={styles.listItemContainer}>
                <Image
                  source={
                    item.image && item.image[0]
                      ? { uri: item.image[0] }
                      : require("../../assets/leaf_icon.jpeg")
                  }
                  style={styles.listItemHerbImage}
                />
                <Text style={styles.listItemText}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          </Swipeable>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bookmarks yet.</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  listItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    marginVertical: 6,
    marginHorizontal: 12,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  listItemHerbImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  listItemText: {
    flex: 1,
  },
  listItemXButton: {
    padding: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginHorizontal: 12,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#AAAAAA",
  },
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "flex-end",
    width: 100,
    height: "100%",
  },
  trashIconContainer: {
    width: 100,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BookmarkScreen;
