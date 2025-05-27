import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { API_BASE_URL } from "@env";

const { width } = Dimensions.get("window");

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { email, mode } = useLocalSearchParams();

  const handleSubmit = async () => {
    if (otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP.");
      return;
    }

    if (!email) {
      Alert.alert("Error", "Email not found. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/user/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "OTP verified successfully.");

        if (mode === "reset") {
          router.push({
            pathname: "/library-user/reset",
            params: { email, otp },
          });
        } else if (mode === "signup") {
          router.replace("/login");
        }
      } else {
        Alert.alert("Error", data.error || "Invalid OTP.");
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.innerContainer}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#3b82f6" />
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={styles.heading}>Verify OTP</Text>
            <Text style={styles.subtext}>
              Enter the one-time password sent to your email.
            </Text>

            <View style={styles.formGroup}>
              <TextInput
                style={styles.input}
                placeholder=" "
                placeholderTextColor="transparent"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                textContentType="oneTimeCode"
              />
              <Text
                style={[
                  styles.floatingLabel,
                  (isFocused || otp !== "") && styles.floatingLabelFocused,
                ]}
              >
                OTP Code
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              style={[
                styles.submitButton,
                isSubmitting && styles.disabledButton,
              ]}
              disabled={isSubmitting}
            >
              <Text style={styles.submitText}>
                {isSubmitting ? "Verifying..." : "Verify OTP"}
              </Text>
            </TouchableOpacity>
          </View>
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
  keyboardView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 30,
    zIndex: 10,
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
    letterSpacing: 12,
    textAlign: "left",
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
