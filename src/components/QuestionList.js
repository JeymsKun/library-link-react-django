import React from "react";
import { View, Text, StyleSheet, Dimensions, Linking } from "react-native";

const { width, height } = Dimensions.get("window");

export default function QuestionList({ questions }) {
  return (
    <View>
      {questions.map((item, index) => (
        <View key={index} style={styles.qaContainer}>
          <Text style={styles.question}>Q: {item.q}</Text>
          {item.q === "How do I contact support?" ? (
            <Text style={styles.answer}>
              Email{" "}
              <Text
                style={styles.link}
                onPress={() =>
                  Linking.openURL("mailto:maserinjames50@hotmail.com")
                }
              >
                maserinjames50@hotmail.com
              </Text>{" "}
              or visit our website{" "}
              <Text
                style={styles.link}
                onPress={() => Linking.openURL("http://3.25.117.239/")}
              >
                Library Link Official
              </Text>
              .
            </Text>
          ) : (
            <Text style={styles.answer}>A: {item.a}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  qaContainer: {
    marginBottom: height * 0.025,
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  answer: {
    fontSize: 15,
    color: "#555",
    marginLeft: 10,
  },
  link: {
    color: "#3b82f6",
    textDecorationLine: "underline",
  },
});
