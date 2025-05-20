import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Text,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../../context/AuthContext";
import { useViewToggle } from "../../../context/ViewToggleContext";
import axios from "axios";
import { API_BASE_URL } from "@env";

export default function UserDashboard() {
  const router = useRouter();
  const { userId, authRequest, token } = useAuth();
  const [recentBooks, setRecentBooks] = useState([]);
  const [pendingBooks, setPendingBooks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { showPending } = useViewToggle();

  const fetchRecentViewedBooks = async () => {
    if (!userId) return;
    try {
      const response = await authRequest(
        `${process.env.API_BASE_URL}/user/${userId}/recent-views/`
      );
      setRecentBooks(response.data);
    } catch (err) {
      console.error("Error fetching recent books:", err);
    }
  };

  const fetchPendingBooks = async () => {
    if (!userId) return;
    try {
      const response = await authRequest(
        `${process.env.API_BASE_URL}/user/${userId}/pending-books/`
      );
      setPendingBooks(response.data);
    } catch (err) {
      console.error("Error fetching pending books:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecentViewedBooks();
      fetchPendingBooks();
    }, [userId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecentViewedBooks();
    await fetchPendingBooks();
    setRefreshing(false);
  };

  const handleBookPress = (id) => {
    router.push(`../screens/about?id=${id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>
            {showPending ? "My Pending" : "Recently Viewed"}
          </Text>
        </View>

        <View style={styles.bookGrid}>
          {(showPending ? pendingBooks : recentBooks).map((book) => (
            <TouchableOpacity
              key={book.id || book.books_id}
              style={styles.bookContainer}
              onPress={() => handleBookPress(book.id || book.books_id)}
            >
              <Image
                source={{
                  uri: book.cover_image || book.coverUrl || book.cover_url,
                }}
                style={styles.coverImage}
                resizeMode="cover"
              />
              <Text style={styles.bookTitle} numberOfLines={2}>
                {book.title}
              </Text>
              <Text style={styles.bookAuthor} numberOfLines={1}>
                {book.author}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#A9DEFF",
    paddingBottom: 50,
  },
  scrollView: {
    padding: 10,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 10,
  },
  sectionTitle: {
    fontSize: 14,
    margin: 10,
    color: "#222",
  },
  bookGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 20,
  },
  bookContainer: {
    width: "45%",
    aspectRatio: 0.65,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  coverImage: {
    width: "100%",
    height: "70%",
  },
  bookTitle: {
    fontSize: 14,
    padding: 5,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },
  bookAuthor: {
    fontSize: 12,
    paddingHorizontal: 8,
    color: "#555",
    textAlign: "center",
    fontStyle: "italic",
  },
});
