import React, { useState, useEffect } from "react";
import { Tabs } from "expo-router";
import { View, Image, StyleSheet, Platform, Keyboard } from "react-native";
import {
  Appbar,
  useTheme,
  Text,
  Surface,
  IconButton,
} from "react-native-paper";

export default function UserLayout() {
  const [time, setTime] = useState("");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`;
      setTime(formattedTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size, focused }) => {
            let iconName;
            if (route.name === "index") {
              iconName = "bookshelf";
            } else if (route.name === "history") {
              iconName = "history";
            } else if (route.name === "browse") {
              iconName = "library-shelves";
            } else if (route.name === "more") {
              iconName = "dots-horizontal-circle";
            }

            return <IconButton icon={iconName} size={20} iconColor={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopWidth: 0,
            elevation: 0,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            height: 60,
            paddingBottom: Platform.OS === "ios" ? 20 : 10,
            display: isKeyboardVisible ? "none" : "flex",
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            paddingBottom: Platform.OS === "ios" ? 0 : 10,
          },
          headerShown: route.name === "index" || route.name === "more",
          header: ({ route, options }) => {
            if (route.name !== "index" && route.name !== "more") return null;
            return (
              <Appbar.Header style={styles.appHeader} elevated>
                <Image
                  source={require("../../../assets/library-official-logo.png")}
                  style={styles.headerLogo}
                  resizeMode="contain"
                />
              </Appbar.Header>
            );
          },
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarLabel: ({ focused, color }) => (
              <Text variant="labelSmall" style={[styles.tabLabel, { color }]}>
                My Bookshelf
              </Text>
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            tabBarLabel: ({ focused, color }) => (
              <View style={{ alignItems: "center" }}>
                <Text variant="labelSmall" style={[styles.tabLabel, { color }]}>
                  History
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => (
              <Surface
                style={[styles.scanButton, focused && styles.scanButtonFocused]}
                elevation={6}
              >
                <IconButton icon="barcode-scan" size={28} iconColor="#fff" />
              </Surface>
            ),
          }}
        />
        <Tabs.Screen
          name="browse"
          options={{
            tabBarLabel: ({ focused, color }) => (
              <Text variant="labelSmall" style={[styles.tabLabel, { color }]}>
                Library
              </Text>
            ),
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            tabBarLabel: ({ focused, color }) => (
              <Text variant="labelSmall" style={[styles.tabLabel, { color }]}>
                More
              </Text>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#A9DEFF",
  },
  appHeader: {
    backgroundColor: "#ffffff",
    elevation: 0,
  },
  headerLogo: {
    width: 120,
    height: 120,
    marginLeft: 10,
  },
  headerTitleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 10,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  scanButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  scanButtonFocused: {
    backgroundColor: "#F8B919",
  },
});
