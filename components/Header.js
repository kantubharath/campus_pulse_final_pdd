import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

const Header = ({ title, navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    elevation: 2,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});

export default Header;