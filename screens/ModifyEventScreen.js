import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { collection, doc, getDocs, query, updateDoc, where, writeBatch } from "firebase/firestore";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  StatusBar,
  SafeAreaView,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Button from "../components/Button";
import Header from "../components/Header";
import Loader from "../components/Loader";
import { firestore } from "../firebase/firebaseConfig";
import { categories } from "../static/categories";
import { uploadImageToCloudinary } from "../utils/cloudinary";
import { MaterialIcons } from "@expo/vector-icons";

const ModifyEventScreen = ({ route, navigation }) => {
  const { event } = route.params;
  if (!event) {
    return <Text>Event data is not available</Text>;
  }

  const parseDate = (dateString) => {
    try {
      const parts = dateString.split(" ");
      if (parts.length !== 3) throw new Error("Invalid date format");

      const month = parts[0];
      const day = parseInt(parts[1].replace(",", ""), 10);
      const year = parseInt(parts[2], 10);

      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      const monthIndex = monthNames.indexOf(month);
      if (monthIndex === -1) throw new Error("Invalid month name");

      const parsedDate = new Date(year, monthIndex, day);
      if (isNaN(parsedDate.getTime())) throw new Error("Invalid date");

      return parsedDate;
    } catch (err) {
      console.log("Error in parsing date", err);
      return new Date(); // Fallback to current date
    }
  };

  const parseTime = (timeString) => {
    try {
      const [start, end] = timeString.split(" - ");
      if (!start || !end) throw new Error("Invalid time format");

      const startParts = start.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!startParts) throw new Error("Invalid start time format");

      let startHour = parseInt(startParts[1], 10);
      const startMinute = parseInt(startParts[2], 10);
      const startPeriod = startParts[3].toUpperCase();

      if (startPeriod === "PM" && startHour !== 12) startHour += 12;
      if (startPeriod === "AM" && startHour === 12) startHour = 0;

      const endParts = end.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!endParts) throw new Error("Invalid end time format");

      let endHour = parseInt(endParts[1], 10);
      const endMinute = parseInt(endParts[2], 10);
      const endPeriod = endParts[3].toUpperCase();

      if (endPeriod === "PM" && endHour !== 12) endHour += 12;
      if (endPeriod === "AM" && endHour === 12) endHour = 0;

      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), startHour, startMinute);
      const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), endHour, endMinute);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) throw new Error("Invalid time");

      return [startDate, endDate];
    } catch (err) {
      console.log("Error in parsing time", err);
      const now = new Date();
      const defaultEnd = new Date(now);
      defaultEnd.setHours(now.getHours() + 1);
      return [now, defaultEnd];
    }
  };

  const [title, setTitle] = useState(event.title || "");
  const [date, setDate] = useState(parseDate(event.date));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState(parseTime(event.time)[0]);
  const [endTime, setEndTime] = useState(parseTime(event.time)[1]);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [location, setLocation] = useState(event.location || "");
  const [fee, setFee] = useState(event.fee ? event.fee.toString() : "");
  const [image, setImage] = useState(event.image || "");
  const [category, setCategory] = useState(event.category || "");
  const [description, setDescription] = useState(event.description || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentScanneImage, setPaymentScannerImage] = useState(event.paymentScannerImage || "")

  const formatDate = (date) => {
    return date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (start, end) => {
    const formatOptions = { hour: "numeric", minute: "2-digit", hour12: true };
    const startTimeStr = start.toLocaleString("en-US", formatOptions);
    const endTimeStr = end.toLocaleString("en-US", formatOptions);

    return `${startTimeStr} - ${endTimeStr}`;
  };

  const handleDateConfirm = (selectedDate) => {
    setShowDatePicker(false);
    setDate(selectedDate);
  };

  const handleStartTimeConfirm = (selectedTime) => {
    setShowStartTimePicker(false);
    setStartTime(selectedTime);
  };

  const handleEndTimeConfirm = (selectedTime) => {
    setShowEndTimePicker(false);
    setEndTime(selectedTime);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const pickPaymentScanneImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionAsync();
    if (status !== 'granted') {
      alert("Sorry we need camera permission to make this work");
      reutrn;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setPaymentScannerImage(result.assets[0]);
    }
  };



  const handleModifyEvent = async () => {
    try {
      setLoading(true);
      let imageUrl = image;
      let paymentScannerImageUrl = paymentScanneImage;
      if (image !== event.image && image) {
        imageUrl = await uploadImageToCloudinary(image);
      }
      if (paymentScanneImage !== event.paymentScannerImage && paymentScanneImage) {
        paymentScannerImageUrl = await uploadImageToCloudinary(paymentScanneImage);
      }

      // Update the event document
      await updateDoc(doc(firestore, "events", event.id), {
        title,
        date: formatDate(date),
        time: formatTime(startTime, endTime),
        location,
        fee: parseFloat(fee) || 0,
        image: imageUrl,
        paymentScannerImage: paymentScannerImageUrl,
        category,
        description,
      });

      // Fetch registrations and send notifications
      const registrationsQuery = query(
        collection(firestore, "registrations"),
        where("eventId", "==", event.id)
      );

      const snapshot = await getDocs(registrationsQuery);
      if (snapshot.empty) {
        console.log("No registrations found for this event");
      } else {
        const batch = writeBatch(firestore); // Use writeBatch instead of firestore.batch()
        snapshot.forEach((reg) => {
          const notificationRef = doc(collection(firestore, "notifications"));
          batch.set(notificationRef, {
            userId: reg.data().userId,
            title: `Event Updated: ${title}`,
            description: `The event "${title}" has been changed. Check the new details!`,
            type: "update",
            timestamp: new Date(),
            read: false,
          });
        });
        await batch.commit();
        console.log(`Sent ${snapshot.size} notifications`);
      }

      // Update community title if it exists
      const communityQuery = query(
        collection(firestore, "community"),
        where("eventId", "==", event.id)
      );

      const communitySnapshot = await getDocs(communityQuery);
      if (!communitySnapshot.empty) {
        const communityDoc = communitySnapshot.docs[0];
        await updateDoc(doc(firestore, "community", communityDoc.id), {
          title: `${title} Community`,
        });
      }

      navigation.goBack();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- UI/UX Modernization Starts Here ---
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
          <Header title={"Modify Event"} navigation={navigation} />
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {error && <Text style={styles.error}>{error}</Text>}
            <View style={styles.inputContainer}>
              <MaterialIcons name="event" size={20} color="#4F8EF7" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={"Event Title"}
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={styles.inputRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                  style={styles.inputBtn}
                  onPress={() => setShowDatePicker(true)}
                >
                  <MaterialIcons name="calendar-today" size={18} color="#4F8EF7" style={{ marginRight: 6 }} />
                  <Text style={styles.inputBtnText}>{formatDate(date)}</Text>
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={showDatePicker}
                  mode="date"
                  onConfirm={handleDateConfirm}
                  onCancel={() => setShowDatePicker(false)}
                />
                <Text style={[styles.label, { marginTop: 12 }]}>Time</Text>
                <View style={styles.timeRow}>
                  <TouchableOpacity
                    style={styles.inputBtn}
                    onPress={() => setShowStartTimePicker(true)}
                  >
                    <MaterialIcons name="access-time" size={18} color="#4F8EF7" style={{ marginRight: 6 }} />
                    <Text style={styles.inputBtnText}>
                      {startTime.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.timeSeparator}>-</Text>
                  <TouchableOpacity
                    style={styles.inputBtn}
                    onPress={() => setShowEndTimePicker(true)}
                  >
                    <MaterialIcons name="access-time" size={18} color="#4F8EF7" style={{ marginRight: 6 }} />
                    <Text style={styles.inputBtnText}>
                      {endTime.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </Text>
                  </TouchableOpacity>
                </View>
                <DateTimePickerModal
                  isVisible={showStartTimePicker}
                  mode="time"
                  onConfirm={handleStartTimeConfirm}
                  onCancel={() => setShowStartTimePicker(false)}
                />
                <DateTimePickerModal
                  isVisible={showEndTimePicker}
                  mode="time"
                  onConfirm={handleEndTimeConfirm}
                  onCancel={() => setShowEndTimePicker(false)}
                />
              </View>
            </View>
            <View style={styles.inputContainer}>
              <MaterialIcons name="location-on" size={20} color="#4F8EF7" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={"Location"}
                value={location}
                onChangeText={setLocation}
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={styles.inputContainer}>
              <MaterialIcons name="attach-money" size={20} color="#4F8EF7" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={"Registration Fee (e.g., 149.50)"}
                value={fee}
                onChangeText={setFee}
                keyboardType="numeric"
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={styles.textAreaContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Enter event description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={category}
                  onValueChange={(itemValue) => setCategory(itemValue)}
                  style={styles.picker}
                  dropdownIconColor="#4F8EF7"
                >
                  <Picker.Item label="Select a category" value="" />
                  {categories.map((cat) => (
                    <Picker.Item
                      key={cat.id}
                      label={cat.title}
                      value={cat.title}
                      color={cat.color}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <MaterialIcons name="image" size={20} color="#4F8EF7" style={{ marginRight: 8 }} />
              <Text style={styles.uploadText}>
                {image ? "Event Image Uploaded" : "Upload Event Image"}
              </Text>
            </TouchableOpacity>
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : null}
            <TouchableOpacity style={styles.uploadButton} onPress={pickPaymentScanneImage}>
              <MaterialIcons name="qr-code" size={20} color="#4F8EF7" style={{ marginRight: 8 }} />
              <Text style={styles.uploadText}>
                {paymentScanneImage ? "Payment Scanner uploaded" : "Upload Payment Scanner Image"}
              </Text>
            </TouchableOpacity>
            {paymentScanneImage ? (
              <Image source={{ uri: paymentScanneImage }} style={styles.previewImageSmall} />
            ) : null}
            <Button title={"Modify Event"} onPress={handleModifyEvent} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f8fa",
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  error: {
    color: "#F44336",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#222",
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  inputBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f3f6",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 2,
    marginBottom: 2,
  },
  inputBtnText: {
    fontSize: 16,
    color: "#222",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeSeparator: {
    fontSize: 18,
    color: "#888",
    marginHorizontal: 6,
    fontWeight: "700",
  },
  textAreaContainer: {
    marginVertical: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    minHeight: 90,
    textAlignVertical: "top",
    fontSize: 16,
    backgroundColor: "#f1f3f6",
    color: "#222",
  },
  pickerContainer: {
    marginVertical: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f1f3f6",
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#222",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4F8EF7",
    borderRadius: 10,
    padding: 14,
    marginVertical: 10,
    backgroundColor: "#f6f8fa",
    justifyContent: "center",
  },
  uploadText: {
    color: "#4F8EF7",
    fontWeight: "600",
    fontSize: 15,
  },
  previewImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginBottom: 10,
    marginTop: -6,
    backgroundColor: "#eee",
  },
  previewImageSmall: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: -6,
    alignSelf: "center",
    backgroundColor: "#eee",
  },
});

export default ModifyEventScreen;