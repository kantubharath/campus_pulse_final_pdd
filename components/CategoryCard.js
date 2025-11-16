// components/CategoryCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const CategoryCard = ({ title, events, icon, color, onPress }) => {
  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: color }]} onPress={onPress}>
      <MaterialIcons name={icon} size={30} color="#fff" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.events}>{events} events</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 15,
    padding: 15,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
  },
  events: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },
});

export default CategoryCard;