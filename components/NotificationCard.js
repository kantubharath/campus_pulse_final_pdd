import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const NotificationCard = ({ title, description, time, type, onPress }) => { 
  const getIcon = () => {
    let name, color;
    switch (type) {
      case "reminder":
        name = "notifications";
        color = "#ff9800";
        break;
      case "success":
        name = "check-circle";
        color = "#4caf50";
        break;
      case "update":
        name = "campaign";
        color = "#2196f3";
        break;
      case "interaction":
        name = "favorite";
        color = "#f44336";
      default: 
        name = "notifications";
        color = "#ff9800";
        break;
    }
    return (
      <MaterialIcons name={name} size={24} color={color} />
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.icon}>{getIcon()}</View>
      <View style={styles.details}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={"#666"} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  icon: {
    marginRight: 15,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
});

export default NotificationCard;