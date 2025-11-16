// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { auth } from '../firebase/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import the new method
import Input from '../components/Input';
import Button from '../components/Button';
import { MaterialIcons } from "@expo/vector-icons";
import Loader from '../components/Loader';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password); // Updated method
      if (email.split("@")[0].toLowerCase() === 'admin') {
        navigation.replace('Admin');
        return;
      }
      navigation.replace('Main');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>CP</Text>
      <Text style={styles.title}>Welcome to Campus Pulse</Text>
      <Text style={styles.subtitle}>Sign in to stay updated on the latest campus events!</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Input
        placeholder="Enter your email"
        icon="email"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        placeholder="Enter your password"
        icon="lock"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgot}>Forgot password?</Text>
      </TouchableOpacity>
      <Button title="Log In" onPress={handleLogin} />
      <View style={styles.divider}>
        <Text style={styles.dividerText}>Or continue with</Text>
      </View>
      <Button
        title="Continue with Google"
        style={styles.googleButton}
        // onPress={() => alert('Google Sign-In not implemented')}
      >
        <MaterialIcons name="google" size={20} color="#DB4437" style={styles.googleIcon} />
      </Button>
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signup}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#6B48FF',
    padding: 15,
    borderRadius: 10,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  forgot: {
    color: '#6B48FF',
    textAlign: 'right',
    marginBottom: 10,
  },
  divider: {
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerText: {
    color: '#666',
  },
  googleButton: {
    borderWidth: 1,
    borderColor: '#ddd',
  },
  googleIcon: {
    position: 'absolute',
    left: 20,
  },
  signup: {
    color: '#6B48FF',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default LoginScreen;