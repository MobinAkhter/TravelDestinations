import { Pressable, StyleSheet, Text, View } from "react-native";

function Button({ children, onPress, disabled }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={disabled ? () => {} : onPress}
      disabled={disabled}
    >
      <View>
        <Text style={[styles.buttonText, disabled && styles.disabledText]}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

export default Button;

const styles = StyleSheet.create({
  button: {
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "white",
    elevation: 2,
    shadowColor: "black",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    textAlign: "center",
    color: "black",
    fontSize: 17,
    fontWeight: "bold",
  },
  disabled: {
    backgroundColor: "#CCCCCC",
    shadowOpacity: 0,
  },
  disabledText: {
    color: "#999999",
  },
});
