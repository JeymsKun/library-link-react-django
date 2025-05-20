import React, { useState, useEffect } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Image, Text, StyleSheet } from "react-native";

export default function UserLayout() {
  const [time, setTime] = useState("");

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
          name="scan"
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: focused ? "#F8B919" : "#d1d5db",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 30,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 6,
                }}
              >
                <Ionicons name="scan" size={28} color="#fff" />
              </View>
            ),
            headerTitle: "Scan Book",
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
