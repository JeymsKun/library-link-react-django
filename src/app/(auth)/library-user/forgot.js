import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "@env";

const { width } = Dimensions.get("window");

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/user/forgot-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "An OTP has been sent to your email.");
        router.push({
          pathname: "/library-user/verify",
          params: { email, mode: "reset" },
        });
      } else {
        Alert.alert("Error", data.error || "Failed to send OTP.");
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <TouchableOpacity onPress={goBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#3b82f6" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.innerContainer}
      >
        <View style={styles.card}>
          <Image
            source={require("../../../assets/library-official-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.heading}>Forgot Your Password?</Text>
          <Text style={styles.subtext}>
            Enter your email below and we'll send you a one-time password to
            reset it.
          </Text>

          <View style={styles.formGroup}>
            <TextInput
              style={styles.input}
              placeholder=" "
              placeholderTextColor="transparent"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <Text
              style={[
                styles.floatingLabel,
                (isFocused || email !== "") && styles.floatingLabelFocused,
              ]}
            >
              Email Address
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            disabled={isSubmitting}
          >
            <Text style={styles.submitText}>
              {isSubmitting ? "Sending..." : "Send OTP"}
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
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 30,
    zIndex: 10,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logo: {
    width: 100,
    height: 60,
    alignSelf: "center",
    marginBottom: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    textAlign: "center",
    color: "#555",
    marginBottom: 24,
  },
  formGroup: {
    position: "relative",
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
  },
  input: {
    fontSize: 16,
    paddingVertical: 14,
    color: "#000",
  },
  floatingLabel: {
    position: "absolute",
    left: 0,
    top: 18,
    color: "#777",
    fontSize: 16,
    zIndex: 1,
  },
  floatingLabelFocused: {
    top: -10,
    fontSize: 12,
    color: "#3b82f6",
  },
  submitButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#a5c1f9",
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
