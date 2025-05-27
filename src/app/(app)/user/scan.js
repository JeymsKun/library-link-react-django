import React, { useRef, useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  RefreshControl,
  Modal,
  Alert,
} from "react-native";
import { CameraView } from "expo-camera";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import { API_BASE_URL } from "@env";
import axios from "axios";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

export default function BarcodeScan() {
  const router = useRouter();
  const { userId, token } = useAuth();
  const [showBookInfo, setShowBookInfo] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const scanLineAnimation = useRef(new Animated.Value(0)).current;
  const manualInputRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [barcode, setBarcode] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [bookStatus, setBookStatus] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      setScanning(true);
      return () => {
        setScanning(false);
      };
    }, [])
  );

  const fetchBookInfo = async (barcode) => {
    const response = await fetch(
      `${API_BASE_URL}/books/barcode/${barcode}/?user_id=${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) throw new Error("Book not found");
    return await response.json();
  };

  const {
    data: bookInfo,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["bookInfo", barcode],
    queryFn: () => fetchBookInfo(barcode),
    enabled: !!barcode,
    onSuccess: (data) =>
      setBookStatus(data.borrowed ? "borrowed" : "available"),
    onError: () => setErrorVisible(true),
  });

  useEffect(() => {
    if (isError) {
      setErrorVisible(true);
      const timer = setTimeout(() => setErrorVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isError]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = scanLineAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 0.4],
  });

  const handleBarcodeScanned = ({ data }) => {
    if (scanning && data) {
      setScanning(false);
      setManualBarcode("");
      setBarcode(data);
      setShowBookInfo(true);
      setModalVisible(true);
    }
  };
  const handleManualInput = () => {
    if (manualBarcode.trim()) {
      setBarcode(manualBarcode.trim());
      setShowBookInfo(true);
      setModalVisible(true);
      manualInputRef.current?.blur();
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setBarcode("");
    setManualBarcode("");
    setScanning(true);
    setShowBookInfo(false);
    await refetch();
    setRefreshing(false);
  };

  const handleBorrowOrReturn = async () => {
    if (!bookInfo?.id) return;

    const endpoint = `${API_BASE_URL}/user/${userId}/${
      bookStatus === "borrowed" ? "return" : "borrow"
    }/`;

    try {
      await axios.post(
        endpoint,
        { book_id: bookInfo.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookStatus(bookStatus === "borrowed" ? "available" : "borrowed");
      Alert.alert(
        "Success",
        `Book ${
          bookStatus === "borrowed" ? "returned" : "borrowed"
        } successfully.`
      );
    } catch (err) {
      console.error("Action failed:", err);
      Alert.alert(
        "Error",
        `Could not ${
          bookStatus === "borrowed" ? "return" : "borrow"
        } this book.`
      );
    }
  };

  const handleBook = () => {
    router.push({
      pathname: "../screens/about",
      params: { id: bookInfo?.id, showFullDetails },
    });
  };

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: "white" }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.instructionText}>
            Scan a barcode or enter it manually
          </Text>

          <View style={styles.camWrapper}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128"],
              }}
              onBarcodeScanned={
                scanning && isFocused && !modalVisible
                  ? handleBarcodeScanned
                  : undefined
              }
            />
            <Animated.View
              style={[styles.scanLine, { transform: [{ translateY }] }]}
            />
            <View style={styles.overlay}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          <View style={styles.manualInputRow}>
            <TextInput
              ref={manualInputRef}
              style={styles.input}
              value={manualBarcode}
              onChangeText={setManualBarcode}
              placeholder="Enter barcode manually"
              returnKeyType="done"
              onSubmitEditing={handleManualInput}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: manualBarcode ? "#0078D7" : "#3b82f6",
              },
            ]}
            onPress={manualBarcode ? handleManualInput : handleRefresh}
          >
            <Text style={styles.buttonText}>
              {manualBarcode ? "Search" : "Refresh"}
            </Text>
          </TouchableOpacity>

          {errorVisible && (
            <Text style={styles.errorText}>Book not found. Try again.</Text>
          )}

          {!scanning && !modalVisible && (
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: "#0078D7", marginTop: 10 },
              ]}
              onPress={() => {
                setBarcode("");
                setScanning(true);
                setShowBookInfo(false);
              }}
            >
              <Text style={styles.buttonText}>Scan Again</Text>
            </TouchableOpacity>
          )}

          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                  {!!bookInfo?.cover_image && (
                    <Image
                      source={{ uri: bookInfo.cover_image }}
                      style={styles.bookImage}
                    />
                  )}
                  <Text style={styles.bookTitle}>{bookInfo?.title}</Text>
                  <Text style={styles.bookAuthor}>By: {bookInfo?.author}</Text>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      { backgroundColor: "#0078D7", marginTop: 20 },
                    ]}
                    onPress={handleBook}
                  >
                    <Text style={styles.buttonText}>About this Book</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      { backgroundColor: "#888", marginTop: 10 },
                    ]}
                    onPress={() => {
                      setModalVisible(false);
                      setShowFullDetails(false);
                      setBarcode("");
                      setScanning(true);
                    }}
                  >
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#A9DEFF",
  },
  camWrapper: {
    width: "100%",
    height: height * 0.4,
    marginVertical: 20,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  instructionText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    width: width * 0.8,
    marginVertical: 10,
    backgroundColor: "#fff",
  },
  button: {
    marginVertical: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  scanLine: {
    position: "absolute",
    height: 2,
    width: "100%",
    backgroundColor: "red",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#fff",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderLeftWidth: 3,
    borderTopWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderRightWidth: 3,
    borderTopWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  bookInfoContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    elevation: 2,
  },
  bookImage: {
    width: 150,
    height: 220,
    borderRadius: 8,
    marginBottom: 12,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  bookAuthor: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  bookDetails: {
    fontSize: 14,
    color: "#444",
  },
  bookDescription: {
    fontSize: 14,
    color: "#444",
    marginTop: 10,
    textAlign: "center",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    maxHeight: "80%",
    padding: 20,
    alignItems: "center",
  },
  modalText: {
    fontSize: 14,
    color: "#444",
    marginTop: 10,
    textAlign: "center",
  },
});
