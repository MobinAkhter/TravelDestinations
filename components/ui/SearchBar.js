import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";

const SearchBar = ({
  searchValue,
  setSearchValue,
  placeholder,
  onSearchPress,
}) => {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          keyboardType="default"
          onChangeText={setSearchValue}
          value={searchValue}
        />
      </View>

      <TouchableOpacity style={styles.searchBtn} onPress={onSearchPress}>
        <MagnifyingGlassIcon
          color="white"
          size={20}
          style={styles.searchIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    marginTop: 20,
    height: 50,
    marginBottom: 10,
    justifyContent: "center",
  },
  searchWrapper: {
    backgroundColor: "white",
    marginRight: 12,
    borderRadius: 16,
    width: "65%",
  },
  searchInput: {
    height: "100%",
    paddingHorizontal: 16,
  },
  searchBtn: {
    width: 45,
    backgroundColor: "#35D96F",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SearchBar;
