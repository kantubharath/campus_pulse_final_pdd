import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection } from "firebase/firestore";
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
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Button from "../components/Button";
import Header from "../components/Header";
import Input from "../components/Input";
import Loader from "../components/Loader";
import { auth, firestore } from "../firebase/firebaseConfig";
import { categories as staticCats } from "../static/categories";
import { uploadImageToCloudinary } from "../utils/cloudinary";
import { MaterialIcons } from "@expo/vector-icons";

const CreateEventScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [location, setLocation] = useState("");
  const [fee, setFee] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentScannerImage, setPaymentScannerIamge] = useState(null);

  const [categories] = useState(staticCats);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
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

  const pickPaymentScannerImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setPaymentScannerIamge(result.assets[0].uri);
    }
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

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formateTime = (start, end) => {
    const formatOptions = { hour: "numeric", minute: "2-digit", hour12: true };
    const startTime = start.toLocaleTimeString("en-US", formatOptions);
    const endTime = end.toLocaleTimeString("en-US", formatOptions);
    return `${startTime} - ${endTime}`;
  };

  const handleCreateEvent = async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("You must be logged in to create an event");
      }
      let imageUrl = "";
      let paymentScannerImageUrl = "";
      if (image) {
        imageUrl = await uploadImageToCloudinary(image);
      }
      if (paymentScannerImage) {
        paymentScannerImageUrl = await uploadImageToCloudinary(paymentScannerImage);
      }
      await addDoc(collection(firestore, "tentativeEvents"), {
        title,
        date: formatDate(date),
        time: formateTime(startTime, endTime),
        location,
        fee: parseFloat(fee) || 0,
        description,
        image: imageUrl,
        paymentScannerImage: paymentScannerImageUrl,
        category,
        creator: currentUser.uid,
        trending: Math.random() <= 0.3,
      });
      navigation.goBack();
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
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={styles.container}>
        <Header title={"Create Event"} navigation={navigation} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {error && <Text style={styles.error}>{error}</Text>}
          <Input
            label={"Event Title"}
            placeholder={"Enter event title"}
            value={title}
            onChangeText={setTitle}
          />
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
              {/* Move time pickers below date */}
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
          <Input
            label={"Location"}
            placeholder={"Enter location"}
            value={location}
            onChangeText={setLocation}
          />
          <Input
            label={"Registration Fee"}
            placeholder={"Enter registration fee (e.g., 149.50)"}
            value={fee}
            onChangeText={setFee}
            keyboardType="numeric"
          />
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
          {image && (
            <Image source={{ uri: image }} style={styles.previewImage} />
          )}
          <TouchableOpacity style={styles.uploadButton} onPress={pickPaymentScannerImage}>
            <MaterialIcons name="qr-code" size={20} color="#4F8EF7" style={{ marginRight: 8 }} />
            <Text style={styles.uploadText}>
              {paymentScannerImage ? "Scanner image uploaded" : "Upload scanner image"}
            </Text>
          </TouchableOpacity>
          {paymentScannerImage && (
            <Image source={{ uri: paymentScannerImage }} style={styles.previewImageSmall} />
          )}
          <Button title={"Create Event"} onPress={handleCreateEvent} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: "#f6f8fa",
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

export default CreateEventScreen;