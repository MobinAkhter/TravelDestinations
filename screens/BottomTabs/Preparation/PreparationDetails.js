import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ScrollView, Image } from "react-native";
import { doc, getDoc } from "firebase/firestore"; // Updated import for Firestore modular SDK
import { db } from "../../../firebase"; // Ensure db is correctly initialized in your firebase.js

function PreparationDetails({ route }) {
  const { method } = route.params;
  const [prepDetails, setPreparationDetails] = useState(null);

  const fetchDetails = async () => {
    const prepRef = doc(db, "Preparations", method); // Updated reference to preparation document
    try {
      const docSnap = await getDoc(prepRef);
      if (docSnap.exists()) {
        console.log("Fetching details from Firebase", docSnap.data());
        setPreparationDetails(docSnap.data());
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching details from Firestore:", error);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [method]);

  return (
    <View style={styles.rootContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {prepDetails && (
            <>
              <Text style={styles.title}>{prepDetails.name}</Text>
              <Image source={{ uri: prepDetails.image }} style={styles.image} />
              <View style={styles.info}>
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.head}>Description</Text>
                  <Text style={styles.desc}>{prepDetails.description}</Text>
                </View>
                <View style={styles.divider} />
                <View>
                  <Text style={styles.head}>Steps to Make</Text>
                  {prepDetails.steps && prepDetails.steps.length > 0 ? (
                    prepDetails.steps.map((step, index) => (
                      <View key={index} style={styles.stepContainer}>
                        <View style={styles.stepNumberContainer}>
                          <Text style={styles.stepNumber}>{index + 1}.</Text>
                        </View>
                        <View style={styles.stepTextContainer}>
                          <Text style={styles.stepText}>{step}</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text>No steps available</Text>
                  )}
                </View>

                <View style={styles.divider} />
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.head}>Quantity</Text>
                  <Text style={styles.desc}>{prepDetails.quantity}</Text>
                </View>
                <View style={styles.divider} />
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.head}>Standard Dose</Text>
                  <Text style={styles.desc}>{prepDetails.dose}</Text>
                </View>
                <View style={styles.divider} />
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.head}>Storage</Text>
                  <Text style={styles.desc}>{prepDetails.storage}</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
export default PreparationDetails;

const styles = StyleSheet.create({
  rootContainer: {
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 24,
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
  divider: {
    borderBottomColor: "gainsboro",
    borderBottomWidth: 1,
    marginVertical: 9,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  stepNumberContainer: {
    marginRight: 8,
    width: 40,
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 45,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepText: {
    fontSize: 16,
  },
});
