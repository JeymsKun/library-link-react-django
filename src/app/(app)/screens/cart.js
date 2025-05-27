import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconButton, Portal, Modal, Button } from "react-native-paper";
import { useRouter } from "expo-router";
import axios from "axios";
import { API_BASE_URL } from "@env";
import { useAuth } from "../../../context/AuthContext";

const { width, height } = Dimensions.get("window");

const BookCard = ({
  book,
  onRemove,
  onBorrow,
  onReserve,
  removingBookId,
  bookStatus,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    if (isRemoving || removingBookId === book.id) return;
    setIsRemoving(true);
    onRemove(book.id);
  };

  // Log the book data to see what image properties are available
  console.log("Book data in BookCard:", JSON.stringify(book, null, 2));

  // Try different image properties that might be available
  const imageUrl =
    book.images?.[0] ||
    book.cover_image ||
    book.cover_image_url ||
    book.image_urls?.[0];

  return (
    <View style={styles.bookCard}>
      <View style={styles.bookImageContainer}>
        {imageError || !imageUrl ? (
          <View style={[styles.bookImage, styles.placeholderContainer]}>
            <IconButton icon="book" size={40} color="#999" />
          </View>
        ) : (
          <Image
            source={{ uri: imageUrl }}
            style={styles.bookImage}
            onError={(e) => {
              console.error("Image load error:", e.nativeEvent);
              setImageError(true);
            }}
          />
        )}
      </View>

      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {book.author}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <Button
          mode="outlined"
          onPress={handleRemove}
          style={[
            styles.removeButton,
            (isRemoving || removingBookId === book.id) && styles.disabledButton,
          ]}
          textColor="#dc3545"
          disabled={isRemoving || removingBookId === book.id}
          loading={isRemoving || removingBookId === book.id}
        >
          Remove
        </Button>
        <Button
          mode="contained"
          onPress={() => onBorrow(book)}
          style={[styles.borrowButton, bookStatus && styles.disabledButton]}
          disabled={bookStatus === "borrowed"}
        >
          {bookStatus === "borrowed" ? "Already Borrowed" : "Borrow"}
        </Button>
        <Button
          mode="outlined"
          onPress={() => onReserve(book)}
          style={[styles.reserveButton, bookStatus && styles.disabledButton]}
          disabled={bookStatus === "reserved"}
        >
          {bookStatus === "reserved" ? "Already Reserved" : "Reserve"}
        </Button>
      </View>
    </View>
  );
};

const CartScreen = () => {
  const router = useRouter();
  const { userId, token } = useAuth();
  const [cartBooks, setCartBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [borrowModalVisible, setBorrowModalVisible] = useState(false);
  const [reserveModalVisible, setReserveModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [removingBookId, setRemovingBookId] = useState(null);
  const [bookStatuses, setBookStatuses] = useState({});

  const fetchCartItems = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/user/${userId}/booking-cart/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(
        "Cart items response:",
        JSON.stringify(response.data, null, 2)
      );
      setCartBooks(response.data);
    } catch (err) {
      console.error("Error fetching cart items:", err);
      Alert.alert("Error", "Failed to load cart items");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const checkBookStatuses = async () => {
    if (!userId || !token) return;
    try {
      // Use pending-books endpoint to get all book statuses
      const pendingResponse = await axios.get(
        `${API_BASE_URL}/user/${userId}/pending-books/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Create a map of book statuses
      const statusMap = pendingResponse.data.reduce((acc, item) => {
        if (item && item.book && item.book.id && item.status) {
          acc[item.book.id] = item.status.toLowerCase();
        }
        return acc;
      }, {});

      setBookStatuses(statusMap);
    } catch (err) {
      console.error("Error checking book statuses:", err);
      if (err.response) {
        console.error("Error response:", {
          status: err.response.status,
          data: err.response.data,
        });
      }
      setBookStatuses({});
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchCartItems(), checkBookStatuses()]);
  }, [userId, token]);

  useEffect(() => {
    if (userId && token) {
      Promise.all([fetchCartItems(), checkBookStatuses()]);
    }
  }, [userId, token]);

  const handleRemoveBook = async (bookId) => {
    if (!bookId || removingBookId === bookId) return;

    setRemovingBookId(bookId);

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/user/${userId}/booking-cart/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { book_id: bookId },
        }
      );

      // Refresh the cart after successful removal
      await fetchCartItems();
    } catch (err) {
      console.error("Error removing book:", err);
      // Throw the error instead of showing alert
      throw err;
    } finally {
      setRemovingBookId(null);
    }
  };

  const handleBorrow = (book) => {
    if (!book?.id) {
      console.error("Invalid book data for borrowing");
      return;
    }
    setSelectedBook(book);
    setBorrowModalVisible(true);
  };

  const handleReserve = (book) => {
    if (!book?.id) {
      console.error("Invalid book data for reservation");
      return;
    }
    setSelectedBook(book);
    setReserveModalVisible(true);
  };

  const confirmBorrow = async () => {
    if (!selectedBook?.id) {
      Alert.alert("Error", "Invalid book selection");
      return;
    }

    try {
      // First borrow the book
      const borrowResponse = await axios.post(
        `${API_BASE_URL}/user/${userId}/borrow/`,
        { book_id: selectedBook.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (borrowResponse.status === 201) {
        // Then remove from cart
        try {
          await axios.delete(`${API_BASE_URL}/user/${userId}/booking-cart/`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { book_id: selectedBook.id },
          });
        } catch (cartErr) {
          console.error("Error removing from cart after borrow:", cartErr);
          // Continue even if cart removal fails
        }

        // Update UI regardless of cart removal status
        handleRemoveBook(selectedBook.id);
        Alert.alert("Success", "Book borrowed successfully");
      }
    } catch (err) {
      console.error("Error borrowing book:", err.response?.data || err.message);
      const errorMessage =
        err.response?.data?.detail ||
        (err.response?.status === 400
          ? "Book is already borrowed"
          : "Failed to borrow book");
      Alert.alert("Error", errorMessage);
    } finally {
      setBorrowModalVisible(false);
      setSelectedBook(null);
    }
  };

  const confirmReserve = async () => {
    if (!selectedBook?.id) {
      Alert.alert("Error", "Invalid book selection");
      return;
    }

    try {
      // First reserve the book
      const reserveResponse = await axios.post(
        `${API_BASE_URL}/user/${userId}/reserve/`,
        { book_id: selectedBook.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (reserveResponse.status === 201) {
        // Then remove from cart
        try {
          await axios.delete(`${API_BASE_URL}/user/${userId}/booking-cart/`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { book_id: selectedBook.id },
          });
        } catch (cartErr) {
          console.error("Error removing from cart after reserve:", cartErr);
          // Continue even if cart removal fails
        }

        // Update UI regardless of cart removal status
        handleRemoveBook(selectedBook.id);
        Alert.alert("Success", "Book reserved successfully");
      }
    } catch (err) {
      console.error("Error reserving book:", err.response?.data || err.message);
      const errorMessage =
        err.response?.data?.detail ||
        (err.response?.status === 400
          ? "Book is already reserved"
          : "Failed to reserve book");
      Alert.alert("Error", errorMessage);
    } finally {
      setReserveModalVisible(false);
      setSelectedBook(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        style={styles.container}
        bounces={true}
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
        <View style={styles.content}>
          <View style={styles.cartSection}>
            <Text style={styles.sectionTitle}>Your Cart</Text>
            {cartBooks.length > 0 ? (
              cartBooks.map((item) => (
                <BookCard
                  key={item.book.id}
                  book={item.book}
                  onRemove={handleRemoveBook}
                  onBorrow={() => handleBorrow(item.book)}
                  onReserve={() => handleReserve(item.book)}
                  removingBookId={removingBookId}
                  bookStatus={bookStatuses[item.book.id]}
                />
              ))
            ) : (
              <View style={styles.emptyCart}>
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
                <Text style={styles.emptyCartSubtext}>
                  Browse the library and add books you'd like to borrow
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Borrow Modal */}
      <Portal>
        <Modal
          visible={borrowModalVisible}
          onDismiss={() => setBorrowModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Confirm Borrow</Text>
          <Text style={styles.modalText}>Book: {selectedBook?.title}</Text>
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setBorrowModalVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={confirmBorrow}
              style={styles.modalButton}
            >
              Confirm
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Reserve Modal */}
      <Portal>
        <Modal
          visible={reserveModalVisible}
          onDismiss={() => setReserveModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Confirm Reservation</Text>
          <Text style={styles.modalText}>Book: {selectedBook?.title}</Text>
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setReserveModalVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={confirmReserve}
              style={styles.modalButton}
            >
              Confirm
            </Button>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#A9DEFF",
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#A9DEFF",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  placeholderContainer: {
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  cartSection: {
    flex: 1,
  },
  bookCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookImageContainer: {
    width: 80,
    height: 120,
    marginRight: 12,
  },
  bookImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  bookInfo: {
    flex: 1,
    justifyContent: "center",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: "#666",
  },
  actionButtons: {
    justifyContent: "space-between",
    marginLeft: 12,
  },
  removeButton: {
    marginBottom: 8,
  },
  borrowButton: {
    marginBottom: 8,
  },
  reserveButton: {
    borderColor: "#666",
  },
  emptyCart: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
    color: "#666",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    minWidth: 100,
  },
  errorText: {
    color: "#dc3545",
    fontSize: 12,
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default CartScreen;
