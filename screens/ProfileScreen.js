import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Button from "../components/Button";
import ProfileEventCard from "../components/ProfileEventCard";
import { auth } from "../firebase/firebaseConfig";
import axiosInstance from "../utils/axiosInstance";

// Function to convert string date to Date object for comparison
const parseDate = (dateStr) => {
  const [month, day, year] = dateStr.split(" ");
  const monthMap = {
    January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
    July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
  };
  return new Date(`${year}-${(monthMap[month] + 1).toString().padStart(2, "0")}-${day.padStart(2, "0")}`);
};

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({
    fullName: "",
    university: "",
    major: "",
    profileImage: "https://res.cloudinary.com/dpfrwxe1r/image/upload/v1743422310/WIN_20250311_12_13_51_Pro_ueu367.jpg", // Fallback image
  });
  const [registrations, setRegistrations] = useState(0);
  const [createdEvents, setCreatedEvents] = useState(0);
  const [eventHistory, setEventHistory] = useState(0);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createdEventsToBeRendered, setCreatedEventsToBeRendered] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);

  useEffect(() => {
    let isMounted = true; // To avoid setting state on unmounted component

    const fetchProfileData = async () => {
      setLoading(true);

      try {
        const user = auth.currentUser;
        if (!user) {
          console.log("No user is logged in");
          return;
        }

        const uid = user.uid;

        // Fetch user profile, created events, and registered events in parallel
        const [userResponse, regCountResponse, eventsResponse] = await Promise.all([
          axiosInstance.get(`/user/profile/${uid}`),
          axiosInstance.get(`/events/registered/${uid}`),
          axiosInstance.get(`/events/created/${uid}`)
        ]);

        if (!isMounted) return;

        // Set user profile
        setUserData(userResponse.data);
        console.log(userResponse.data, "this is user data");

        // Set registration count
        setRegistrations(regCountResponse.data?.events?.length || 0);

        // Set event creation related data
        const createdData = eventsResponse.data;
        setEventHistory(createdData.eventHistory || 0);
        setCreatedEvents(createdData.createdEvents?.length || 0);
        setCreatedEventsToBeRendered(createdData.createdEvents || []);
        setPastEvents(createdData.pastEvents || []);

        // Setup polling for registered events
        const fetchRegisteredEvents = async () => {
          try {
            const regEventResponse = await axiosInstance.get(`/events/registered/${uid}`);
            if (!isMounted) return;
            setEvents(regEventResponse.data?.events || []);
            setRegisteredEvents(regEventResponse.data?.events || []);
          } catch (err) {
            console.log("Error fetching registered events:", err);
          }
        };

        await fetchRegisteredEvents(); // Initial fetch

        const interval = setInterval(fetchRegisteredEvents, 5000);

        // Cleanup interval on unmount
        return () => {
          isMounted = false;
          clearInterval(interval);
        };
      } catch (err) {
        console.log("Error fetching profile data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigation]);


  // console.log("Created evetns are", createdEventsToBeRendered);
  // console.log("Regisetered events")

  const handleViewCertificate = (event) => {
    const currentUserId = auth.currentUser.uid;
    if (!currentUserId) {
      console.log("User not logged in");
      return;
    }
    console.log("UserID is: ", currentUserId);
    console.log("Event id is: ", event.id);
    // return;
    const baseUrl = axiosInstance.defaults.baseURL;
    const url = `${baseUrl}/download-certificate/${currentUserId}/${event.id}`;
    Linking.openURL(url).catch((err) => console.log("Error in opening the url: ", err));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
        <Text style={styles.name}>{userData.fullName}</Text>
        <Text style={styles.university}>{userData.university}</Text>
        <Text style={styles.major}>{userData.major}</Text>
        <Button
          title="Edit Profile"
          style={styles.editButton}
          onPress={() => navigation.navigate("Settings")}
        />
      </View>
      <View style={styles.stats}>
        <Pressable
          style={styles.stat}
          onPress={() => navigation.navigate("ProfileEvents", { events: registeredEvents, title: "Registered Events" })}
        >
          <Text style={styles.statNumber}>{registrations}</Text>
          <Text style={styles.statLabel}>My Registrations</Text>
        </Pressable>

        <Pressable
          style={styles.stat}
          onPress={() => navigation.navigate("ProfileEvents", { events: createdEventsToBeRendered, title: "Created Events" })}
        >
          <Text style={styles.statNumber}>{createdEvents}</Text>
          <Text style={styles.statLabel}>Created Events</Text>
        </Pressable>

        <Pressable
          style={styles.stat}
          onPress={() => navigation.navigate("ProfileEvents", { events: pastEvents, title: "Event History" })}
        >
          <Text style={styles.statNumber}>{eventHistory}</Text>
          <Text style={styles.statLabel}>Event History</Text>
        </Pressable>
      </View>
      <FlatList
        data={events}
        renderItem={({ item }) => (
          <ProfileEventCard
            title={item.title}
            date={item.date}
            time={item.time}
            location={item.location}
            image={item.image}
            status="Registered"
            onPress={() => handleViewCertificate(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.noEvents}>No registered events found.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    padding: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  university: {
    fontSize: 16,
    color: "#666",
  },
  major: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  editButton: {
    width: 150,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noEvents: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});

export default ProfileScreen;