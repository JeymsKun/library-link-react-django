import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Animated,
  Alert,
  RefreshControl,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import { API_BASE_URL } from "@env";
import { useAuth } from "../../../context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function AboutBook() {
  const { userId, token } = useAuth();
  const { id } = useLocalSearchParams();
  const [book, setBook] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isInCart, setIsInCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [bookStatus, setBookStatus] = useState(null);
  const [availableCopies, setAvailableCopies] = useState(0);
  const router = useRouter();

  const fetchBook = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/user/${userId}/books/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBook(response.data);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error("Error fetching book:", error);
      setBook(null);
    }
    setLoading(false);
  };

  const checkCartStatus = async () => {
    if (!id || !token || !userId) return;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/user/${userId}/booking-cart/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsInCart(response.data.some((item) => item.book.id === id));
    } catch (err) {
      console.error("Error checking cart status:", err);
    }
  };

  const checkBookStatus = async () => {
    if (!id || !token || !userId) {
      console.log("Missing required data:", { id, token, userId });
      return;
    }

    try {
      const pendingResponse = await axios.get(
        `${API_BASE_URL}/user/${userId}/pending-books/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Pending books response:", pendingResponse.data);

      if (!Array.isArray(pendingResponse.data)) {
        console.log("Invalid response format - expected array");
        setBookStatus(null);
        return;
      }

      const pendingBook = pendingResponse.data.find((item) => {
        if (!item || !item.book) return false;
        const bookId = parseInt(item.book.id);
        const currentId = parseInt(id);
        return !isNaN(bookId) && !isNaN(currentId) && bookId === currentId;
      });

      console.log("Found pending book:", pendingBook);

      if (pendingBook && pendingBook.status) {
        const status = pendingBook.status.toLowerCase();
        if (["borrowed", "reserved", "pending"].includes(status)) {
          setBookStatus(status);
        } else {
          console.log("Unknown status:", status);
          setBookStatus(null);
        }
      } else {
        console.log("No matching book found in pending books");
        setBookStatus(null);
      }
    } catch (err) {
      console.error("Error checking book status:", err);
      if (err.response) {
        console.error("Error response:", {
          status: err.response.status,
          data: err.response.data,
        });
      }
      setBookStatus(null);
    }
  };

  const checkAvailableCopies = async () => {
    if (!id || !token || !userId || !book) {
      console.log("Missing required data for checking copies:", {
        id,
        token,
        userId,
        book,
      });
      return;
    }

    try {
      const pendingResponse = await axios.get(
        `${API_BASE_URL}/user/${userId}/pending-books/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Pending books response:", pendingResponse.data);

      if (!Array.isArray(pendingResponse.data)) {
        console.log("Invalid response format - expected array");
        setAvailableCopies(book.copies || 0);
        return;
      }

      const usedCopies = pendingResponse.data.filter((item) => {
        if (!item || !item.book) return false;
        const bookId = parseInt(item.book.id);
        const currentId = parseInt(id);
        return (
          !isNaN(bookId) &&
          !isNaN(currentId) &&
          bookId === currentId &&
          ["borrowed", "reserved"].includes((item.status || "").toLowerCase())
        );
      }).length;

      console.log("Used copies:", usedCopies, "Total copies:", book.copies);

      const totalCopies = parseInt(book.copies) || 0;
      const available = Math.max(0, totalCopies - usedCopies);
      setAvailableCopies(available);
    } catch (err) {
      console.error("Error checking available copies:", err);
      if (err.response) {
        console.error("Error response:", {
          status: err.response.status,
          data: err.response.data,
        });
      }
      setAvailableCopies(parseInt(book.copies) || 0);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchBook(),
        checkCartStatus(),
        checkBookStatus(),
        checkAvailableCopies(),
      ]);
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  }, [id, token, userId, book?.copies]);

  useEffect(() => {
    if (!id || !token || !userId) return;

    const loadData = async () => {
      try {
        await fetchBook();

        await Promise.all([
          checkCartStatus(),
          checkBookStatus(),
          checkAvailableCopies(),
        ]);
      } catch (error) {
        console.error("Error loading book data:", error);
      }
    };

    loadData();
  }, [id, token, userId]);

  const handleAddToCart = async () => {
    if (!book || !userId || !token) return;
    if (bookStatus) {
      Alert.alert(
        "Cannot Add to Cart",
        `This book is already ${bookStatus}. You cannot add it to your cart.`
      );
      return;
    }
    if (availableCopies <= 0) {
      Alert.alert("Cannot Add to Cart", "This book is currently unavailable.");
      return;
    }
    setAddingToCart(true);
    try {
      await axios.post(
        `${API_BASE_URL}/user/${userId}/booking-cart/`,
        { book_id: book.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsInCart(true);
      setAvailableCopies((prev) => Math.max(0, prev - 1));
      Alert.alert("Success", "Book added to cart", [
        {
          text: "Go to Cart",
          onPress: () => router.push("/(app)/screens/cart"),
        },
        { text: "OK" },
      ]);
    } catch (err) {
      console.error("Error adding to cart:", err);
      if (err.response?.status === 400) {
        Alert.alert("Error", "Book is already in your cart");
      } else {
        Alert.alert("Error", "Failed to add book to cart");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const images = book ? book.images : [];
  const barcodeImageUrl = book ? book.barcode_image : null;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 10, color: "#3b82f6" }}>
          Loading book details...
        </Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "#e74c3c" }}>Book not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f4f8fb" }}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3b82f6"]}
            tintColor="#3b82f6"
            title="Pull to refresh..."
            titleColor="#3b82f6"
          />
        }
      >
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          {/* Carousel */}
          <View style={styles.carouselContainer}>
            <Carousel
              width={width * 0.7}
              height={width * 0.7 * 1.4}
              data={images}
              scrollAnimationDuration={500}
              onSnapToItem={(index) => setCurrentIndex(index)}
              renderItem={({ item }) => (
                <View style={styles.bookContainer}>
                  <Image
                    source={{ uri: item }}
                    style={styles.bookImage}
                    resizeMode="cover"
                  />
                </View>
              )}
            />
            <View style={styles.pagination}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentIndex === index && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Book Details */}
          <View style={styles.mainDetailsContainer}>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <View style={styles.divider} />

            <View style={styles.metaRow}>
              <MaterialIcons name="person" size={18} color="#3b82f6" />
              <Text style={styles.bookInfo}>{book.author}</Text>
            </View>
            <View style={styles.metaRow}>
              <MaterialIcons name="business" size={18} color="#3b82f6" />
              <Text style={styles.bookInfo}>{book.publisher}</Text>
            </View>
            <View style={styles.metaRow}>
              <MaterialIcons name="date-range" size={18} color="#3b82f6" />
              <Text style={styles.bookInfo}>
                {new Date(book.published_date).toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <MaterialIcons name="library-books" size={18} color="#3b82f6" />
              <Text style={styles.bookInfo}>
                {availableCopies > 0
                  ? `Available Copies: ${availableCopies}`
                  : "Total Copies: Unavailable"}
              </Text>
            </View>

            <Text style={styles.sectionHeader}>Description</Text>
            <Text style={styles.bookDescription}>{book.description}</Text>

            {barcodeImageUrl && (
              <View style={styles.barcodeContainer}>
                <Text style={styles.barcodeLabel}>Barcode:</Text>
                <View>
                  <Image
                    source={{ uri: barcodeImageUrl }}
                    style={styles.barcodeImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.bookingButton,
              (isInCart || bookStatus || availableCopies <= 0) &&
                styles.bookingButtonDisabled,
              addingToCart && styles.bookingButtonLoading,
            ]}
            onPress={handleAddToCart}
            disabled={
              isInCart || addingToCart || bookStatus || availableCopies <= 0
            }
          >
            {addingToCart ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.bookingButtonText}>
                {bookStatus === "borrowed"
                  ? "Already Borrowed"
                  : bookStatus === "reserved"
                  ? "Already Reserved"
                  : bookStatus === "pending"
                  ? "Pending Approval"
                  : availableCopies <= 0
                  ? "Unavailable"
                  : isInCart
                  ? "In Cart"
                  : "Add to Book Cart"}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 20,
    alignItems: "center",
    backgroundColor: "#A9DEFF",
  },
  card: {
    width: "95%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 24,
    alignItems: "center",
  },
  carouselContainer: {
    width: width * 0.7,
    aspectRatio: 2 / 3,
    alignSelf: "center",
    marginBottom: 24,
  },
  bookContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    elevation: 2,
  },
  bookImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d1d5db",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#3b82f6",
    width: 16,
  },
  mainDetailsContainer: {
    width: "100%",
    marginBottom: 18,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#22223b",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 12,
    width: "100%",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  bookInfo: {
    fontSize: 16,
    color: "#3b3b3b",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 6,
    color: "#3b82f6",
  },
  bookDescription: {
    fontSize: 15,
    color: "#444",
    marginTop: 2,
    lineHeight: 22,
  },
  barcodeContainer: {
    margin: 10,
    alignItems: "center",
  },
  barcodeLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#3b82f6",
  },
  barcodeImage: {
    width: 500,
    height: 120,
  },
  bookingButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 10,
    alignSelf: "center",
    shadowColor: "#3b82f6",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    minWidth: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  bookingButtonDisabled: {
    backgroundColor: "#93c5fd",
    shadowOpacity: 0.1,
  },
  bookingButtonLoading: {
    opacity: 0.8,
  },
  bookingButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f4f8fb",
  },
});
