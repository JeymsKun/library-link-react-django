import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import axios from "axios";
import { API_BASE_URL } from "@env";
import { useAuth } from "../../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function BorrowingHistoryScreen() {
  const { userId, token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/user/${userId}/history/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const groupedByMonth = history.reduce((acc, item) => {
    const date = new Date(item.activity_date);
    const monthKey = date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    acc[monthKey] = acc[monthKey] || [];
    acc[monthKey].push(item);
    return acc;
  }, {});

  return (
    <SafeAreaView
      style={{ flexGrow: 1, backgroundColor: "white" }}
      edges={["top"]}
    >
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchHistory} />
        }
      >
        {/* New Header Section */}
        <View style={styles.topHeader}>
          <Text style={styles.title}>Borrowing History</Text>
          <Text style={styles.subtitle}>
            A timeline of your past and current book borrowings
          </Text>
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.sortText}>↓ Sorted by newest</Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0078D7"
            style={{ marginTop: 50 }}
          />
        ) : history.length === 0 ? (
          <Text style={styles.emptyText}>You have no borrowing history.</Text>
        ) : (
          Object.entries(groupedByMonth).map(([month, items]) => (
            <View key={month} style={styles.monthSection}>
              <View style={styles.monthHeaderRow}>
                <Text style={styles.monthHeader}>{month}</Text>
                <Text style={styles.sortSubtext}>↑ Newest first</Text>
              </View>

              {items.map((item, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.dot} />
                  <View style={styles.itemContent}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.meta}>
                      <Text style={styles.label}>Author:</Text>{" "}
                      {item.author || "N/A"}
                    </Text>
                    <Text style={styles.meta}>
                      <Text style={styles.label}>{item.tag}:</Text>{" "}
                      {new Date(item.activity_date).toDateString()}
                    </Text>
                    <Text
                      style={[
                        styles.badge,
                        item.tag === "Reserved"
                          ? styles.badgeWarning
                          : styles.badgeSecondary,
                      ]}
                    >
                      {item.tag}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#A9DEFF",
    flex: 1,
  },
  headerRow: {
    borderBottomWidth: 1,
    borderColor: "white",
    paddingBottom: 12,
    marginBottom: 12,
  },
  headerDescription: {
    color: "#555",
    fontSize: 16,
  },
  sortText: {
    fontSize: 12,
    color: "#6C757D",
    textAlign: "right",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 40,
    fontSize: 16,
  },
  monthSection: {
    marginTop: 16,
  },
  monthHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderLeftWidth: 4,
    borderColor: "#0078D7",
    paddingLeft: 12,
  },
  monthHeader: {
    fontSize: 18,
    fontWeight: "600",
  },
  sortSubtext: {
    fontSize: 12,
    color: "#6C757D",
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 16,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderColor: "white",
    position: "relative",
  },
  dot: {
    width: 10,
    height: 10,
    backgroundColor: "#0078D7",
    borderRadius: 5,
    position: "absolute",
    left: -6,
    top: 6,
  },
  itemContent: {
    marginLeft: 12,
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
  },
  meta: {
    color: "#444",
    fontSize: 14,
    marginBottom: 2,
  },
  label: {
    fontWeight: "500",
    color: "#333",
  },
  badge: {
    alignSelf: "flex-start",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  badgeWarning: {
    backgroundColor: "#FFC107",
    color: "#333",
  },
  badgeSecondary: {
    backgroundColor: "#6C757D",
    color: "white",
  },
  topHeader: {
    padding: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1e293b",
  },
  subtitle: {
    fontSize: 14,
    color: "#334155",
    marginTop: 8,
  },
  titleItem: {
    fontWeight: "600",
    fontSize: 16,
  },
});
