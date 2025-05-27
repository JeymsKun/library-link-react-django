import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import QuestionDataHandler from "../../components/QuestionDataHandler";

const { width, height } = Dimensions.get("window");

export default function HelpScreen() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <View style={styles.content}>
        <QuestionDataHandler />
      </View>

      <View style={styles.footer}>
        <Text style={styles.appVersion}>App Version 2.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
    marginTop: height * 0.05,
    marginBottom: height * 0.02,
  },
  backButton: {
    marginRight: width * 0.04,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3b82f6",
  },
  content: {
    flex: 1,
  },
  footer: {
    paddingVertical: height * 0.05,
    alignItems: "center",
  },
  appVersion: {
    fontSize: 14,
    color: "#888",
  },
});
