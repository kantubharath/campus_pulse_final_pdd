import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../components/Button';
import EventCard from '../components/EventCard';
import TrendingEventCard from '../components/TrendingEventCard';
import { auth } from '../firebase/firebaseConfig';
import axiosInstance from '../utils/axiosInstance';

const HomeScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [userName, setUserName] = useState('User');
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/events/all");
      setEvents(response.data);
      const trendingEventsResponse = await axiosInstance.get("/events/trending");
      setTrendingEvents(trendingEventsResponse.data);
    } catch (err) {
      console.log("Error in fetching events", err);
    }
  }, []);

  const fetchUsersData = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const res = await axiosInstance.get(`/user/profile/${user.uid}`);
        setUserName(res.data.fullName.split(" ")[0]);
      }
    } catch (err) {
      console.log("Error in fetching user data", err);
    }
  }, []);

  const fetchUnreadNotifications = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const res = await axiosInstance.get(`/notifications/unread/${user.uid}`);
        setUnreadNotifications(res.data.count);
      }
    } catch (err) {
      console.log("Error fetching unread notifications", err);
      setUnreadNotifications(0);
    }
  }, []);

  useEffect(() => {
    fetchUsersData();
    fetchEvents();
    fetchUnreadNotifications();
  }, [fetchUsersData, fetchEvents, fetchUnreadNotifications]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchEvents();
      fetchUnreadNotifications(); // Refresh unread count 
    });

    return unsubscribe;
  }, [navigation, fetchEvents, fetchUnreadNotifications]);

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Notifications Icon and Badge */}
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome back, {userName}! 🎉</Text>
          <TouchableOpacity
            style={styles.notificationContainer}
            onPress={() => navigation.navigate('Notifications')}
          >
            <MaterialIcons name="notifications" size={28} color="#333" />
            {unreadNotifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.date}>{formattedDate}</Text>
        <View style={styles.tabs}>
          <Button title="All Events" style={styles.tabButton} onPress={() => navigation.navigate("AllEvents")} />
          <Button
            title="Registrations"
            style={styles.tabButton}
            onPress={() => navigation.navigate("MyEvents")}
          />
          <Button
            title="Create Event"
            style={styles.tabButton}
            onPress={() => navigation.navigate('CreateEvent')}
          />
        </View>
        <Text style={styles.sectionTitle}>Trending Events</Text>
        <FlatList
          style={styles.flatList}
          data={trendingEvents}
          horizontal
          renderItem={({ item }) => (
            <TrendingEventCard
              title={item.title}
              date={item.date}
              time={item.time}
              location={item.location}
              image={item.image}
              onPress={() => navigation.navigate('EventDetails', { event: item })}
            />
          )}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
        />
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        <FlatList
          style={styles.flatList}
          data={events}
          renderItem={({ item }) => (
            <EventCard
              title={item.title}
              date={item.date}
              time={item.time}
              location={item.location}
              image={item.image}
              status={item.status}
              onPress={() => navigation.navigate('EventDetails', { event: item })}
            />
          )}
          keyExtractor={item => item.id}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    marginTop: 25,
    flex: 1,
    paddingHorizontal: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#F44336',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 5,
    maxHeight: 75,
  },
  tabButtonOutline: {
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 15,
  },
  flatList: {
    marginTop: 5,
    marginBottom: -3,
  },
});

export default HomeScreen;