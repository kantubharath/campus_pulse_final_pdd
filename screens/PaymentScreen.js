import { useState } from "react";
import { Image, StyleSheet, Text, View, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform } from "react-native";
import Button from "../components/Button";
import Header from "../components/Header";
import Input from "../components/Input";
import Loader from "../components/Loader";
import { auth } from "../firebase/firebaseConfig";
import axiosInstance from "../utils/axiosInstance";
import { MaterialIcons } from "@expo/vector-icons";

const PaymentScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [utrNumber, setUtrNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmitPayment = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("Please login to make payment");
      }

      if (!utrNumber.trim()) {
        throw new Error("UTR number is required");
      }

      const paymentData = {
        userId: currentUser.uid,
        eventId: event.id,
        utrNumber,
        amount: event.fee,
        status: "Pending",
      };

      await axiosInstance.post("/payments/record", paymentData);
      navigation.goBack();
      alert("Payment recorded successfully!");
    } catch (err) {
      setError(err.message);
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
          <Header title={"Payment"} navigation={navigation} />
          <View style={styles.content}>
            <View style={styles.imageWrapper}>
              {event.paymentScannerImage ? (
                <Image source={{ uri: event.paymentScannerImage }} style={styles.scannerImage} />
              ) : (
                <View style={styles.noImageBox}>
                  <MaterialIcons name="qr-code" size={60} color="#bbb" />
                  <Text style={styles.noImage}>No payment scanner image available</Text>
                </View>
              )}
            </View>
            <Text style={styles.fee}>
              Amount to Pay: <Text style={styles.feeAmount}>₹{event.fee}</Text>
            </Text>
            <Input
              label={"UTR Number"}
              placeholder="Enter UTR Number"
              icon="confirmation-number"
              value={utrNumber}
              onChangeText={setUtrNumber}
              style={styles.input}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title={"Submit Payment"} onPress={handleSubmitPayment} />
            <View style={styles.infoBox}>
              <MaterialIcons name="info" size={18} color="#4F8EF7" />
              <Text style={styles.infoText}>
                Please complete your payment using the QR code above and enter your UTR number to confirm.
              </Text>
            </View>
          </View>
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
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  imageWrapper: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: "#f1f3f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  scannerImage: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  noImageBox: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  noImage: {
    fontSize: 15,
    color: "#888",
    marginTop: 10,
    textAlign: "center",
    fontWeight: "500",
  },
  fee: {
    fontSize: 18,
    color: "#333",
    marginBottom: 28,
    fontWeight: "600",
    textAlign: "center",
  },
  feeAmount: {
    color: "#4F8EF7",
    fontWeight: "bold",
    fontSize: 22,
  },
  input: {
    marginBottom: 20,
  },
  error: {
    color: "#F44336",
    marginBottom: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f1f3f6",
    borderRadius: 10,
    padding: 12,
    marginTop: 18,
    gap: 8,
  },
  infoText: {
    color: "#4F8EF7",
    fontSize: 14,
    flex: 1,
    fontWeight: "500",
  },
});

export default PaymentScreen;
