import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

const EventCard = ({ title, date, time, location, image, onPress, status }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: image}} style={styles.image} />
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
        {status && (
          <View style={styles.status}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  details: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  infoText: {
    marginLeft: 5,
    color: "#666",
  },
  status: {
    marginTop: 5,
    backgroundColor: "#e0f7fa",
    padding: 5,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#00acc1",
    fontSize: 12,
  },
});

export default EventCard;