import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
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

  const Option = ({ iconName, label, onPress }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
      android_ripple={{ color: "#ddd" }}
    >
      <View style={styles.optionLeft}>
        <Ionicons name={iconName} size={28} color="#3b82f6" />
        <Text style={styles.optionText}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#888" />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Option
        iconName="person-circle-outline"
        label="Profile"
        onPress={() => router.push("/(auth)/Profile")}
      />
      <Option
        iconName="help-circle-outline"
        label="Help"
        onPress={() => router.push("/(auth)/Help")}
      />
      <Option
        iconName="information-circle-outline"
        label="About"
        onPress={() => {
          router.push("/(auth)/About");
        }}
      />
      <Option
        iconName="log-out-outline"
        label="Logout"
        onPress={handleLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#A9DEFF",
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.03,
  },
  option: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
    marginBottom: height * 0.02,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  optionPressed: {
    backgroundColor: "#e0e7ff",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: width * 0.04,
    color: "#1e40af",
  },
});
