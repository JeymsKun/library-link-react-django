import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function About() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={28} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Image
          source={require("../../assets/library-official-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.heading}>About This App</Text>

        <Text style={styles.sectionTitle}>Greetings</Text>
        <Text style={styles.paragraph}>
          Welcome to our Library Link App! We are excited to provide you with an
          easy and enjoyable way to manage your books, track your favorites, and
          stay updated with your reading list.
        </Text>

        <Text style={styles.sectionTitle}>Creators</Text>
        <View style={styles.creatorsList}>
          <Text style={styles.creator}>• James David Maserin</Text>
          <Text style={styles.creator}>• Zia Shyr Dumape</Text>
          <Text style={styles.creator}>• Reiven Singedas Tacang</Text>
        </View>

        <Text style={styles.sectionTitle}>Our Intentions</Text>
        <Text style={styles.paragraph}>
          This app is designed to bring convenience to book lovers by combining
          easy browsing, personalized tracking, and a community-driven platform
          for sharing and discovering books.
        </Text>

        <Text style={styles.sectionTitle}>Copyright & License</Text>
        <Text style={styles.paragraph}>
          © 2025 Library App Team. All rights reserved. This software is
          distributed under the MIT License.
        </Text>

        <Text style={styles.footerText}>
          Thank you for choosing our app — happy reading!
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: width * 0.06,
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
  contentContainer: {
    paddingBottom: height * 0.1,
    alignItems: "center",
  },
  logo: {
    width: width * 0.4,
    aspectRatio: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e40af",
    marginBottom: height * 0.03,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563eb",
    marginTop: height * 0.02,
    marginBottom: height * 0.01,
    alignSelf: "flex-start",
  },
  paragraph: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    alignSelf: "flex-start",
  },
  creatorsList: {
    marginLeft: width * 0.02,
    marginBottom: height * 0.02,
    alignSelf: "flex-start",
  },
  creator: {
    fontSize: 16,
    color: "#1e40af",
    fontWeight: "600",
    marginBottom: height * 0.008,
  },
  footerText: {
    marginTop: height * 0.05,
    textAlign: "center",
    fontStyle: "italic",
    color: "#555",
    fontSize: 14,
  },
});
