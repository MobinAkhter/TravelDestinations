import React, { useState, useEffect, useContext, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { UserContext } from "../../contexts/userContext";
import { auth, db } from "../../firebase";
import {
  signOut,
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

function UserProfileScreen({ navigation }) {
  const { setUser } = useContext(UserContext);
  const [userData, setUserData] = useState(null);
  const [isEditingFirstName, setEditingFirstName] = useState(false);
  const [isEditingLastName, setEditingLastName] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "User Profile",
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigation.replace("Login");
  };

  const updateUserField = async (field, value) => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, { [field]: value }, { merge: true });
      setUserData((prev) => ({ ...prev, [field]: value }));
      if (field === "firstName") setEditingFirstName(false);
      if (field === "lastName") setEditingLastName(false);
      Alert.alert(
        "Success",
        `${
          field === "firstName" ? "First Name" : "Last Name"
        } updated successfully.`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || newPassword !== confirmPassword) {
      Alert.alert("Error", "Please check your inputs.");
      return;
    }
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      Alert.alert("Success", "Password updated successfully.");
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <FieldWithEdit
        label="First Name"
        isEditing={isEditingFirstName}
        originalValue={userData?.firstName ?? ""}
        onSave={(value) => updateUserField("firstName", value)}
        onCancel={() => setEditingFirstName(false)}
        onEdit={() => setEditingFirstName(true)}
      />
      <FieldWithEdit
        label="Last Name"
        isEditing={isEditingLastName}
        originalValue={userData?.lastName ?? ""}
        onSave={(value) => updateUserField("lastName", value)}
        onCancel={() => setEditingLastName(false)}
        onEdit={() => setEditingLastName(true)}
      />
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="lock" size={20} style={styles.buttonIcon} />
        <Text style={styles.btnText}>Change Password</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <TextInput
            placeholder="Old Password"
            secureTextEntry
            value={oldPassword}
            onChangeText={setOldPassword}
            style={styles.modalInput}
          />
          <TextInput
            placeholder="New Password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.modalInput}
          />
          <TextInput
            placeholder="Confirm New Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.modalInput}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleChangePassword}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const FieldWithEdit = ({
  label,
  isEditing,
  originalValue,
  onSave,
  onCancel,
  onEdit,
}) => {
  const [inputValue, setInputValue] = useState(originalValue);

  useEffect(() => {
    setInputValue(originalValue);
  }, [originalValue]);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.text}>{label}:</Text>
      {isEditing ? (
        <>
          <TextInput
            style={styles.textInput}
            value={inputValue}
            onChangeText={setInputValue}
            autoFocus
          />
          <TouchableOpacity
            onPress={() => onSave(inputValue)}
            style={styles.saveIcon}
          >
            <Icon name="check" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onCancel} style={styles.cancelIcon}>
            <Icon name="times" size={20} />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.textValue}>{originalValue}</Text>
          <TouchableOpacity onPress={onEdit} style={styles.editIcon}>
            <Icon name="pencil" size={20} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  continueButton: {
    flexDirection: "row",
    backgroundColor: "#1E6738",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonIcon: {
    marginRight: 10,
    color: "white",
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
  textInput: {
    flex: 1,
    padding: 10,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  textValue: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  editIcon: {
    padding: 10,
  },
  saveIcon: {
    padding: 10,
  },
  cancelIcon: {
    padding: 10,
  },
  modalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },
  modalInput: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#1E6738",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutText: {
    color: "white",
    fontSize: 18,
    padding: 13,
    textAlign: "center",
  },
});

export default UserProfileScreen;
