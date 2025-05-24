import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { IconButton } from "react-native-paper";
import { useAuth } from "../../../context/AuthContext";
import { API_BASE_URL } from "@env";

const UserBrowse = () => {
  const { user, token } = useAuth();
  const userId = user?.user_id;
  const [genres, setGenres] = useState([]);
  const [booksByGenre, setBooksByGenre] = useState({});
  const [selectedGenre, setSelectedGenre] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [favoriteBooks, setFavoriteBooks] = useState([]);

  const fetchGenresAndBooks = useCallback(async () => {
    if (!userId || !token) return;
    setLoading(true);
    try {
      // Get genres
      const genresRes = await fetch(`${API_BASE_URL}/api/genres/`);
      const genresData = await genresRes.json();
      setGenres(genresData);

      // Get books by genre with search and favorites
      const booksRes = await fetch(
        `${API_BASE_URL}/books-by-genre/?user_id=${userId}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const booksData = await booksRes.json();
      setBooksByGenre(booksData);
    } catch (err) {
      console.error("Error loading books:", err);
    }
    setLoading(false);
  }, [userId, token, searchTerm]);

  const handleBookClick = async (bookId) => {
    if (!userId || !bookId || !token) return;
    try {
      await fetch(`${API_BASE_URL}/user/${userId}/books/${bookId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Error updating recently viewed book:", err);
    }
  };

  useEffect(() => {
    fetchGenresAndBooks();
  }, [fetchGenresAndBooks]);

  const filteredGenres = selectedGenre
    ? genres.filter((g) => g.name === selectedGenre)
    : genres;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search a book"
          style={styles.input}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <IconButton icon="magnify" size={24} onPress={fetchGenresAndBooks} />
      </View>

      <RNPickerSelect
        onValueChange={setSelectedGenre}
        placeholder={{ label: "All Genres", value: "" }}
        items={genres.map((g) => ({ label: g.name, value: g.name }))}
        style={pickerSelectStyles}
      />

      {filteredGenres.map((genre) => {
        const books = booksByGenre[genre.name] || [];

        return (
          <View key={genre.id || genre.genre_id} style={styles.genreSection}>
            <Text style={styles.genreTitle}>{genre.name}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {loading ? (
                <ActivityIndicator size="large" />
              ) : (
                books.map((book) => (
                  <TouchableOpacity
                    key={book.id}
                    style={styles.bookCard}
                    onPress={() => handleBookClick(book.id)}
                  >
                    <Image
                      source={{ uri: book.cover_image }}
                      style={styles.bookImage}
                    />
                    <Text style={styles.bookTitle} numberOfLines={1}>
                      {book.title}
                    </Text>
                    <Text style={styles.bookAuthor} numberOfLines={1}>
                      {book.author}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#e6f4fb",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8,
  },
  genreSection: {
    marginBottom: 24,
  },
  genreTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  bookCard: {
    width: 120,
    marginRight: 12,
    backgroundColor: "#cce6f9",
    borderRadius: 8,
    padding: 6,
    alignItems: "center",
  },
  bookImage: {
    width: "100%",
    height: 160,
    borderRadius: 6,
    backgroundColor: "#ccc",
  },
  bookTitle: {
    fontWeight: "bold",
    marginTop: 4,
    fontSize: 12,
  },
  bookAuthor: {
    color: "#555",
    fontSize: 11,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    color: "black",
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  inputAndroid: {
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    color: "black",
    marginBottom: 20,
    backgroundColor: "#fff",
  },
};

export default UserBrowse;
