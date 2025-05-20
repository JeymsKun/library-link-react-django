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
import axiosInstance from "../../../api/axiosInstance";

export default function UserDashboard() {
  const router = useRouter();
  const { userId, token } = useAuth();
  const [recentBooks, setRecentBooks] = useState([]);
  const [pendingBooks, setPendingBooks] = useState([]);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentView, setCurrentView] = useState("recent");

  const fetchRecentViewedBooks = async () => {
    if (!userId) return;
    try {
      const response = await axiosInstance.get(`/user/${userId}/recent-views/`);
      setRecentBooks(response.data);
    } catch (err) {
      console.error("Error fetching recent books:", err);
    }
  };

  const fetchPendingBooks = async () => {
    if (!userId) return;
    try {
      const response = await axiosInstance.get(
        `/user/${userId}/pending-books/`
      );
      setPendingBooks(response.data);
    } catch (err) {
      console.error("Error fetching pending books:", err);
    }
  };

  const fetchFavoriteBooks = async () => {
    if (!userId) return;
    try {
      const response = await axiosInstance.get(
        `/user/${userId}/favorite-books/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFavoriteBooks(response.data);
    } catch (err) {
      console.error("Error fetching favorite books:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecentViewedBooks();
      fetchPendingBooks();
      fetchFavoriteBooks();
    }, [userId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecentViewedBooks();
    await fetchPendingBooks();
    await fetchFavoriteBooks();
    setRefreshing(false);
  };

  const handleBookPress = (id) => {
    router.push(`../screens/about?id=${id}`);
  };

  const currentBooks =
    currentView === "favorite"
      ? favoriteBooks
      : currentView === "pending"
      ? pendingBooks
      : recentBooks;

  const titles = {
    recent: "Recently Viewed",
    pending: "My Pending",
    favorite: "My Favorite Books",
  };

  const toggleOptions = {
    recent: ["pending", "favorite"],
    pending: ["recent", "favorite"],
    favorite: ["recent", "pending"],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Toggle Buttons */}
        <View style={styles.toggleRow}>
          {toggleOptions[currentView].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.toggleButton,
                currentView === option && styles.toggleButtonActive,
              ]}
              onPress={() => setCurrentView(option)}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  currentView === option && styles.toggleButtonTextActive,
                ]}
              >
                {titles[option]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Title Below Buttons */}
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>{titles[currentView]}</Text>
        </View>

        {/* Books Grid */}
        <View style={styles.bookGrid}>
          {currentBooks.length === 0 ? (
            <View style={styles.emptyMessageContainer}>
              <Text style={styles.emptyMessageText}>
                {currentView === "favorite"
                  ? "You have no favorite books yet."
                  : currentView === "pending"
                  ? "You have no pending books."
                  : "No recently viewed books found."}
              </Text>
            </View>
          ) : (
            currentBooks.map((book) => (
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
            ))
          )}
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

  toggleRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 15,
  },
  toggleButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 10,
    width: 140,
    marginHorizontal: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    opacity: 0.8,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#357ABD",
    opacity: 1,
  },
  toggleButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  toggleButtonTextActive: {
    fontWeight: "700",
    fontSize: 15,
  },

  titleRow: {
    marginBottom: 15,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 22,
    color: "#222",
    fontWeight: "bold",
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
    elevation: 3,
    overflow: "hidden",
  },
  coverImage: {
    width: "100%",
    height: "70%",
  },
  bookTitle: {
    fontSize: 14,
    padding: 6,
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

  emptyMessageContainer: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyMessageText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
});
