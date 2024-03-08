import { Pressable, StyleSheet, Text, View } from "react-native";

function BookMarkButton({ children, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View>
        <Text style={styles.buttonText}>{children}</Text>
      </View>
    </Pressable>
  );
}

export default BookMarkButton;

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#35D96F",
    elevation: 2,
    width: 240,
    height: 45,
    shadowColor: "black",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    marginTop: 20,
    borderColor: "#35D96F",
    borderWidth: 3,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    textAlign: "center",
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
});
