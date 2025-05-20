import React, { useState } from "react";
import { Stack } from "expo-router";
import { TouchableOpacity, Image, View, Text } from "react-native";

export default function UserLayout() {
  const [liked, setLiked] = useState(false);

  return (
    <Stack
      screenOptions={{
        headerTintColor: "#000",
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="about"
        options={{
          headerTitle: "About This Book",
          headerRight: () => (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 20 }}
            >
              <TouchableOpacity onPress={() => setLiked((prev) => !prev)}>
                <Text style={{ fontSize: 24 }}>{liked ? "❤️" : "🤍"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  console.log("Cart icon pressed!");
                }}
              >
                <Image
                  source={require("../../../assets/cart.png")}
                  style={{ width: 25, height: 25 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
    </Stack>
  );
}
