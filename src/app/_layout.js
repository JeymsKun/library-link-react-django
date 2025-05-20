import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { BookingProvider } from "../context/BookingContext";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "../redux/store";
import { ViewToggleProvider } from "../context/ViewToggleContext";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BookingProvider>
            <ViewToggleProvider>
              <StatusBar style="auto" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "#f5f5f5" },
                  animation: "slide_from_right",
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen
                  name="(auth)"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="(app)"
                  options={{
                    headerShown: false,
                    gestureEnabled: false,
                  }}
                />
              </Stack>
            </ViewToggleProvider>
          </BookingProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
}
