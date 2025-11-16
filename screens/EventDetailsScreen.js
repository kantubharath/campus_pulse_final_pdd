import { MaterialIcons } from '@expo/vector-icons';
import { collection, getDocs, query, where, deleteDoc, doc, writeBatch } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
} from "react-native";
import Button from "../components/Button";
import Header from "../components/Header";
import Loader from "../components/Loader";
import { auth, firestore } from "../firebase/firebaseConfig";

const EventDetailsScreen = ({ route, navigation }) => {
  const { event } = route.params;

  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setRegistered(false);
          setLoading(false);
          return;
        }

        const registrationsRef = collection(firestore, "registrations");
        const q = query(
          registrationsRef,
          where("eventId", "==", event.id),
          where("userId", "==", currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        setRegistered(!querySnapshot.empty);
      } catch (err) {
        console.log("Error in checking registration: ", err);
      } finally {
        setLoading(false);
      }
    };

    const checkCreator = async () => {
      const user = auth.currentUser;
      if (user && event.creator === user.uid) {
        setIsCreator(true);
      }
    };

    checkRegistration();
    checkCreator();
  }, [event.id]);

  const deleteEvent = async () => {
    setLoading(true);
    try {
      const batch = writeBatch(firestore);

      // Delete all payments
      const paymentsRef = collection(firestore, "payments");
      const paymentsQuery = query(paymentsRef, where("eventId", "==", event.id));
      const paymentsSnapshot = await getDocs(paymentsQuery);
      paymentsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      console.log("All payments queued for deletion for eventId:", event.id);

      // Delete all registrations
      const registrationsRef = collection(firestore, "registrations");
      const registrationsQuery = query(registrationsRef, where("eventId", "==", event.id));
      const registrationsSnapshot = await getDocs(registrationsQuery);
      registrationsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      console.log("All registrations queued for deletion for eventId:", event.id);

      // Send cancellation notifications to registered users
      if (!registrationsSnapshot.empty) {
        registrationsSnapshot.docs.forEach((reg) => {
          const notificationRef = doc(collection(firestore, "notifications"));
          batch.set(notificationRef, {
            userId: reg.data().userId,
            title: `Event Cancelled: ${event.title}`,
            description: `The event "${event.title}" has been cancelled. Sorry for the inconvenience!`,
            type: "cancellation",
            timestamp: new Date(),
            read: false,
          });
        });
        console.log(`Queued ${registrationsSnapshot.size} cancellation notifications`);
      }

      // Delete the event
      const eventRef = doc(firestore, "events", event.id); // Assuming events are in "events" collection
      batch.delete(eventRef);
      console.log("Event queued for deletion:", event.id);

      // Commit all changes
      await batch.commit();
      console.log("All deletions and notifications committed");

      // Navigate back after successful deletion
      navigation.goBack();
    } catch (err) {
      console.log("Error in deleting event: ", err);
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <Header title="Event Details" navigation={navigation} />
      <ScrollView>
        <Image source={{ uri: event.image }} style={styles.image} />
        <View style={styles.details}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.subtitle}>Join us for the biggest event of the year</Text>
          <View style={styles.info}>
            <MaterialIcons name="calendar-today" size={16} color="#666" />
            <Text style={styles.infoText}>{event.date}</Text>
          </View>
          <View style={styles.info}>
            <MaterialIcons name="access-time" size={16} color="#666" />
            <Text style={styles.infoText}>{event.time}</Text>
          </View>
          <View style={styles.info}>
            <MaterialIcons name="location-on" size={16} color="#666" />
            <Text style={styles.infoText}>{event.location}</Text>
          </View>
          {registered ? (
            <Button title="Already Registered" />
          ) : (
            <>
              <Button title="Register" onPress={() => navigation.navigate('EventRegistration', { event: event })} />
              <Button title="Add to Calendar" style={styles.calendarButton} />
            </>
          )}

          {isCreator && (
            <View style={styles.creatorActions}>
              <Button
                title="Modify Event"
                colors={["#ff9800", "#ffb300"]}
                onPress={() => navigation.navigate("ModifyEvent", { event })}
              />
              <Button 
                title={"Delete Event"}
                colors={["red", "red"]}
                onPress={() => setModalVisible(true)}
              />
              <Button
                title="View Payments"
                colors={["#2196f3", "#42a5f5"]}
                onPress={() => navigation.navigate("PaymentOverView", { event })}
              />
            </View>
          )}

          <Text style={styles.sectionTitle}>About the Event</Text>
          <Text style={styles.description}>
            {event.description || `This is an event organized by ${event.creator || "Principal"}`}
          </Text>

          {/* Modal for deletion confirmation */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>Are you sure you want to delete the event?</Text>
                <View style={styles.modalButtons}>
                  <Button
                    title="Yes"
                    colors={["#4CAF50", "#66BB6A"]}
                    onPress={deleteEvent}
                  />
                  <Button
                    title="No"
                    colors={["#F44336", "#EF5350"]}
                    onPress={() => setModalVisible(false)}
                  />
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
  },
  details: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginVertical: 10,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  infoText: {
    marginLeft: 10,
    color: '#666',
  },
  calendarButton: {
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
  },
  creatorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    padding: 15,
    gap: 10,
  },
  deleteIcon: {
    marginHorizontal: 10,
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default EventDetailsScreen;