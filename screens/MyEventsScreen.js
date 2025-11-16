import React, { useState, useEffect } from "react";
import { Text, View, FlatList, StyleSheet, SafeAreaView, StatusBar, RefreshControl } from "react-native";
import { auth, firestore } from "../firebase/firebaseConfig";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import Header from "../components/Header";
import EventCard from "../components/EventCard";
import Loader from '../components/Loader';
import { MaterialIcons } from "@expo/vector-icons";

const MyEventsScreen = ({ route, navigation }) => {
  const { category } = route.params || {};
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [screenTitle, setScreenTitle] = useState("My Events");
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user && !category) {
        setEvents([]);
        return;
      }

      let eventDocs;
      if (category) {
        const categoryQuery = query(
          collection(firestore, "events"),
          where("category", "==", category)
        );
        const snapshot = await getDocs(categoryQuery);
        eventDocs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setScreenTitle(`Events in ${category}`);
      } else {
        const registrationsQuery = query(
          collection(firestore, "registrations"),
          where("userId", "==", user.uid)
        );
        const registrationsSnapshot = await getDocs(registrationsQuery);
        const registeredEventIds = registrationsSnapshot.docs.map(
          (doc) => doc.data().eventId
        );

        if (registeredEventIds.length === 0) {
          setEvents([]);
          return;
        }

        const eventsQuery = query(collection(firestore, "events"));
        const eventsSnapshot = await getDocs(eventsQuery);
        const allEvents = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        eventDocs = allEvents.filter((event) =>
          registeredEventIds.includes(event.id)
        );
        setScreenTitle("My Events");
      }

      setEvents(eventDocs);

      // Reminder logic (unchanged)
      if (!category) {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const endOfTomorrow = new Date(tomorrow);
        endOfTomorrow.setDate(tomorrow.getDate() + 1);

        for (const event of eventDocs) {
          const [startTimeStr] = event.time.split(" - ");
          const eventDateTime = new Date(`${event.date} ${startTimeStr}`);
          if (
            eventDateTime >= tomorrow &&
            eventDateTime < endOfTomorrow &&
            !event.reminderSent
          ) {
            await addDoc(collection(firestore, "notifications"), {
              userId: user.uid,
              title: `Reminder: ${event.title}`,
              description: `Your event "${event.title}" is happening tomorrow at ${event.time}!`,
              type: "reminder",
              timestamp: new Date(),
              read: false,
            });
          }
        }
      }
    } catch (err) {
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [category]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f8fa" />
      <Header title={screenTitle} navigation={navigation} />
      <View style={styles.container}>
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="event-busy" size={48} color="#bbb" />
            <Text style={styles.noEvents}>
              {category
                ? `No events available in ${category}.`
                : "You haven't registered for any events yet."}
            </Text>
          </View>
        ) : (
          <FlatList
            data={events}
            renderItem={({ item }) => (
              <EventCard
                title={item.title}
                date={item.date}
                time={item.time}
                location={item.location}
                image={item.image}
                status={category ? undefined : "Registered"}
                onPress={() => navigation.navigate("EventDetails", { event: item })}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<View style={{ height: 10 }} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f8fa",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  noEvents: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
});

export default MyEventsScreen;