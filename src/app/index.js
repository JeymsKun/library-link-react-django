import { useEffect, useState } from "react";
import { View, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Splash screen timeout ~3.5s
    const timeout = setTimeout(() => setShowSplash(false), 3500);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!showSplash) {
      // After splash is hidden, navigate depending on auth state
      if (isLoading) return; // Wait if still loading

      if (isAuthenticated) {
        if (userRole === "staff") {
          router.replace("/staff");
        } else {
          router.replace("/user");
        }
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [showSplash, isLoading, isAuthenticated, userRole, router]);

  if (showSplash) {
    return (
      <View style={styles.container}>
        <Image
          source={require("../assets/library-official-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: 250,
    height: 250,
  },
});
