import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const ProfileEventCard = ({ title, date, time, location, image, status, onPress }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.info}>
          <MaterialIcons name="calendar-today" size={16} color={"#666"} />
          <Text style={styles.infoText}>{date} • {time}</Text>
        </View>
        <View style={styles.info}>
          <MaterialIcons name="location-on" size={16} color={"#666"} />
          <Text style={styles.infoText}>{location}</Text>
        </View>
        <View style={styles.status}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onPress} style={styles.button}>
        <Text style={styles.buttonText}>View Certificate</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 10,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  details: {
    flex: 1,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  infoText: {
    marginLeft: 5,
    color: '#666',
  },
  status: {
    marginTop: 5,
    backgroundColor: '#E0F7FA',
    padding: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#00ACC1',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default ProfileEventCard;