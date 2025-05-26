import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RNPickerSelect from "react-native-picker-select";
import { IconButton } from "react-native-paper";
import axiosInstance from "../../../api/axiosInstance";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const BookCard = ({ book, onPress }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError || !book.cover_image) {
    return (
      <TouchableOpacity style={styles.bookCard} onPress={onPress}>
        <View style={[styles.bookImage, styles.placeholderContainer]}>
          <IconButton icon="book" size={40} color="#999" />
        </View>
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {book.title}
          </Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>
            {book.author}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.bookCard} onPress={onPress}>
      <Image
        source={{ uri: book.cover_image }}
        style={styles.bookImage}
        onError={() => setImageError(true)}
      />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {book.author}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const UserBrowse = () => {
  const { userId, token } = useAuth();
  const router = useRouter();
  const [genres, setGenres] = useState([]);
  const [booksByGenre, setBooksByGenre] = useState({});
  const [selectedGenre, setSelectedGenre] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchMessage, setSearchMessage] = useState("");
  const [smartResults, setSmartResults] = useState([]);
  const [expandedResultIndex, setExpandedResultIndex] = useState(null);
  const [searchMode, setSearchMode] = useState("traditional");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setSearchMessage("");

      const genresResponse = await axiosInstance.get("/genres/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGenres(genresResponse.data);

      const booksResponse = await axiosInstance.get("/genres/books/", {
        params: { user_id: userId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooksByGenre(booksResponse.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      const errorMessage =
        err.response?.status === 404
          ? "The genre service is currently unavailable. Please try again later."
          : "Failed to load books. Please check your connection and try again.";

      setError(errorMessage);
      Alert.alert("Error", errorMessage, [{ text: "OK" }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRetry = () => {
    fetchData();
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      setSearchMessage("");
      const response = await axiosInstance.get("/genres/books/", {
        params: {
          user_id: userId,
          search: searchTerm,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooksByGenre(response.data);

      const totalBooks = Object.values(response.data).reduce(
        (acc, arr) => acc + arr.length,
        0
      );
      if (totalBooks === 0) {
        setSearchMessage("No books found matching your search.");
      }
    } catch (err) {
      console.error("Error searching books:", err);
      Alert.alert("Error", "Failed to search books. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGenre) {
      const books = booksByGenre[selectedGenre] || [];
      if (books.length === 0) {
        setSearchMessage(`No books available in the "${selectedGenre}" genre.`);
      } else {
        setSearchMessage("");
      }
    } else {
      setSearchMessage("");
    }
  }, [selectedGenre, booksByGenre]);

  useEffect(() => {
    if (!searchTerm) {
      setSmartResults([]);
      setExpandedResultIndex(null);
      return;
    }

    const allBooks = Object.values(booksByGenre).flat();
    const results = [];
    allBooks.forEach((book) => {
      const fields = [
        { type: "Title", value: book.title },
        { type: "Author", value: book.author },
        { type: "ISBN", value: book.isbn },
        { type: "Barcode", value: book.barcode },
        { type: "Published Date", value: book.published_date },
        { type: "Publisher", value: book.publisher },
      ];
      fields.forEach((field) => {
        if (
          field.value &&
          String(field.value).toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          if (!results.some(r => r.type === field.type && r.value === field.value && r.book.id === book.id)) {
            results.push({ type: field.type, value: field.value, book });
          }
        }
      });
    });
    setSmartResults(results);
    setExpandedResultIndex(null);
  }, [searchTerm, booksByGenre]);

  function highlightText(text, searchTerm) {
    if (!searchTerm || !text) return text;
    const regex = new RegExp(`(${searchTerm})`, 'ig');
    const parts = String(text).split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <Text key={i} style={{ backgroundColor: '#ffe066', color: '#222' }}>{part}</Text>
      ) : (
        <Text key={i}>{part}</Text>
      )
    );
  }

  const handleBookPress = async (bookId) => {
    try {
      await axiosInstance.post(
        `/user/${userId}/recent-views/`,
        { book_id: bookId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to record recently viewed:", err);
    }
    router.push({ pathname: '/(app)/screens/about', params: { id: bookId } });
  };

  if (loading && Object.keys(booksByGenre).length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error && Object.keys(booksByGenre).length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filteredGenres = selectedGenre
    ? Object.keys(booksByGenre).filter((genre) => genre === selectedGenre)
    : Object.keys(booksByGenre);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Start Your Reading Journey</Text>
            <Text style={styles.headerSubtitle}>Find books by genre or search for specific titles, authors, or publishers.</Text>
          </View>

          <View style={styles.searchBarRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.searchInputContainer}>
                <IconButton icon="magnify" size={22} color="#666" style={styles.searchIcon} />
                <TextInput
                  placeholder="Search by title, author, ISBN, publisher..."
                  style={styles.input}
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                  placeholderTextColor="#999"
                />
                {searchTerm.length > 0 && (
                  <IconButton
                    icon="close"
                    size={20}
                    color="#666"
                    style={styles.clearIcon}
                    onPress={() => {
                      setSearchTerm("");
                      setSearchMessage("");
                      setSmartResults([]);
                      fetchData();
                    }}
                  />
                )}
              </View>
            </View>
            <View style={styles.searchModeToggle}>
              <IconButton
                icon="book-open-variant"
                size={22}
                color={searchMode === "traditional" ? "#3b82f6" : "#666"}
                style={[
                  styles.toggleButton,
                  searchMode === "traditional" && styles.toggleButtonActive,
                ]}
                onPress={() => setSearchMode("traditional")}
                accessibilityLabel="Traditional Search"
              />
              <IconButton
                icon="lightbulb-on-outline"
                size={22}
                color={searchMode === "smart" ? "#3b82f6" : "#666"}
                style={[
                  styles.toggleButton,
                  searchMode === "smart" && styles.toggleButtonActive,
                ]}
                onPress={() => setSearchMode("smart")}
                accessibilityLabel="Smart Search"
              />
            </View>
          </View>

          {searchMode === "smart" ? (
            <View style={styles.smartResultsContainer}>
              <Text style={styles.smartResultsTitle}>Smart Search Results</Text>
              <Text style={styles.smartResultsDescription}>
                Smart search finds matches in title, author, ISBN, barcode, published date, and publisher.
              </Text>
              {searchTerm.length > 0 && smartResults.length > 0 ? (
                smartResults.map((result, idx) => (
                  <View key={idx}>
                    <TouchableOpacity
                      style={styles.smartResultRow}
                      onPress={() => setExpandedResultIndex(idx === expandedResultIndex ? null : idx)}
                    >
                      <Text style={styles.smartResultType}>{result.type}:</Text>
                      <Text style={styles.smartResultValue}>{highlightText(result.value, searchTerm)}</Text>
                    </TouchableOpacity>
                    {expandedResultIndex === idx && (
                      <View style={styles.smartResultBookContainer}>
                        <BookCard book={result.book} onPress={() => handleBookPress(result.book.id)} searchTerm={searchTerm} fullWidth />
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.noResultsText}>
                  {searchTerm.length === 0
                    ? "Type to start a smart search."
                    : "No smart matches found."}
                </Text>
              )}
            </View>
          ) : (
            <>
              <View style={styles.searchContainer}>
                <View style={styles.pickerContainer}>
                  <RNPickerSelect
                    onValueChange={(value) => {
                      setSelectedGenre(value);
                    }}
                    placeholder={{ label: "All Genres", value: "" }}
                    items={Object.keys(booksByGenre).map((genre) => ({
                      label: genre,
                      value: genre,
                    }))}
                    style={pickerSelectStyles}
                    Icon={() => (
                      <IconButton icon="chevron-down" size={20} color="#666" style={styles.pickerIcon} />
                    )}
                  />
                </View>
              </View>

              {filteredGenres.map((genre) => {
                const books = booksByGenre[genre] || [];

                if (books.length === 0) {
                  return null;
                }

                return (
                  <View key={genre} style={styles.genreSection}>
                    <Text style={styles.genreTitle}>{genre}</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.booksRow}
                    >
                      {books.map((book) => (
                        <BookCard key={book.id} book={book} onPress={() => handleBookPress(book.id)} />
                      ))}
                    </ScrollView>
                    <View style={styles.divider} />
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>
      </View>
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
    backgroundColor: "#A9DEFF",
    padding: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#A9DEFF",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#555",
    fontWeight: "400",
  },

  searchBarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    gap: 8,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    margin: 0,
  },
  clearIcon: {
    margin: 0,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1a1a1a",
    height: 48,
  },
  searchModeToggle: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
  },
  toggleButton: {
    borderRadius: 8,

  },
  toggleButtonActive: {
    backgroundColor: "#e0e7ff",
  },
  toggleButtonText: {
    color: "#222",
    fontWeight: "600",
  },
  searchContainer: {
    paddingHorizontal: 5,
    gap: 12,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerIcon: {
    position: "absolute",
    right: 8,
    top: 12,
  },
  noResultsText: {
    marginTop: 8,
    fontSize: 14,
    color: "#cc0000",
    fontStyle: "italic",
    textAlign: "center",
  },
  genreSection: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  genreTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1a1a1a",
  },
  booksRow: {
    paddingRight: 16,
  },
  bookCard: {
    width: width * 0.4,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  bookImage: {
    width: "100%",
    aspectRatio: 0.8,
    backgroundColor: "#f5f5f5",
  },
  placeholderContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  bookInfo: {
    padding: 12,
  },
  bookTitle: {
    fontSize: Math.min(width, height) * 0.035,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: Math.min(width, height) * 0.03,
    color: "#666",
    fontStyle: "italic",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    height: 2,
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 8,
  },
  smartResultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  smartResultsTitle: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 6,
    color: '#3b82f6',
  },
  smartResultRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  smartResultType: {
    fontWeight: '600',
    color: '#555',
    marginRight: 6,
  },
  smartResultValue: {
    fontWeight: '400',
    color: '#222',
    flex: 1,
    flexWrap: 'wrap',
  },
  smartResultBookContainer: {
    marginVertical: 8,
  },
  smartResultsDescription: {
    fontSize: 13,
    color: "#555",
    marginBottom: 8,
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: "#1a1a1a",
    paddingRight: 40,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#1a1a1a",
    paddingRight: 40,
  },
  iconContainer: {
    display: "none",
  },
};

export default UserBrowse;
