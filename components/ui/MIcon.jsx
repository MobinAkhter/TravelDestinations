import React from 'react';
import { Fontisto } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const MIcon = ({ name, family }) => {
    if (family === "MaterialCommunityIcons") {
      return <MaterialCommunityIcons name={name} size={40} color="black" />;
    } else if (family === "Ionicons") {
      return <Ionicons name={name} size={40} color="black" />;
    } else if (family === "Fontisto") {
      return <Fontisto name={name} size={40} color="black" />;
    } else {
      return <FontAwesome5 name={name} size={40} color="black" />;
    }
  };

  export default MIcon;
  