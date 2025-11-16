import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform } from "react-native";
import Button from "../components/Button";
import Input from "../components/Input";
import { auth } from "../firebase/firebaseConfig";
import Loader from "../components/Loader";
import { MaterialIcons } from "@expo/vector-icons";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
      setError("");
    } catch (err) {
      setError(err.message);
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f8fa" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View style={styles.container}>
          <View style={styles.logoWrapper}>
            <MaterialIcons name="lock-reset" size={48} color="#fff" />
          </View>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your registered email address to receive password reset instructions.
          </Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Input
            placeholder={"Enter email address"}
            icon={"email"}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button title={"Send Reset Link"} onPress={handleResetPassword} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate("Login")}>
            <MaterialIcons name="arrow-back" size={20} color="#4F8EF7" />
            <Text style={styles.back}>Return to Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f8fa",
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: "#f6f8fa",
  },
  logoWrapper: {
    backgroundColor: "#4F8EF7",
    alignSelf: "center",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 22,
    fontWeight: "500",
  },
  message: {
    color: '#388e3c',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: "600",
  },
  error: {
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: "600",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    gap: 6,
  },
  back: {
    color: '#4F8EF7',
    fontWeight: "700",
    fontSize: 16,
  },
});

export default ForgotPasswordScreen;