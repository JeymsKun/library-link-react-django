import React, { useState, useMemo } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import QuestionList from "./QuestionList";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const QUESTIONS = [
  {
    q: "How do I reset my password?",
    a: "Tap 'Library User' login screen and tap 'Forgot Password?' to reset.",
  },
  {
    q: "How do I contact support?",
    a: "Email maserinjames50@hotmail.com or visit our website Library Link Official.",
  },
  {
    q: "How do I see my profile information?",
    a: "Go to the more screen and tap 'Profile' to see your profile information.",
  },
  {
    q: "How can I borrow a book?",
    a: "Search for a book, tap 'Add to Book Cart' see if it's available, and then tap 'Borrow' to borrow a book.",
  },
  {
    q: "Where can I view my borrowed items?",
    a: "Go to the 'History' section to view all your borrowed books along with reserve books.",
  },
  {
    q: "How do I search for books?",
    a: "Go to the 'Library' and Tap the search bar at the top of the home screen to find books by title, author, ISBN, published data, or publisher.",
  },
  {
    q: "Is there a limit to how many books I can borrow?",
    a: "Yes, users can borrow up to 5 books at a time.",
  },
  {
    q: "How do I log out of my account?",
    a: "Go to the 'More' and tap the 'Logout' option.",
  },
];

const COMMON_QUESTIONS = QUESTIONS.slice(0, 5);

export default function QuestionDataHandler() {
  const [searchText, setSearchText] = useState("");

  const filteredQuestions = useMemo(() => {
    if (!searchText.trim()) return COMMON_QUESTIONS;

    const lower = searchText.toLowerCase();
    return QUESTIONS.filter(
      ({ q, a }) =>
        q.toLowerCase().includes(lower) || a.toLowerCase().includes(lower)
    );
  }, [searchText]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.flexOne}
    >
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#999"
          style={{ marginLeft: 8 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search questions..."
          value={searchText}
          onChangeText={setSearchText}
          clearButtonMode="while-editing"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <QuestionList questions={filteredQuestions} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: width * 0.05,
    marginBottom: height * 0.015,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: "#333",
  },
  contentContainer: {
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.05,
  },
});
