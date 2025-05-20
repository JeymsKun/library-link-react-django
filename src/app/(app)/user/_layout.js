import React, { useState, useEffect } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";
import { useViewToggle } from "../../../context/ViewToggleContext";

export default function UserLayout() {
  const { showPending, toggleView } = useViewToggle();
  const [time, setTime] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(300))[0];
  const [pressed, setPressed] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [scale, setScale] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 1.1,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

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

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = (item) => {
    setPressed(item);
    if (item === "favorite") {
      setShowFavorites(!showFavorites);
      setShowRecent(false);
    } else if (item === "recent") {
      setShowRecent(!showRecent);
      setShowFavorites(false);
    } else if (item === "view") {
      toggleView();
    }
  };

  return (
    <>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === "index") {
              iconName = "library";
            } else if (route.name === "booking") {
              iconName = "calendar";
            } else if (route.name === "browse") {
              iconName = "search";
            } else if (route.name === "more") {
              iconName = "ellipsis-horizontal-circle";
            }

            return <Ionicons name={iconName} size={20} color={color} />;
          },
          tabBarActiveTintColor: "#3b82f6",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#ffffff",
            borderTopWidth: 0,
            elevation: 0,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
          headerStyle: {
            backgroundColor: "#ffffff",
          },
          headerTintColor: "#000",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarLabel: () => (
              <Text style={{ fontSize: 11, fontWeight: "600" }}>
                My Bookshelf
              </Text>
            ),
            headerTitle: () => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../../assets/library-official-logo.png")}
                  style={{ width: 120, height: 30, marginRight: 10 }}
                  resizeMode="contain"
                />
              </View>
            ),
            headerRight: () => (
              <TouchableOpacity onPress={toggleMenu}>
                <Ionicons
                  name="menu"
                  size={30}
                  color="#000"
                  style={{ marginRight: 10 }}
                />
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="booking"
          options={{
            tabBarLabel: () => (
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 10, fontWeight: "600" }}>Booking</Text>
                <Text style={{ fontSize: 10, fontWeight: "600" }}>Summary</Text>
              </View>
            ),
            headerTitle: () => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../../assets/library-logo.png")}
                  style={{ width: 30, height: 30, marginRight: 10 }}
                  resizeMode="contain"
                />
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  Booking
                </Text>
              </View>
            ),
            headerRight: () => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 14, marginRight: 10 }}>{time}</Text>
                <Image
                  source={require("../../../assets/calendar-icon.png")}
                  style={{ width: 28, height: 28, marginRight: 10 }}
                  resizeMode="contain"
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="browse"
          options={{
            tabBarLabel: "Library",
            headerTitle: () => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../../assets/library-logo.png")}
                  style={{ width: 30, height: 30, marginRight: 10 }}
                  resizeMode="contain"
                />
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>Browse</Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            tabBarLabel: "More",
            headerTitle: () => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../../../assets/library-logo.png")}
                  style={{ width: 30, height: 30, marginRight: 10 }}
                  resizeMode="contain"
                />
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>More</Text>
              </View>
            ),
          }}
        />
      </Tabs>

      {menuVisible && (
        <Animated.View
          style={[
            styles.bottomSheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Pressable
            style={[
              styles.menuItem,
              pressed === "view" && styles.pressedMenuItem,
            ]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => handlePress("view")}
          >
            <Ionicons
              name={showPending ? "hourglass" : "eye"}
              size={20}
              color="#3b82f6"
            />
            <Text style={styles.menuText}>
              {showPending ? "My Recently Viewed" : "My Pending"}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.menuItem,
              pressed === "favorite" && styles.pressedMenuItem,
            ]}
            onPress={() => handlePress("favorite")}
          >
            <Ionicons name="heart" size={20} color="#3b82f6" />
            <Text style={styles.menuText}>My Favorite</Text>
          </Pressable>

          <Pressable style={styles.menuItem} onPress={toggleMenu}>
            <Ionicons name="close" size={20} color="#f87171" />
            <Text style={[styles.menuText, { color: "#f87171" }]}>Close</Text>
          </Pressable>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  pressedMenuItem: {
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
    color: "#333",
  },
});
