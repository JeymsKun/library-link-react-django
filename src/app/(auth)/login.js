import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function LoginOptionsPage() {
  const router = useRouter();

  const navigateToUserLogin = () => {
    router.push("/library-user/login");
  };

  const navigateToSignup = () => {
    router.push("/signup");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/library-text.png")}
          style={styles.logoText}
          resizeMode="contain"
        />
        <Image
          source={require("../../assets/library-logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.optionsContainer}>
        <Text style={styles.loginAsText}>LOGIN</Text>

        <TouchableOpacity
          style={styles.optionButtonUser}
          onPress={navigateToUserLogin}
        >
          <Ionicons name="person-circle" size={26} color="#fff" />
          <Text style={styles.optionButtonText}>Library User</Text>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>No account?</Text>
        <TouchableOpacity onPress={navigateToSignup}>
          <Text style={styles.signupLinkText}>Sign up here</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "white",
  },
  logoContainer: {
    alignItems: "center",
    marginVertical: 40,
  },
  logoText: {
    width: 170,
    height: 60,
    marginBottom: 10,
  },
  logoImage: {
    width: 150,
    height: 150,
  },
  optionsContainer: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  optionButtonUser: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2DADFD",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2DADFD",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionButtonText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 16,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  signupText: {
    fontSize: 16,
    color: "#666",
  },
  signupLinkText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3b82f6",
    marginLeft: 5,
  },
  loginAsText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
});
