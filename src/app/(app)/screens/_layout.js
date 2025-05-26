import React, { useState, useEffect } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { TouchableOpacity, View, Text } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import axiosInstance from "../../../api/axiosInstance";
import { useAuth } from "../../../context/AuthContext";

function FavoriteHeaderIcon() {
  const { id } = useLocalSearchParams();
  const { userId, token } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFavorite = async () => {
      try {
        const favRes = await axiosInstance.get(`/user/${userId}/favorite-books/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (favRes.data && Array.isArray(favRes.data)) {
          setIsFavorite(favRes.data.some(favBook => favBook.id === id));
        }
      } catch {
        setIsFavorite(false);
      }
    };
    if (id && userId && token) fetchFavorite();
  }, [id, userId, token]);

  const handleFavorite = async () => {
    if (!userId || !id) return;
    setLoading(true);
    try {
      if (!isFavorite) {
        // Add to favorites
        await axiosInstance.post(`/user/${userId}/favorite-books/`, { book_id: id }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFavorite(true);
      } else {
        // Remove from favorites
        await axiosInstance.delete(`/user/${userId}/favorite-books/`, {
          data: { book_id: id },
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFavorite(false);
      }
    } catch { }
    setLoading(false);
  };

  return (
    <TouchableOpacity onPress={handleFavorite} disabled={loading}>
      <Text style={{ fontSize: 24 }}>
        {isFavorite ? "❤️" : "🤍"}
      </Text>
    </TouchableOpacity>
  );
}

export default function UserLayout() {
  const [liked, setLiked] = useState(false);
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerTintColor: "#1E90FF",
        headerTitleStyle: { color: "#1E90FF" },
        headerBackTitleVisible: false,
        headerBackVisible: true,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="about"
        options={{
          headerTitle: "About This Book",
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 20,
                marginRight: 10,
              }}
            >
              <FavoriteHeaderIcon />
              <TouchableOpacity
                onPress={() => router.push('/(app)/screens/cart')}
                style={{ marginRight: 10 }}
              >
                <MaterialCommunityIcons
                  name="cart-outline"
                  size={24}
                  color="#1E90FF"
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="cart"
        options={{
          headerTitle: "Booking Cart",
          headerRight: () => null,
        }}
      />
    </Stack>
  );
}
