// screens/NotificationsScreen.js
import { collection, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Text, SafeAreaView, StatusBar, RefreshControl } from 'react-native';
import Button from '../components/Button';
import Header from '../components/Header';
import Loader from '../components/Loader';
import NotificationCard from '../components/NotificationCard';
import { auth, firestore } from '../firebase/firebaseConfig';
import { MaterialIcons } from "@expo/vector-icons";

const NotificationsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Unknown time";
    const now = new Date();
    const notificationDate = timestamp.toDate();
    const diffSeconds = Math.floor((now - notificationDate) / 1000);
    const minutes = Math.floor(diffSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 1) return `${days} days ago`;
    if (days === 1) return "Yesterday";
    if (hours >= 1) return `${hours} hours ago`;
    if (minutes >= 1) return `${minutes} minutes ago`;
    return "Just now";
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setNotifications([]);
        return;
      }
      const notificationsQuery = query(collection(firestore, 'notifications'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(notificationsQuery);
      const notificationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        time: formatTimeAgo(doc.data().timestamp),
      }));
      setNotifications(notificationsData);
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const user = auth.currentUser;
      if (!user || notifications.length === 0) return;
      const batch = writeBatch(firestore);
      notifications.forEach((notification) => {
        if (!notification.read) {
          const notificationRef = doc(firestore, 'notifications', notification.id);
          batch.update(notificationRef, { read: true });
        }
      });
      await batch.commit();
      fetchNotifications();
    } catch (err) {}
  };

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      fetchNotifications();
    });
    const unsubscribeBlur = navigation.addListener('blur', () => {
      markAllAsRead();
    });
    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation, notifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  if (loading) return <Loader />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f8fa" />
      <Header title="Notifications" navigation={navigation} />
      <View style={styles.headerRow}>
        <MaterialIcons name="notifications-active" size={28} color="#4F8EF7" />
        <Text style={styles.headerTitle}>Your Notifications</Text>
      </View>
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationCard
            title={item.title}
            description={item.description}
            time={item.time}
            type={item.type}
            read={item.read}
          />
        )}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="notifications-off" size={48} color="#bbb" />
            <Text style={styles.noNotifications}>No notifications available</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.footer}>
        <Button
          title="Mark All as Read"
          onPress={markAllAsRead}
          style={styles.markAllBtn}
          disabled={notifications.length === 0}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f8fa",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: "#f6f8fa",
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    letterSpacing: 0.2,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  noNotifications: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: "500",
  },
  footer: {
    padding: 18,
    backgroundColor: "#f6f8fa",
  },
  markAllBtn: {
    borderRadius: 12,
  },
});

export default NotificationsScreen;