import { MaterialIcons, Feather } from "@expo/vector-icons";
import { addDoc, collection, doc, getDoc, getDocs, writeBatch, updateDoc, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View, SafeAreaView, StatusBar } from "react-native";
import Loader from "../components/Loader";
import { auth, firestore } from "../firebase/firebaseConfig";

const TABS = [
  { key: "pending", label: "Yet to Approve" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const AdminScreen = ({ navigation }) => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [rejectedEvents, setRejectedEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    const checkAdminAndFetchEvents = async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;
        if (!user) {
          setError('You must be logged in as admin to view this page');
          setLoading(false);
          return;
        }

        const userDoc = await getDoc(doc(firestore, 'admins', user.uid));
        if (!userDoc.exists()) {
          setError('You don\'t have permission to this page');
          setLoading(false);
          return;
        }

        // Fetch pending events
        const pendingSnapshot = await getDocs(collection(firestore, 'tentativeEvents'));
        const pendingList = pendingSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPendingEvents(pendingList);

        // Fetch approved events
        const approvedSnapshot = await getDocs(collection(firestore, 'events'));
        const approvedList = approvedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setApprovedEvents(approvedList);

        // Fetch rejected events
        const rejectedSnapshot = await getDocs(collection(firestore, 'rejectedEvents'));
        const rejectedList = rejectedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRejectedEvents(rejectedList);

      } catch (err) {
        setError('Error in fetching events: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetchEvents();
  }, []);

  // Approve event: move from tentativeEvents to events
  const handleApproveEvent = async (event) => {
    try {
      const batch = writeBatch(firestore);
      await addDoc(collection(firestore, 'events'), {
        ...event,
        createdAt: new Date(),
      });

      // Send notification to creator
      const notificationRef = doc(collection(firestore, 'notifications'));
      batch.set(notificationRef, {
        userId: event.creator,
        title: `Event Approved: ${event.title}`,
        description: `Your event "${event.title}" has been approved and is now live!`,
        type: 'approval',
        timestamp: new Date(),
        read: false,
      });

      // Delete from tentativeEvents
      const tentativeEventRef = doc(firestore, 'tentativeEvents', event.id);
      batch.delete(tentativeEventRef);

      await batch.commit();

      setPendingEvents(pendingEvents.filter(e => e.id !== event.id));
      setApprovedEvents([{ ...event, id: event.id }, ...approvedEvents]);
      Alert.alert('Success', 'Event approved successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to approve event: ' + err.message);
    }
  };

  // Reject event: move from tentativeEvents to rejectedEvents
  const handleRejectEvent = async (event) => {
    try {
      const batch = writeBatch(firestore);

      // Add to rejectedEvents
      const rejectedRef = doc(collection(firestore, 'rejectedEvents'));
      batch.set(rejectedRef, {
        ...event,
        rejectedAt: new Date(),
      });

      // Send notification to creator
      const notificationRef = doc(collection(firestore, 'notifications'));
      batch.set(notificationRef, {
        userId: event.creator,
        title: `Event Rejected: ${event.title}`,
        description: `Your event "${event.title}" has been rejected and removed.`,
        type: 'rejection',
        timestamp: new Date(),
        read: false,
      });

      // Delete from tentativeEvents
      const tentativeEventRef = doc(firestore, 'tentativeEvents', event.id);
      batch.delete(tentativeEventRef);

      await batch.commit();

      setPendingEvents(pendingEvents.filter(e => e.id !== event.id));
      setRejectedEvents([{ ...event, id: event.id }, ...rejectedEvents]);
      Alert.alert('Success', 'Event rejected and deleted successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to reject the event: ' + err.message);
    }
  };

  const confirmReject = (event) => {
    Alert.alert(
      'Reject Event',
      `Are you sure you want to reject "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: () => handleRejectEvent(event) },
      ]
    );
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out: ' + error.message);
    }
  };

  const confirmSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: handleSignOut },
      ]
    );
  };

  // Render event card for all tabs
  const renderEventItem = ({ item }) => (
    <View style={styles.card}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.cardImage} />
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Feather name="calendar" size={14} color="#555" />
            <Text style={styles.chipText}>{item.date}</Text>
          </View>
          <View style={styles.chip}>
            <Feather name="clock" size={14} color="#555" />
            <Text style={styles.chipText}>{item.time}</Text>
          </View>
          <View style={styles.chip}>
            <Feather name="map-pin" size={14} color="#555" />
            <Text style={styles.chipText}>{item.location}</Text>
          </View>
        </View>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <Text style={styles.cardDesc} numberOfLines={3}>{item.description}</Text>
        {item.paymentScannerImage && (
          <Image source={{ uri: item.paymentScannerImage }} style={styles.scannerImage} />
        )}
        {activeTab === "pending" && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={() => handleApproveEvent(item)}
              accessibilityLabel="Approve event"
            >
              <Feather name="check-circle" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => confirmReject(item)}
              accessibilityLabel="Reject event"
            >
              <Feather name="x-circle" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  let dataToShow = [];
  if (activeTab === "pending") dataToShow = pendingEvents;
  if (activeTab === "approved") dataToShow = approvedEvents;
  if (activeTab === "rejected") dataToShow = rejectedEvents;

  if (loading) return <Loader />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f8fa" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <MaterialIcons name="arrow-back" size={26} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Events</Text>
        <TouchableOpacity onPress={confirmSignOut} style={styles.headerIcon}>
          <Feather name="log-out" size={22} color="#F44336" />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabItem,
              activeTab === tab.key && styles.tabItemActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[
              styles.tabLabel,
              activeTab === tab.key && styles.tabLabelActive,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.body}>
        {dataToShow.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={48} color="#bbb" />
            <Text style={styles.emptyText}>
              {activeTab === "pending" && "No events to review"}
              {activeTab === "approved" && "No approved events"}
              {activeTab === "rejected" && "No rejected events"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={dataToShow}
            renderItem={renderEventItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    justifyContent: "space-between",
    elevation: 2,
  },
  headerIcon: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    flex: 1,
    textAlign: "center",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#f1f3f6",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
    overflow: "hidden",
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  tabItemActive: {
    backgroundColor: "#fff",
    borderBottomWidth: 3,
    borderBottomColor: "#4F8EF7",
  },
  tabLabel: {
    fontSize: 15,
    color: "#888",
    fontWeight: "600",
  },
  tabLabelActive: {
    color: "#4F8EF7",
    fontWeight: "700",
  },
  error: {
    color: "#F44336",
    textAlign: "center",
    marginVertical: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  listContent: {
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#eee",
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: "row",
    marginBottom: 8,
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f3f6",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
    marginBottom: 4,
  },
  chipText: {
    fontSize: 13,
    color: "#555",
    marginLeft: 4,
  },
  cardCategory: {
    fontSize: 13,
    color: "#4F8EF7",
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 15,
    color: "#444",
    marginBottom: 8,
  },
  scannerImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginTop: 8,
    alignSelf: "center",
    backgroundColor: "#f1f3f6",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 14,
    gap: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 0,
    gap: 6,
  },
  approveBtn: {
    backgroundColor: "#4CAF50",
  },
  rejectBtn: {
    backgroundColor: "#F44336",
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  emptyText: {
    color: "#888",
    fontSize: 18,
    marginTop: 12,
    fontWeight: "500",
  },
});

export default AdminScreen;