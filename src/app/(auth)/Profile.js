import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function ProfileScreen() {
  const { userData } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    console.log("User Data:", userData);
  }, [userData]);

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Ionicons name="person-circle-outline" size={100} color="#3b82f6" />
      </View>

      {/* User Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Full Name</Text>
        <Text style={styles.value}>{userData?.full_name ?? "N/A"}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{userData?.email ?? "N/A"}</Text>

        <Text style={styles.label}>ID Number</Text>
        <Text style={styles.value}>{userData?.id_number ?? "N/A"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.06,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: height * 0.05,
    paddingBottom: height * 0.02,
    width: "100%",
  },
  backButton: {
    paddingRight: width * 0.04,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3b82f6",
  },
  avatarContainer: {
    marginBottom: height * 0.04,
    alignItems: "center",
    width: "100%",
  },
  infoContainer: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginTop: height * 0.02,
    marginBottom: 2,
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
});
