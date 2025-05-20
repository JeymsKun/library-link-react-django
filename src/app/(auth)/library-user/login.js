import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../context/AuthContext";

const { width } = Dimensions.get("window");

export default function LibraryUserLogin() {
  const { isAuthenticated, loginUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(app)/user/");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUser({ email, password });

      if (!result.success) {
        Alert.alert(
          "Login Failed",
          result.error || "Please check your credentials and try again"
        );
        return;
      }

      router.push("/(app)/user/");
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const goBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <TouchableOpacity onPress={goBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#3b82f6" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.innerContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View
          style={[
            styles.logoContainer,
            { display: keyboardVisible ? "none" : "flex" },
          ]}
        >
          <Image
            source={require("../../../assets/library-text.png")}
            style={styles.logoText}
            resizeMode="contain"
          />
          <Image
            source={require("../../../assets/library-logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {keyboardVisible ? (
          <Image
            source={require("../../../assets/library-official-logo.png")}
            style={styles.logoOfficial}
            resizeMode="contain"
          />
        ) : null}

        <View style={[styles.formContainer, { flex: keyboardVisible ? 0 : 1 }]}>
          {!keyboardVisible && (
            <Text style={styles.loginAsText}>Login as library user</Text>
          )}
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail-outline" size={20} color="#777" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#999"
                numberOfLines={1}
                multiline={false}
                scrollEnabled={false}
                textAlignVertical="center"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#777" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#999"
                numberOfLines={1}
                multiline={false}
                scrollEnabled={false}
                textAlignVertical="center"
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={styles.passwordIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#777"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  backButton: {
    padding: 10,
    marginTop: 10,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoText: {
    width: width * 0.45,
    height: 60,
  },
  logoImage: {
    width: width * 0.4,
    height: width * 0.4,
  },
  logoOfficial: {
    width: width * 0.6,
    height: width * 0.4,
    marginBottom: 10,
  },
  formContainer: {
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  inputWrapper: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    width: "100%",
  },
  inputContainer: {
    position: "relative",
    marginBottom: 16,
  },
  iconContainer: {
    position: "absolute",
    left: 12,
    top: 14,
    zIndex: 1,
  },
  passwordIcon: {
    position: "absolute",
    right: 12,
    top: 14,
    zIndex: 1,
  },
  input: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingVertical: 12,
    paddingHorizontal: 50,
    fontSize: 16,
    color: "#333",
  },
  loginAsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    margin: 30,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
    width: "80%",
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
});
