import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../../context/AuthContext";

const { width, height } = Dimensions.get("window");

export default function MoreSettings() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login/");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.option}>
        <Ionicons name="settings" size={height * 0.03} color="#000" />
        <Text style={styles.optionText}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option}>
        <Ionicons name="help-circle" size={height * 0.03} color="#000" />
        <Text style={styles.optionText}>Help</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option}>
        <Ionicons name="information-circle" size={height * 0.03} color="#000" />
        <Text style={styles.optionText}>About</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={handleLogout}>
        <Ionicons name="log-out" size={height * 0.03} color="#000" />
        <Text style={styles.optionText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#A9DEFF",
    padding: width * 0.05,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.03,
  },
  optionText: {
    fontSize: width * 0.041,
    fontWeight: "500",
    marginLeft: width * 0.03,
    color: "#000",
  },
});
