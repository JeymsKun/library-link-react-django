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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export default function LibraryUserSignup() {
  const router = useRouter();
  const { signup } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    setPasswordMismatch(
      password.length > 0 &&
        confirmPassword.length > 0 &&
        password !== confirmPassword
    );
  }, [password, confirmPassword]);

  const handleRegister = async () => {
    if (!email || !password || !idNumber || !confirmPassword) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      Alert.alert("Error", "Passwords do not match.");
      return;
    } else {
      setPasswordMismatch(false);
    }

    setIsLoading(true);

    try {
      const result = await signup({
        email,
        password,
        idNumber,
        fullName,
      });

      if (result.success) {
        Alert.alert("Success", "OTP sent! Please verify your email.");
        router.push({
          pathname: "/library-user/verify",
          params: { email, mode: "signup" },
        });
      } else if (!result.success) {
        Alert.alert("Signup Failed", result.error || "Please try again.");
      } else {
        Alert.alert("Success", "Account created!");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong during signup.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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

        {keyboardVisible ? (
          <View style={styles.logoOfficialContainer}>
            <Image
              source={require("../../assets/library-official-logo.png")}
              style={styles.logoOfficial}
              resizeMode="contain"
            />
          </View>
        ) : null}

        <View style={[styles.formContainer, { flex: keyboardVisible ? 0 : 1 }]}>
          <View style={styles.inputWrapper}>
            {/* Full Name */}
            <View style={styles.inputContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-circle-outline" size={20} color="#777" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor="#999"
                numberOfLines={1}
                multiline={false}
                scrollEnabled={false}
                textAlignVertical="center"
              />
            </View>
            {/* ID Number */}
            <View style={styles.inputContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="card-outline" size={20} color="#777" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="ID Number (School/University)"
                value={idNumber}
                onChangeText={setIdNumber}
                placeholderTextColor="#999"
                keyboardType="numeric"
                numberOfLines={1}
                multiline={false}
                scrollEnabled={false}
                textAlignVertical="center"
              />
            </View>
            {/* Email Address */}
            <View style={styles.inputContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail-outline" size={20} color="#777" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
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

            {/* Password */}
            <View style={styles.inputContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#777" />
              </View>
              <TextInput
                style={[styles.input, passwordMismatch && styles.inputError]}
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

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#777" />
              </View>
              <TextInput
                style={[styles.input, passwordMismatch && styles.inputError]}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#999"
                numberOfLines={1}
                multiline={false}
                scrollEnabled={false}
                textAlignVertical="center"
              />
              <TouchableOpacity
                onPress={toggleConfirmPasswordVisibility}
                style={styles.passwordIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#777"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "Registering..." : "Register"}
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
    justifyContent: "flex-start",
    backgroundColor: "white",
    padding: 24,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 20 : 10,
    left: 16,
    zIndex: 1,
    padding: 8,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    paddingTop: 20,
  },
  logoText: {
    width: 170,
    height: 60,
    marginBottom: 10,
  },
  logoImage: {
    width: 130,
    height: 130,
  },
  logoOfficial: {
    width: 200,
    height: 100,
  },
  formContainer: {
    width: "100%",
    justifyContent: "center",
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
    marginBottom: 14,
  },
  logoOfficialContainer: {
    marginVertical: -15,
    alignItems: "center",
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
  loginButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 25,
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
  inputError: {
    borderBottomWidth: 1,
    borderBottomColor: "red",
  },
});
