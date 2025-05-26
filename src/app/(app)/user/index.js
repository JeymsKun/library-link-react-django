import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  RefreshControl,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../../context/AuthContext";
import axiosInstance from "../../../api/axiosInstance";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import BookCard from "../../../components/BookCard";

const { width, height } = Dimensions.get('window');

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

  const allViews = ["recent", "pending", "favorite"];
  const titles = {
    recent: "Recently Viewed",
    pending: "My Pending",
    favorite: "My Favorite",
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.toggleContainer}>
        {allViews.map((view) => (
          <TouchableOpacity
            key={view}
            style={[
              styles.toggleButton,
              currentView === view && styles.toggleButtonActive,
            ]}
            onPress={() => setCurrentView(view)}
          >
            <Text
              style={[
                styles.toggleButtonText,
                currentView === view && styles.toggleButtonTextActive,
              ]}
              numberOfLines={1}
            >
              {titles[view]}
            </Text>
            {currentView === view && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.contentContainer}>
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
            <View style={styles.bookGrid}>
              {currentBooks.map((book) => (
                <BookCard
                  key={book.id || book.books_id}
                  book={book}
                  onPress={() => handleBookPress(book.id || book.books_id)}
                  style={styles.bookCard}
                />
              ))}
            </View>
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
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? height * 0.005 : height * 0.01,
    paddingBottom: height * 0.01,
    paddingHorizontal: width * 0.02,
    justifyContent: 'space-evenly',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: height * 0.012,
    marginHorizontal: width * 0.005,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    position: 'relative',
    minWidth: width * 0.25,
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  toggleButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: Math.min(width, height) * 0.028,
    textAlign: "center",
    paddingHorizontal: 4,
  },
  toggleButtonTextActive: {
    color: "#3b82f6",
    fontWeight: "700",
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -height * 0.01,
    left: width * 0.05,
    right: width * 0.05,
    height: 3,
    backgroundColor: '#3b82f6',
    borderRadius: 1.5,
  },
  scrollView: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.02,
    paddingBottom: Platform.OS === 'ios' ? height * 0.08 : height * 0.1,
  },
  bookGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: width * 0.04,
  },
  bookCard: {
    width: width * 0.44,
  },
  emptyMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: height * 0.1,
  },
  emptyMessageText: {
    fontSize: Math.min(width, height) * 0.04,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
});
