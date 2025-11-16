import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace("Login");
    }, 2000);
  }, [navigation]);

  return (
    <LinearGradient colors={['#e0f7fa', "#b2ebf2"]} style={styles.container}>
      <Text style={styles.logo}>CP</Text>
      <Text style={styles.title}>Campus Pulse</Text>
      <Text style={styles.subtitle}>Stay in the Pulse of Campus Life</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#6b48ff",
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  }
});

export default SplashScreen;