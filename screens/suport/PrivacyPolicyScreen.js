import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const PrivacyPolicyScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Privacy Policy</Text>
        <Text style={styles.paragraph}>
          At Campus Pulse, we value your privacy. This Privacy Policy explains how we collect, use, and protect your information.
        </Text>
        <Text style={styles.subTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect information you provide, such as your name, email, and college ID, to create and manage your account.
        </Text>
        <Text style={styles.subTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          Your information is used to personalize your experience, manage event registrations, and improve our services.
        </Text>
        <Text style={styles.subTitle}>3. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement security measures to protect your data, but no system is completely secure. Use the app at your own risk.
        </Text>
        <Text style={styles.subTitle}>4. Sharing Information</Text>
        <Text style={styles.paragraph}>
          We do not share your personal information with third parties except as required by law or to provide our services.
        </Text>
      </ScrollView>
    </View>
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 15,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
});

export default PrivacyPolicyScreen;