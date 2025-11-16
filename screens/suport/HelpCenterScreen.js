import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const HelpCenterScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <Text style={styles.paragraph}>
          Here are some common questions and answers to help you get started with Campus Pulse.
        </Text>
        <Text style={styles.question}>Q: How do I register for an event?</Text>
        <Text style={styles.answer}>
          A: Navigate to the All Events screen, select an event, and tap "Register" on the Event Details page.
        </Text>
        <Text style={styles.question}>Q: How can I update my profile?</Text>
        <Text style={styles.answer}>
          A: Go to the Profile tab, tap "Edit Profile" from Settings, and update your details.
        </Text>
        <Text style={styles.question}>Q: What should I do if I forget my password?</Text>
        <Text style={styles.answer}>
          A: On the Login screen, tap "Forgot Password" and follow the instructions to reset it.
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
  paragraph: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  answer: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
});

export default HelpCenterScreen;