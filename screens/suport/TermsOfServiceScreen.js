import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const TermsOfServiceScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Terms of Service</Text>
        <Text style={styles.paragraph}>
          Welcome to Campus Pulse! By using our app, you agree to the following terms and conditions.
        </Text>
        <Text style={styles.subTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using Campus Pulse, you agree to be bound by these Terms of Service and our Privacy Policy.
        </Text>
        <Text style={styles.subTitle}>2. User Conduct</Text>
        <Text style={styles.paragraph}>
          You agree to use the app responsibly and not engage in any unlawful or harmful activities.
        </Text>
        <Text style={styles.subTitle}>3. Account Responsibility</Text>
        <Text style={styles.paragraph}>
          You are responsible for maintaining the confidentiality of your account and password.
        </Text>
        <Text style={styles.subTitle}>4. Modifications</Text>
        <Text style={styles.paragraph}>
          We may update these terms from time to time. Continued use of the app constitutes acceptance of the updated terms.
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

export default TermsOfServiceScreen;