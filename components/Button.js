import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const Button = ({ title, onPress, style, colors = ["#2196f3", "#21cbf3"] }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
      <LinearGradient colors={colors} style={styles.gradient}>
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    marginVertical: 10,
  },
  gradient: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Button;