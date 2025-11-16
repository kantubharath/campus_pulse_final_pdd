import { MaterialIcons } from '@expo/vector-icons';
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Button from "../components/Button";
import Header from "../components/Header";
import Input from "../components/Input";
import { auth, firestore } from "../firebase/firebaseConfig";
import Loader from '../components/Loader';
import axiosInstance from '../utils/axiosInstance';

const EventRegistrationScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [yearsOfStudy, setYearsOfStudy] = useState("");
  const [loading, setLoading] = useState(false);

  const checkPaymentStatus = async () => {
    const curentUser = auth.currentUser;
    if (!curentUser) return false;
    const response = await axiosInstance.get(`/payments/check/${curentUser.uid}/${event.id}`);
    return response.data.hasPayment;
  };

  const handleRegister = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert("Please login to register for events.");
        return;
      }
      setLoading(true);
      const resgistrationsRef = collection(firestore, "registrations");
      const q = query(
        resgistrationsRef,
        where("eventId", "==", event.id),
        where("userId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        alert("You have already registered for this event.");
        setLoading(false);
        return;
      }
      const hasPayment = await checkPaymentStatus();
      if (event.fee > 0 && !hasPayment) {
        alert("Please pay the registration fee first.");
        navigation.navigate("PaymentScreen", { event });
        setLoading(false);
        return;
      }
      await addDoc(collection(firestore, "registrations"), {
        eventId: event.id,
        userId: currentUser.uid,
        fullName,
        email,
        phone,
        collegeName,
        yearsOfStudy,
        timestamp: new Date(),
      });
      setLoading(false);
      alert("Registration Successful");
      navigation.goBack();
    } catch (err) {
      setLoading(false);
      alert("Registration failed. Please try again.");
    }
  };

  const handlePay = () => {
    navigation.navigate("PaymentScreen", { event });
  };

  if (loading) {
    return <Loader />
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f8fa" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <Header title={"Event Registration"} navigation={navigation} />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: event.image }} style={styles.image} />
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{event.category}</Text>
            </View>
          </View>
          <View style={styles.details}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <MaterialIcons name="calendar-today" size={18} color="#4F8EF7" />
                <Text style={styles.infoText}>{event.date}</Text>
              </View>
              <View style={styles.infoItem}>
                <MaterialIcons name="access-time" size={18} color="#4F8EF7" />
                <Text style={styles.infoText}>{event.time}</Text>
              </View>
              <View style={styles.infoItem}>
                <MaterialIcons name="location-on" size={18} color="#4F8EF7" />
                <Text style={styles.infoText}>{event.location}</Text>
              </View>
            </View>
            <Input
              label={"Full Name"}
              placeholder={"Enter your full name"}
              icon={"person"}
              value={fullName}
              onChangeText={setFullName}
            />
            <Input
              label={"Email Address"}
              placeholder={"your.email@university.edu"}
              icon={"email"}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <Input
              label={"Phone Number"}
              placeholder={"+91 1234567890"}
              icon={"phone"}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Input
              label={"College Name"}
              placeholder={"Enter your college name"}
              icon={"school"}
              value={collegeName}
              onChangeText={setCollegeName}
            />
            <Input
              label={"Year of Study"}
              placeholder={"Select year"}
              icon={"calendar-today"}
              value={yearsOfStudy}
              onChangeText={setYearsOfStudy}
            />
            {event.fee > 0 && (
              <>
                <View style={styles.feeRow}>
                  <MaterialIcons name="attach-money" size={20} color="#E65100" />
                  <Text style={styles.feeText}>Registration Fee: ₹{event.fee}</Text>
                </View>
                <Button title={"Pay Now"} colors={["#00c853", "#00e676"]} onPress={handlePay} />
                <View style={styles.paymentInfo}>
                  <MaterialIcons name="lock" size={16} color={"#666"} />
                  <Text style={styles.paymentText}>Secure Payment by Campus Pulse</Text>
                </View>
              </>
            )}
            <Button title={"Register Now"} onPress={handleRegister} />
            <Text style={styles.terms}>
              By registering, you agree to our <Text style={styles.link}>Terms</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f8fa",
  },
  scrollContent: {
    paddingBottom: 40,
    backgroundColor: "#f6f8fa",
  },
  imageWrapper: {
    position: "relative",
    width: "100%",
    height: 180,
    backgroundColor: "#eee",
  },
  image: {
    width: "100%",
    height: 180,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  categoryPill: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#4F8EF7",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryPillText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  details: {
    padding: 22,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 6,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    marginBottom: 10,
    marginTop: 6,
    justifyContent: "center",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 18,
    marginBottom: 6,
  },
  infoText: {
    marginLeft: 6,
    color: "#444",
    fontSize: 15,
    fontWeight: "500",
  },
  feeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  feeText: {
    marginLeft: 6,
    color: "#E65100",
    fontWeight: "700",
    fontSize: 16,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  paymentText: {
    marginLeft: 5,
    color: "#666",
  },
  terms: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
  },
  link: {
    color: "#4F8EF7",
    textDecorationLine: "underline",
  },
});

export default EventRegistrationScreen;