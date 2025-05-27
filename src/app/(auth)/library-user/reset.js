import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "@env";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFocusedNew, setIsFocusedNew] = useState(false);
  const [isFocusedConfirm, setIsFocusedConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { email, otp } = useLocalSearchParams();

  useEffect(() => {
    if (confirmPassword === "") {
      setPasswordsMatch(true);
    } else {
      setPasswordsMatch(newPassword === confirmPassword);
    }
  }, [newPassword, confirmPassword]);

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    if (!email || !otp) {
      Alert.alert("Error", "Missing email or OTP, please start over.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/user/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Password reset successfully.");
        router.replace("/library-user/login");
      } else {
        Alert.alert("Error", data.error || "Failed to reset password.");
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#3b82f6" />
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={styles.heading}>Reset Password</Text>
            <Text style={styles.subtext}>
              Enter your new password below to reset your account password.
            </Text>

            <View
              style={[styles.formGroup, !passwordsMatch && styles.errorBorder]}
            >
              <TextInput
                style={styles.input}
                placeholder=" "
                placeholderTextColor="transparent"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                onFocus={() => setIsFocusedNew(true)}
                onBlur={() => setIsFocusedNew(false)}
                textContentType="newPassword"
                autoCapitalize="none"
              />
              <Text
                style={[
                  styles.floatingLabel,
                  (isFocusedNew || newPassword !== "") &&
                    styles.floatingLabelFocused,
                  !passwordsMatch && styles.errorLabel,
                ]}
              >
                New Password
              </Text>
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeIcon}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color="#777"
                />
              </TouchableOpacity>
            </View>

            <View
              style={[styles.formGroup, !passwordsMatch && styles.errorBorder]}
            >
              <TextInput
                style={styles.input}
                placeholder=" "
                placeholderTextColor="transparent"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                onFocus={() => setIsFocusedConfirm(true)}
                onBlur={() => setIsFocusedConfirm(false)}
                textContentType="password"
                autoCapitalize="none"
              />
              <Text
                style={[
                  styles.floatingLabel,
                  (isFocusedConfirm || confirmPassword !== "") &&
                    styles.floatingLabelFocused,
                  !passwordsMatch && styles.errorLabel,
                ]}
              >
                Confirm Password
              </Text>
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color="#777"
                />
              </TouchableOpacity>
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
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
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
    paddingRight: 40, // space for eye icon
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
  eyeIcon: {
    position: "absolute",
    right: 0,
    bottom: 0,
    top: 5,
    padding: 8,
    zIndex: 2,
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
  errorBorder: {
    borderBottomColor: "red",
  },
  errorLabel: {
    color: "red",
  },
});
