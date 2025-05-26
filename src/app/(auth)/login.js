import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

export default function LoginOptionsPage() {
  const router = useRouter();

  const navigateToUserLogin = () => {
    router.push("/library-user/login");
  };

  const navigateToSignup = () => {
    router.push("/signup");
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.contentContainer}>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: width * 0.06, 
    paddingVertical: height * 0.02, 
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: height * 0.04,
  },
  logoText: {
    width: width * 0.4, 
    height: height * 0.06, 
    marginBottom: height * 0.02, 
  },
  logoImage: {
    width: width * 0.35, 
    height: width * 0.35, 
  },
  optionsContainer: {
    width: "100%",
    marginVertical: height * 0.03, 
  },
  optionButtonUser: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2DADFD",
    paddingVertical: height * 0.02, 
    paddingHorizontal: width * 0.05, 
    borderRadius: 12,
    marginBottom: height * 0.02, 
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
    fontSize: Math.min(width, height) * 0.045, 
    fontWeight: "600",
    color: "#fff",
    marginLeft: width * 0.04, 
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: height * 0.03,
  },
  signupText: {
    fontSize: Math.min(width, height) * 0.04, 
    color: "#666",
  },
  signupLinkText: {
    fontSize: Math.min(width, height) * 0.04, 
    fontWeight: "600",
    color: "#3b82f6",
    marginLeft: width * 0.01, 
  },
  loginAsText: {
    fontSize: Math.min(width, height) * 0.05, 
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: height * 0.025, 
    color: "#333",
  },
});
