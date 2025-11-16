// import { MaterialIcons } from "@expo/vector-icons";
// import React from "react";
// import {
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// const TrendingEventCard = ({ title, date, time, location, image, onPress }) => {
//   return (
//     <TouchableOpacity style={styles.container} onPress={onPress}>
//       <Image source={{ uri: image }} style={styles.image} />
//       <View style={styles.details}>
//         <Text style={styles.title}>{title}</Text>
//         <View style={styles.info}>
//           <MaterialIcons name="calendar-today" size={16} color={"#fff"} />
//           <Text style={styles.infoText}>{date} • {time}</Text>
//         </View>
//         <View style={styles.info}>
//           <MaterialIcons name="location-on" size={16} color={"#fff"} />
//           <Text style={styles.infoText}>{location}</Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     width: 250,
//     height: 300, // Taller card
//     backgroundColor: '#6B48FF',
//     borderRadius: 15,
//     marginRight: 15,
//     overflow: 'hidden',
//   },
//   image: {
//     width: '100%',
//     height: 180, // Larger image
//     borderTopLeftRadius: 15,
//     borderTopRightRadius: 15,
//   },
//   details: {
//     padding: 15,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 10,
//   },
//   info: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 5,
//   },
//   infoText: {
//     marginLeft: 5,
//     color: '#fff',
//     fontSize: 14,
//   },
// });

// export default TrendingEventCard;

import { MaterialIcons } from "@expo/vector-icons";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const TrendingEventCard = ({ title, date, time, location, image, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.imageText}>
        <Text style={styles.imageTitle}>{title}</Text>
        <Text style={styles.imageDate}>{date}</Text>
      </View>
      <View style={styles.details}>
        <View style={styles.info}>
          <MaterialIcons name="calendar-today" size={16} color={"abcdef"} />
          <Text style={styles.infoText}>{date} • {time}</Text>
        </View>
        <View style={styles.info}>
          <MaterialIcons name="location-on" size={16} color={"#abcdef"} />
          <Text style={styles.infoText}>{location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 275,
    height: 250,
    backgroundColor: '#00ceff',
    borderRadius: 15,
    marginRight: 15,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: "50%",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  imageText: {
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  imageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  imageDate: {
    fontSize: 14,
    color: '#fff',
    marginTop: 1,
  },
  details: {
    padding: 5,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  infoText: {
    marginLeft: 5,
    color: '#fff',
    fontSize: 14,
  },
});

export default TrendingEventCard;

