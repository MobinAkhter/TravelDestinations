import { useEffect, useRef, useState } from "react";
import {
  Modal,
  TextInput,
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Share,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { FontAwesome, SimpleLineIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import Collapsible from "react-native-collapsible";
import { AntDesign } from "@expo/vector-icons";
import { db, auth } from "../../firebase";
import BookMarkButton from "../../components/ui/BookmarkButton";
import FloatingScrollButton from "../../components/ui/FloatingScrollButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Swiper from "react-native-swiper";
import RNPickerSelect from "react-native-picker-select";
import * as Speech from "expo-speech"; // This is better cause the other lib wanted me to link it or something. Extra steps for expo managed workflow.
import Icon from "react-native-vector-icons/FontAwesome";
import { FieldValue } from "firebase/firestore";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

function HerbScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "herbInfo", title: "About Remedy" },
    { key: "herbDetails", title: "Herb Details" },
  ]);
  const [remedy, setRemedy] = useState({});
  // const [bookMarkText, setBookMarkText] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const { rem } = route.params || {};
  const [remediesList, setRemediesList] = useState([]);
  const firestore = getFirestore();

  useEffect(() => {
    AsyncStorage.clear(); // Important for clearing image cache issues.
    setIsLoading(true);
    const remedyKey = "remedy-" + rem.id;

    AsyncStorage.getItem(remedyKey).then((cachedData) => {
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        console.log("Retrieved from cache: ", data);
        const ageInMinutes = (Date.now() - timestamp) / (1000 * 60);
        if (ageInMinutes < 120) {
          setRemedy(data);
          setIsLoading(false);
          return;
        }
      }

      // Using the new Firestore modular syntax for fetching a document
      const docRef = doc(db, "Remedies", rem.id);
      getDoc(docRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Fetching remedy from Firebase", data);
            setRemedy(data);
            setIsLoading(false);
            AsyncStorage.setItem(
              remedyKey,
              JSON.stringify({ data, timestamp: Date.now() })
            );
          } else {
            console.log("No such document!");
            setIsLoading(false);
          }
        })
        .catch((error) => {
          console.error("Error fetching remedy from Firestore:", error);
          setIsLoading(false);
        });
    });

    // Fetching all remedies
    const remediesCollectionRef = collection(db, "Remedies");
    getDocs(remediesCollectionRef)
      .then((querySnapshot) => {
        const remedies = querySnapshot.docs.map((doc) => ({
          label: doc.data().name,
          value: doc.id,
        }));
        if (!remedies.some((item) => item.value === rem)) {
          remedies.unshift({ label: remedy.name, value: rem });
        }
        setRemediesList(remedies);
      })
      .catch((error) => {
        console.error("Error fetching remedies list:", error);
      });
  }, [rem]);

  const AboutRemedyTab = () => {
    return (
      <AboutRemedyScreen
        remedy={remedy}
        remediesList={remediesList}
        route={route}
        navigation={navigation}
      />
    );
  };
  const HerbDetailsTab = () => {
    // console.log(remedy.interactions);
    return <HerbDetails interactions={remedy.interactions} />;
  };
  const renderScene = SceneMap({
    herbInfo: AboutRemedyTab,
    herbDetails: HerbDetailsTab,
  });

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: "green" }}
      style={{ backgroundColor: "white" }}
      labelStyle={{ color: "black" }}
    />
  );

  const initialLayout = { width: Dimensions.get("window").width };

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={initialLayout}
      renderTabBar={renderTabBar}
    />
  );
}

const HerbDetails = ({ interactions }) => {
  // console.log("INTERACTIONS HERE ALL ABOUT IT", interactions);
  const [isPressed, setIsPressed] = useState(false);
  const scrollViewRef = useRef();
  const [voices, setVoices] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  const preferredVoices = [
    { name: "Rishi", identifier: "com.apple.voice.compact.en-IN.Rishi" },
    { name: "Samantha", identifier: "com.apple.voice.compact.en-US.Samantha" },
    { name: "Daniel", identifier: "com.apple.voice.compact.en-GB.Daniel" },
    { name: "Karen", identifier: "com.apple.voice.compact.en-AU.Karen" },
    { name: "Moira", identifier: "com.apple.voice.compact.en-IE.Moira" },
  ];
  const [selectedVoice, setSelectedVoice] = useState(
    preferredVoices[2].identifier
  );
  const [speechRate, setSpeechRate] = useState(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenText, setSpokenText] = useState("");

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  const { overview, ...otherInteractions } = interactions || {};
  const hasDetails =
    overview ||
    (otherInteractions && Object.keys(otherInteractions).length > 0);
  const increaseSpeechRate = () => {
    const newRate = speechRate + 0.1; // Increase the speech rate by 0.1
    setSpeechRate(newRate); // Update the speech rate state
    stopSpeech(); // Stop the current speech synthesis process
    speak(spokenText, newRate); // Start a new speech synthesis process with the updated rate
  };
  const speak = (text, rate = speechRate) => {
    setIsSpeaking(true);
    setSpokenText(text);
    const textChunks = chunkText(text, 4000);
    speakChunks(textChunks, rate);
  };

  const speakChunks = (chunks, rate) => {
    if (chunks.length === 0) {
      setIsSpeaking(false);
      return;
    }

    const chunk = chunks.shift();
    Speech.speak(chunk, {
      rate,
      voice: selectedVoice,
      onStart: () => {
        setIsSpeaking(true);
      },
      onDone: () => {
        speakChunks(chunks, rate);
      },
    });
  };
  const stopSpeech = () => {
    Speech.stop();
    setIsSpeaking(false);
    setSpokenText("");
  };

  const resumeSpeech = () => {
    if (spokenText) {
      speak(spokenText, speechRate);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Speech.getAvailableVoicesAsync().then((availableVoices) => {
      if (isMounted) {
        // Filter only the 5 preferred voices. Daniel will be the initial voice, cause that guy sounds best imo.
        const filteredVoices = availableVoices.filter((voice) =>
          preferredVoices.some(
            (pVoice) => pVoice.identifier === voice.identifier
          )
        );
        setVoices(filteredVoices);
      }
    });

    return () => {
      isMounted = false;
      Speech.stop();
    };
  }, []);

  function chunkText(text, maxLength) {
    const chunks = [];
    let i = 0;
    while (i < text.length) {
      chunks.push(text.substring(i, i + maxLength));
      i += maxLength;
    }
    return chunks;
  }

  return hasDetails ? (
    <>
      <ScrollView
        style={{ flex: 1, margin: 24, marginBottom: 0 }}
        showsVerticalScrollIndicator={false}
        ref={scrollViewRef}
      >
        {overview && (
          <View style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                // justifyContent: "space-between",
              }}
            >
              <Text style={styles.herbDetailHeader}>Interactions:</Text>
              <Text style={{ marginLeft: 30, marginRight: 20 }}>
                {isSpeaking ? "Stop Audio" : "Play Audio"}
              </Text>
              <TouchableOpacity
                style={{ marginRight: 20 }}
                onPress={
                  isSpeaking
                    ? stopSpeech
                    : () => speak(composeTextToSpeak(interactions), speechRate)
                }
              >
                <Icon
                  name={isSpeaking ? "stop" : "play"}
                  size={30}
                  color="#000"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={increaseSpeechRate}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <MaterialCommunityIcons
                  name="play-speed"
                  size={24}
                  color="black"
                />
                <Text style={{ marginLeft: 2 }}>{speechRate.toFixed(1)}X</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={resumeSpeech} disabled={!isPaused}>
                {/* <Icon name="play" size={30} color="#000" /> */}
              </TouchableOpacity>
            </View>

            <Text style={styles.interactionHeader}>
              {capitalizeFirstLetter("overview")}:
            </Text>
            <Text style={styles.interactionContent}>
              {typeof overview === "string" ? overview : overview.text}
            </Text>
            {/* Render evidence if it exists */}
            {overview.evidence && (
              <Text style={styles.evidenceText}>
                Clinical Evidence: {overview.evidence}
              </Text>
            )}
          </View>
        )}

        {Object.entries(otherInteractions).map(([key, value]) => {
          const content = typeof value === "string" ? value : value.text;
          const evidence = typeof value === "object" ? value.evidence : null;

          return (
            <View key={key} style={{ marginBottom: 20 }}>
              <Text style={styles.interactionHeader}>
                {capitalizeFirstLetter(key)}:
              </Text>
              <Text style={styles.interactionContent}>{content}</Text>
              {evidence && (
                <Text style={styles.evidenceText}>
                  Clinical Evidence: {evidence}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
      <FloatingScrollButton scrollViewRef={scrollViewRef} />
    </>
  ) : (
    <View style={styles.noDetailsContainer}>
      <Text style={styles.noDetailsText}>No Herb Details Available</Text>
    </View>
  );
};

function composeTextToSpeak(interactions) {
  let textToSpeak = "Interactions: ";

  // Add the overview text, if it exists.
  if (interactions.overview) {
    textToSpeak += `\nOverview: ${interactions.overview}`;
  }

  // Loop through each interaction.
  for (const [key, value] of Object.entries(interactions)) {
    if (key !== "overview") {
      // Check if the value is a string and not empty.
      if (typeof value === "string" && value.trim() !== "") {
        textToSpeak += `\n${capitalizeFirstLetter(key)}: ${value}`;
      }
      // If it's an object with text and evidence properties.
      else if (typeof value === "object") {
        if (value.text && value.text.trim() !== "") {
          textToSpeak += `\n${capitalizeFirstLetter(key)}: ${value.text}`;
        }
        if (value.evidence && value.evidence.trim() !== "") {
          textToSpeak += `\nClinical Evidence for ${capitalizeFirstLetter(
            key
          )}: ${value.evidence}`;
        }
      }
    }
  }

  return textToSpeak;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function AboutRemedyScreen({ remedy, navigation, remediesList }) {
  const route = useRoute();
  const { rem } = route.params || {};
  const { herbDetail } = route.params;

  const [herbInput, setHerbInput] = useState("");
  const [selectedRemedy, setSelectedRemedy] = useState(rem);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDescriptionCollapsed, setDescriptionCollapsed] = useState(true);
  const [isPrecautionsCollapsed, setPrecautionsCollapsed] = useState(true);
  const [isPropertiesCollapsed, setPropertiesCollapsed] = useState(true);
  const [isDosageCollapsed, setDosageCollapsed] = useState(true);
  const scrollViewRef = useRef();

  const [isPressed, setIsPressed] = useState(false);

  const [selectedCondition, setSelectedCondition] = useState();
  const [notes, setNotes] = useState("");

  const [bookMarkText, setBookMarkText] = useState("Bookmark");
  const auth = getAuth();
  const user = auth.currentUser ? auth.currentUser.uid : null;

  const firestore = getFirestore();
  const userRef = doc(firestore, "users", user);

  //TODO: Put this in components and reuse it

  const shareHerbDetails = async () => {
    let message = `Check out this herb: ${remedy.name}.\n\n`;

    if (remedy.description) {
      message += `Description: ${remedy.description}\n`;
    }

    if (remedy.properties) {
      message += `Properties: ${remedy.properties}\n`;
    }

    if (remedy.precautions) {
      message += `Precautions: ${remedy.precautions}\n`;
    }

    console.log("Sharing Message: ", message);

    //TODO: If we want to share dosage, logic should be updated since dosage is an array.
    // Did not implement this, cause why give the message recipient all this info. Download the app 🤷🏻‍♂️

    try {
      const result = await Share.share({
        message: message,
        title: "Learn about ${remedy.name}",
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Shared with activity type: ", result.activityType);
        } else {
          // alert("Thanks for sharing!");
          // These alerts don't look good to me based on UX
        }
      } else if (result.action === Share.dismissedAction) {
        // alert("Share cancelled.");
      }
    } catch (error) {
      alert(error.message);
    }
  };
  useEffect(() => {
    if (rem) {
      setSelectedRemedy(rem);
    }
  }, [rem]);
  const openModalWithSelectedRemedy = () => {
    setSelectedRemedy(rem);
    setModalVisible(true);
  };
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={{ marginRight: 16 }}
            onPress={() => shareHerbDetails(selectedRemedy)}
          >
            <SimpleLineIcons name="share" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={openModalWithSelectedRemedy}>
            <SimpleLineIcons name="note" size={24} color="black" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, selectedRemedy]);

  //TODO: This does not work on Herb Details tab. FIX ME
  const saveNotes = async () => {
    // changing from selectedRemedy to setHerbInput cause moving from picker to text input
    if (herbInput && (selectedCondition || notes)) {
      const userNotesRef = doc(firestore, "users", user, "notes", herbInput);
      try {
        await setDoc(
          userNotesRef,
          {
            herb: herbInput,
            notes: notes,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
        Alert.alert("Notes saved successfully!");
        setModalVisible(false);
      } catch (error) {
        console.error("Error saving notes:", error);
      }
    }
  };

  useEffect(() => {
    const checkBookMark = async () => {
      try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const currentBookmarks = docSnap.data().bookmarks || [];
          const isRemedyBookmarked = currentBookmarks.some(
            (item) => item.name === remedy
          );
          setBookMarkText(isRemedyBookmarked ? "Remove Bookmark" : "Bookmark");
        }
      } catch (error) {
        console.error("Error checking bookmarks:", error);
      }
    };

    if (user) {
      checkBookMark();
    }
  }, [remedy, user]);

  //bookmark remedy function
  const bookMarkRemedy = async () => {
    try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const currentBookmarks = userData.bookmarks || [];
        const remedyIndex = currentBookmarks.findIndex(
          (item) => item.name === rem.name
        );

        if (remedyIndex === -1) {
          currentBookmarks.push(rem);
          await updateDoc(userRef, { bookmarks: currentBookmarks });
          Alert.alert(`${rem.name} has been bookmarked!`);
          setBookMarkText("Remove Bookmark");
        } else {
          currentBookmarks.splice(remedyIndex, 1);
          await updateDoc(userRef, { bookmarks: currentBookmarks });
          Alert.alert(`${rem.name} has been removed from your bookmarks!`);
          setBookMarkText("Bookmark");
        }
      }
    } catch (error) {
      console.error("Error updating bookmarks:", error);
    }
  };

  return (
    <View style={styles.rootContainer}>
      <Modal
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modal}>
          <Text style={styles.header}>Add Notes</Text>
          <View>
            {/* <DropDown
              items={remediesList}
              defaultValue={selectedRemedy}
              containerStyle={{ height: 40 }}
              style={{ backgroundColor: "#fafafa" }}
              itemStyle={{
                justifyContent: "flex-start",
              }}
              dropDownStyle={{ backgroundColor: "#fafafa" }}
              onChangeItem={(item) => setSelectedRemedy(item.value)}
            /> */}

            <TextInput
              placeholder="Herb Name: "
              value={herbInput}
              onChangeText={setHerbInput}
              style={styles.textInput}
              accessibilityLabel="Herb Name input field"
            />

            <TextInput
              placeholder="Write your notes here"
              multiline
              numberOfLines={4}
              onChangeText={setNotes}
              value={notes}
              style={styles.input}
              accessibilityLabel="Notes input field"
            />
          </View>
          <TouchableOpacity onPress={saveNotes} style={styles.saveButton}>
            <Text style={styles.buttonText}>Save Note</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={styles.closeButton}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
      <ScrollView showsVerticalScrollIndicator={false} ref={scrollViewRef}>
        <View style={styles.container}>
          <Text style={styles.title}>{remedy.name}</Text>

          <Swiper
            style={styles.wrapper}
            showsButtons={true}
            loop={(remedy.image && remedy.image.length > 1) || false}
            showsPagination={false}
            buttonWrapperStyle={styles.buttonWrapper}
            nextButton={<Text style={styles.swipeButton}>›</Text>}
            prevButton={<Text style={styles.swipeButton}>‹</Text>}
          >
            {(remedy.image && remedy.image.length > 0
              ? remedy.image
              : ["defaultImageAssetPath"]
            ).map((imageUri, index) => (
              <View key={index} style={styles.slide}>
                <Image
                  source={
                    imageUri
                      ? { uri: imageUri }
                      : require("../../assets/leaf_icon.jpeg")
                  }
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
            ))}
          </Swiper>

          <View style={styles.info}>
            {remedy.description && remedy.description.trim().length > 0 && (
              <>
                <View style={[styles.titleRow, { marginTop: 10 }]}>
                  <Text style={styles.head}>Description</Text>
                  <AntDesign
                    name={isDescriptionCollapsed ? "down" : "up"}
                    size={24}
                    onPress={() =>
                      setDescriptionCollapsed(!isDescriptionCollapsed)
                    }
                    style={{
                      paddingHorizontal: 5,
                    }}
                  />
                </View>
                <Collapsible collapsed={isDescriptionCollapsed}>
                  <Text style={styles.desc}>{remedy.description}</Text>
                </Collapsible>
                <View style={styles.divider} />
              </>
            )}

            {/* Adding properties section for herbs */}
            {remedy.properties && remedy.properties.trim().length > 0 && (
              <>
                <View style={styles.titleRow}>
                  <Text style={styles.head}>Properties</Text>
                  <AntDesign
                    name={isPropertiesCollapsed ? "down" : "up"}
                    size={24}
                    onPress={() =>
                      setPropertiesCollapsed(!isPropertiesCollapsed)
                    }
                    style={{
                      paddingHorizontal: 5,
                    }}
                  />
                </View>
                <Collapsible collapsed={isPropertiesCollapsed}>
                  <Text style={styles.desc}>{remedy.properties}</Text>
                </Collapsible>
                <View style={styles.divider} />
              </>
            )}
            {remedy.precautions && remedy.precautions.trim().length > 0 && (
              <>
                <View style={styles.titleRow}>
                  <Text style={styles.head}>Precautions</Text>
                  <AntDesign
                    name={isPrecautionsCollapsed ? "down" : "up"}
                    size={24}
                    onPress={() =>
                      setPrecautionsCollapsed(!isPrecautionsCollapsed)
                    }
                    style={{
                      paddingHorizontal: 5,
                    }}
                  />
                </View>
                <Collapsible collapsed={isPrecautionsCollapsed}>
                  <Text style={styles.desc}>{remedy.precautions}</Text>
                </Collapsible>
                <View style={styles.divider} />
              </>
            )}
            {/* Adding dosage section for herbs */}
            {remedy.dosage && remedy.dosage.length > 0 && (
              <>
                <View style={styles.titleRow}>
                  <Text style={styles.head}>Dosage Forms</Text>
                  <AntDesign
                    name={isDosageCollapsed ? "down" : "up"}
                    size={24}
                    onPress={() => setDosageCollapsed(!isDosageCollapsed)}
                    style={{
                      paddingHorizontal: 5,
                    }}
                  />
                </View>
                <Collapsible collapsed={isDosageCollapsed}>
                  {remedy.dosage &&
                    Object.entries(remedy.dosage[0]).map(
                      ([field, value], index) => (
                        <View key={index} style={styles.dosageRow}>
                          <Text style={styles.dosageField}>{field}: </Text>
                          <Text style={styles.desc}>{value}</Text>
                        </View>
                      )
                    )}
                  <TouchableOpacity
                    style={styles.prepBlock}
                    onPress={() => {
                      navigation.navigate("Herb Preparation");
                    }}
                  >
                    <Text>
                      For information on how to prepare herbs, visit{" "}
                      <Text style={styles.prepLink}>preparations</Text>
                    </Text>
                  </TouchableOpacity>
                </Collapsible>
                <View style={styles.divider} />
              </>
            )}
          </View>

          <View style={{ alignItems: "center" }}>
            <BookMarkButton onPress={bookMarkRemedy}>
              {bookMarkText}
            </BookMarkButton>
          </View>
        </View>
        <View style={styles.emptyContainer}></View>
      </ScrollView>
      <FloatingScrollButton scrollViewRef={scrollViewRef} />
    </View>
  );
}
export default HerbScreen;

const styles = StyleSheet.create({
  rootContainer: {
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 24,
    // padding: 24,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  wrapper: {
    height: 200,
    marginBottom: 16,
  },
  buttonWrapper: {
    // backgroundColor: "rgba(255, 255, 255, 0.5)",
    paddingHorizontal: 10,
  },
  swipeButton: {
    color: "white",
    fontSize: 70,
    fontWeight: "600",
  },
  image: {
    width: 400,
    height: undefined,
    aspectRatio: 1.5,
  },
  desc: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "left",
  },
  head: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  modal: {
    margin: 20,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 5,
  },
  header: {
    fontSize: 26,
    marginBottom: 20,
    fontWeight: "bold",
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
  },
  input: {
    borderColor: "gray",
    borderWidth: 1,
    marginTop: 15,
    marginBottom: 20,
    height: 120,
    padding: 12,
    borderRadius: 8,
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: "#FF5733",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
  },
  dosageRow: {
    // flexDirection: "row",
    paddingVertical: 5,
  },
  dosageField: {
    fontWeight: "bold",
    fontSize: 16,
    lineHeight: 24,
  },

  divider: {
    borderBottomColor: "gainsboro",
    borderBottomWidth: 1,
    marginVertical: 9,
  },
  herbDetailHeader: {
    fontWeight: "bold",
    fontSize: 22,
    marginVertical: 10,
  },
  interactionHeader: {
    fontWeight: "bold",
    fontSize: 16,
  },
  interactionContent: {
    // fontSize: 14,
    // width: "100%",
    // height: "100%",
  },
  evidenceText: {
    fontStyle: "italic",
    fontSize: 14,
    marginTop: 10,
  },
  prepBlock: {
    marginTop: 15,
  },
  prepLink: {
    textDecorationLine: "underline",
    color: "blue",
  },
  noDetailsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20, // Adjust padding as needed
    backgroundColor: "#f2f2f2", // Soft background color for contrast
  },
  noDetailsText: {
    fontSize: 24, // Large, readable text
    fontWeight: "bold", // Bold text for emphasis
    color: "#2e8b57", // Color that signifies nature or herbal theme
    textAlign: "center", // Ensure text is centered
    padding: 10, // Add some padding for spacing
    borderRadius: 10, // Optional: round corners for a softer look
    borderWidth: 2, // Optional: border to make the text stand out more
    borderColor: "#2e8b57", // Border color to match the text
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Slightly transparent background for depth
    shadowColor: "#000", // Shadow for a subtle depth effect
    shadowOffset: { width: 0, height: 2 }, // Shadow direction
    shadowOpacity: 0.25, // Shadow visibility
    shadowRadius: 3.84, // Shadow blur radius
    elevation: 5, // Elevation for Android shadow
  },
  textInput: {
    fontSize: 18,
    height: 40, // Adjust height as needed
    // margin: ,
    borderWidth: 1,
    borderColor: "#ccc", // Light grey border
    backgroundColor: "#fafafa", // Light grey background
    padding: 10,
    borderRadius: 5, // Rounded corners for a softer look
  },
  emptyContainer: {
    marginTop: 30,
  },
});
