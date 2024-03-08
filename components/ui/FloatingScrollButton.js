import React, { useState } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const FloatingScrollButton = ({ scrollViewRef }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    if (scrollViewRef && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  return (
    <TouchableOpacity
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={handlePress}
      style={[
        styles.buttonStyle,
        { backgroundColor: isPressed ? "#dedede" : "white" },
      ]}
      activeOpacity={1}
    >
      <FontAwesome
        name="arrow-up"
        size={24}
        color={isPressed ? "white" : "gray"}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonStyle: {
    position: "absolute",
    bottom: 10,
    right: 10,
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },
});

export default FloatingScrollButton;
