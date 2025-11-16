// screens/SettingsScreen.js
import { MaterialIcons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { auth, firestore } from '../firebase/firebaseConfig';

const SettingsScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [pushNotifications, setPushNotifications] = useState(true);

  const [emailNotifications, setEmailNotifications] = useState(false);
  const [eventReminders, setEventReminders] = useState(true);
  const [campusUpdates, setCampusUpdates] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().fullName);
            setProfileImage(userDoc.data().collegeId);
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigation.replace('Login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
        <Text style={styles.name}>{userName}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.editProfile}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.setting}>
          <Text style={styles.settingText}>Push Notifications</Text>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
            trackColor={{ false: '#ddd', true: '#4CAF50' }}
          />
        </View>
        <View style={styles.setting}>
          <Text style={styles.settingText}>Email Notifications</Text>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ false: '#ddd', true: '#4CAF50' }}
          />
        </View>
        <View style={styles.setting}>
          <Text style={styles.settingText}>Event Reminders</Text>
          <Switch
            value={eventReminders}
            onValueChange={setEventReminders}
            trackColor={{ false: '#ddd', true: '#4CAF50' }}
          />
        </View>
        <View style={styles.setting}>
          <Text style={styles.settingText}>Campus Updates</Text>
          <Switch
            value={campusUpdates}
            onValueChange={setCampusUpdates}
            trackColor={{ false: '#ddd', true: '#4CAF50' }}
          />
        </View>
      </View> */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Calendar</Text>
        <TouchableOpacity style={styles.setting}>
          <Text style={styles.settingText}>Sync Calendar</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.setting}>
          <Text style={styles.settingText}>Connected Accounts</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View> */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.setting} onPress={() => navigation.navigate("EditProfile")}>
          <Text style={styles.settingText}>Personal Information</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.setting} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.settingText}>Password & Security</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.setting}>
          <Text style={styles.settingText}>Language</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.setting}>
          <Text style={styles.settingText}>Privacy Settings</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity> */}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.setting} onPress={() => navigation.navigate('HelpCenter')}>
          <Text style={styles.settingText}>Help Center</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.setting} onPress={() => navigation.navigate('ContactSupport')}>
          <Text style={styles.settingText}>Contact Support</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.setting} onPress={() => navigation.navigate('TermsOfService')}>
          <Text style={styles.settingText}>Terms of Service</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.setting} onPress={() => navigation.navigate('PrivacyPolicy')}>
          <Text style={styles.settingText}>Privacy Policy</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      <Text style={styles.version}>Version 2.1.0</Text>
      <TouchableOpacity style={styles.signOut} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  editProfile: {
    color: '#2196F3',
    fontSize: 16,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  version: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  signOut: {
    margin: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  signOutText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;