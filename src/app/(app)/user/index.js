import React, { useState, useCallback, useRef } from "react";
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
import BookCard from "../../../components/BookCard";

const { width, height } = Dimensions.get("window");

export default function UserDashboard() {
  const router = useRouter();
  const { userId, token } = useAuth();
  const [recentBooks, setRecentBooks] = useState([]);
  const [pendingBooks, setPendingBooks] = useState([]);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentView, setCurrentView] = useState("recent");

  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef(null);

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

  const handleTogglePress = (pageIndex) => {
    setCurrentPage(pageIndex);
    scrollRef.current?.scrollTo({ x: width * pageIndex, animated: true });
  };

  const onScrollEnd = (event) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentPage(page);
  };

  const renderBooksList = (books, emptyMessage) => {
    if (books.length === 0) {
      return (
        <View style={styles.emptyMessageContainer}>
          <Text style={styles.emptyMessageText}>{emptyMessage}</Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.booksList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.bookGrid}>
          {books.map((book) => (
            <BookCard
              key={book.id || book.books_id}
              book={book}
              onPress={() => handleBookPress(book.id || book.books_id)}
              style={styles.bookCard}
            />
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        {allViews.map((view, i) => (
          <TouchableOpacity
            key={view}
            style={[
              styles.toggleButton,
              currentPage === i && styles.toggleButtonActive,
            ]}
            onPress={() => handleTogglePress(i)}
          >
            <Text
              style={[
                styles.toggleButtonText,
                currentPage === i && styles.toggleButtonTextActive,
              ]}
              numberOfLines={1}
            >
              {titles[view]}
            </Text>
            {currentPage === i && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        style={{ flex: 1 }}
      >
        <View style={styles.page}>
          {renderBooksList(recentBooks, "No recently viewed books found.")}
        </View>

        <View style={styles.page}>
          {renderBooksList(pendingBooks, "You have no pending books.")}
        </View>

        <View style={styles.page}>
          {renderBooksList(favoriteBooks, "You have no favorite books yet.")}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#A9DEFF",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingBottom: height * 0.01,
    paddingHorizontal: width * 0.02,
    justifyContent: "space-evenly",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: height * 0.012,
    marginHorizontal: width * 0.005,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    minWidth: width * 0.25,
  },
  toggleButtonActive: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
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
    position: "absolute",
    bottom: -height * 0.01,
    left: width * 0.05,
    right: width * 0.05,
    height: 3,
    backgroundColor: "#3b82f6",
    borderRadius: 1.5,
  },
  page: {
    width,
    flex: 1,
  },
  booksList: {
    flex: 1,
  },
  bookGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.02,
    paddingBottom: Platform.OS === "ios" ? height * 0.08 : height * 0.1,
  },
  bookCard: {
    width: width * 0.44,
    marginBottom: height * 0.015,
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
