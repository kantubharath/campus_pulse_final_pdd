import React from "react";
import { 
  TextInput,
  View,
  StyleSheet,
  Text,
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

const Input = ({ placeholder, icon, value, onChangeText, secureTextEntry, label }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        {icon && <MaterialIcons name={icon} size={20} color={"#666"} style={styles.icon} />}
        <TextInput 
          style={styles.input}
          placeholder={placeholder}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          placeholderTextColor={"#999"}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
  },
});

export default Input;