import * as ImagePicker from 'expo-image-picker';
import { reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { EmailAuthProvider } from "firebase/auth/web-extension";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Image, SafeAreaView, ScrollView, StatusBar, Platform } from "react-native";
import Button from "../components/Button";
import Input from "../components/Input";
import Loader from "../components/Loader";
import { auth, firestore } from "../firebase/firebaseConfig";
import { uploadImageToCloudinary } from "../utils/cloudinary";
import { MaterialIcons } from "@expo/vector-icons";

const EditProfileScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [collegeId, setCollegeId] = useState(null);
  const [collegeIdUrl, setCollegeIdUrl] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [yearsOfStudy, setYearsOfStudy] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;
        if (!user) {
          setError('No user is logged in');
          return;
        }
        const uid = user.uid;
        const userDoc = await getDoc(doc(firestore, 'users', uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFullName(userData.fullName || '');
          setCollegeIdUrl(userData.collegeId || '');
          setCollegeName(userData.collegeName || '');
          setYearsOfStudy(userData.yearsOfStudy || '');
        } else {
          setError('User data not found');
        }
      } catch (err) {
        setError('Error in fetching userData: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigation]);

  const pickCollegeId = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });
    if (!result.canceled) {
      setCollegeId(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        setError('User not logged in');
        return;
      }
      const uid = user.uid;

      if (newPassword || confirmPassword || currentPassword) {
        if (!currentPassword) {
          setError('Please enter your current password');
          setLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
      }

      let newCollegeIdUrl = collegeIdUrl;
      if (collegeId) {
        newCollegeIdUrl = await uploadImageToCloudinary(collegeId);
        setCollegeIdUrl(newCollegeIdUrl);
      }

      await updateDoc(doc(firestore, 'users', uid), {
        fullName,
        collegeId: newCollegeIdUrl,
        collegeName,
        yearsOfStudy,
      });

      navigation.navigate('Main', { screen: 'Profile' });
    } catch (err) {
      setError('Error in updating profile: ' + err.message);
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            {collegeId || collegeIdUrl ? (
              <Image
                source={{ uri: collegeId || collegeIdUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={48} color="#bbb" />
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarBtn} onPress={pickCollegeId}>
              <MaterialIcons name="edit" size={20} color="#4F8EF7" />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Edit Profile</Text>
          <Text style={styles.subtitle}>Update your campus profile</Text>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.inputContainer}>
          <MaterialIcons name="person" size={20} color="#4F8EF7" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder='Full Name'
            value={fullName}
            onChangeText={setFullName}
            placeholderTextColor="#aaa"
          />
        </View>
        <View style={styles.inputContainer}>
          <MaterialIcons name="school" size={20} color="#4F8EF7" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="College Name"
            value={collegeName}
            onChangeText={setCollegeName}
            placeholderTextColor="#aaa"
          />
        </View>
        <View style={styles.inputContainer}>
          <MaterialIcons name="calendar-today" size={20} color="#4F8EF7" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder='Year of Study'
            value={yearsOfStudy}
            onChangeText={setYearsOfStudy}
            placeholderTextColor="#aaa"
          />
        </View>
        <TouchableOpacity style={styles.uploadButton} onPress={pickCollegeId}>
          <MaterialIcons name="cloud-upload" size={20} color="#4F8EF7" style={{ marginRight: 8 }} />
          <Text style={styles.uploadText}>
            {collegeId || collegeIdUrl ? 'Profile ID Uploaded' : 'Upload College ID'}
          </Text>
        </TouchableOpacity>
        <View style={styles.inputContainer}>
          <MaterialIcons name="lock" size={20} color="#4F8EF7" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder='Current Password'
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            placeholderTextColor="#aaa"
          />
        </View>
        <View style={styles.inputContainer}>
          <MaterialIcons name="lock" size={20} color="#4F8EF7" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder='New Password'
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholderTextColor="#aaa"
          />
        </View>
        <View style={styles.inputContainer}>
          <MaterialIcons name="lock" size={20} color="#4F8EF7" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder='Confirm New Password'
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor="#aaa"
          />
        </View>
        <Button title={'Save Changes'} onPress={handleSaveProfile} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f8fa",
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 18,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 10,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#eee",
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginTop: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 10,
    fontWeight: "500",
  },
  error: {
    color: "#F44336",
    textAlign: "center",
    marginBottom: 10,
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
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4F8EF7",
    borderRadius: 12,
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
});

export default EditProfileScreen;