import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { BookingProvider } from "../context/BookingContext";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "../redux/store";
import { ViewToggleProvider } from "../context/ViewToggleContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider, MD3LightTheme } from "react-native-paper";


const queryClient = new QueryClient();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#1E90FF",
  },
};

export default function RootLayout() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={theme}>
          <SafeAreaProvider>
            <AuthProvider>
              <BookingProvider>
                <ViewToggleProvider>
                  <StatusBar style="light" />
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
          </SafeAreaProvider>
        </PaperProvider>
      </QueryClientProvider>
    </Provider>
  );
}


