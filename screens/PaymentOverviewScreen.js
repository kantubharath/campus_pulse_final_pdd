import { collection, getDocs, query, updateDoc, where, doc as firestoreDoc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, Dimensions, FlatList, SafeAreaView, StatusBar, RefreshControl } from "react-native";
import Header from "../components/Header";
import Loader from "../components/Loader";
import { auth, firestore } from "../firebase/firebaseConfig";
import { PieChart } from "react-native-chart-kit";
import { MaterialIcons } from "@expo/vector-icons";

const PaymentOverviewScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const paymentsRef = collection(firestore, 'payments');
      const q = query(paymentsRef, where("eventId", "==", event.id));
      const querySnapshot = await getDocs(q);

      const paymentsData = await Promise.all(querySnapshot.docs.map(async (paymentDoc) => {
        const payment = paymentDoc.data();
        const userRef = firestoreDoc(firestore, 'users', payment.userId);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};
        return {
          ...payment,
          id: paymentDoc.id,
          status: payment.status,
          amount: event.fee || 0,
          profileImage: userData.collegeId || "https://via.placeholder.com/40",
          email: userData.email || "",
          fullName: userData.fullName || "",
        };
      }));
      setPayments(paymentsData);
    } catch (err) {
      setPayments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [event.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const filteredPayments = payments.filter((payment) => {
    if (selectedStatusFilter === "All") return true;
    return payment.status.toLowerCase() === selectedStatusFilter.toLowerCase();
  });

  const handleStatusChange = async (paymentId, currentStatus) => {
    const newStatus = currentStatus.toLowerCase() === 'pending' ? 'paid' : 'pending';
    try {
      const paymentsRef = collection(firestore, 'payments');
      const paymentDocRef = firestoreDoc(paymentsRef, paymentId);
      await updateDoc(paymentDocRef, { status: newStatus });
      fetchPayments();
    } catch (err) {}
  };

  const calculatePaymentStats = () => {
    const total = payments.length;
    if (total === 0) return { paid: 0, pending: 0 };
    const paid = payments.filter(p => p.status.toLowerCase() === 'paid').length;
    const pending = payments.filter(p => p.status.toLowerCase() === 'pending').length;
    return {
      paid: Math.round((paid / total) * 100),
      pending: Math.round((pending / total) * 100),
    };
  };

  const stats = calculatePaymentStats();
  const chartData = [
    { name: 'Paid', population: stats.paid, color: '#2196F3', legendFontColor: '#1E1E1E', legendFontSize: 14 },
    { name: 'Pending', population: stats.pending, color: '#FFCA28', legendFontColor: '#1E1E1E', legendFontSize: 14 },
  ];

  const screenWidth = Dimensions.get('window').width - 40;

  if (loading) return <Loader />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f8fa" />
      <Header title="Payment Overview" navigation={navigation} />
      <FlatList
        data={filteredPayments}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            <View style={styles.overview}>
              <Text style={styles.overviewText}>Payment Overview</Text>
              <PieChart
                data={chartData}
                width={screenWidth}
                height={200}
                chartConfig={{
                  backgroundColor: '#FFFFFF',
                  backgroundGradientFrom: '#FFFFFF',
                  backgroundGradientTo: '#FFFFFF',
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
              <View style={styles.legend}>
                <Text style={[styles.legendItem, { color: '#2196F3' }]}>■ Paid {stats.paid}%</Text>
                <Text style={[styles.legendItem, { color: '#FFCA28' }]}>■ Pending {stats.pending}%</Text>
              </View>
            </View>
            <View style={styles.filterContainer}>
              <TouchableOpacity
                onPress={() => setSelectedStatusFilter("All")}
                style={[styles.filterButton, selectedStatusFilter === "All" && styles.activeFilter]}
              >
                <Text style={[styles.filterButtonText, selectedStatusFilter === "All" && styles.activeFilterText]}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedStatusFilter("Paid")}
                style={[styles.filterButton, selectedStatusFilter === "Paid" && styles.activeFilter]}
              >
                <Text style={[styles.filterButtonText, selectedStatusFilter === "Paid" && styles.activeFilterText]}>Paid</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedStatusFilter("Pending")}
                style={[styles.filterButton, selectedStatusFilter === "Pending" && styles.activeFilter]}
              >
                <Text style={[styles.filterButtonText, selectedStatusFilter === "Pending" && styles.activeFilterText]}>Pending</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionTitle}>Recent Payments</Text>
          </>
        }
        renderItem={({ item: payment }) => (
          <View style={styles.registrationItem}>
            <Image source={{ uri: payment.profileImage }} style={styles.avatar} />
            <View style={styles.registrationDetails}>
              <Text style={styles.name}>{payment.fullName}</Text>
              <Text style={styles.email}>{payment.email}</Text>
            </View>
            <View style={styles.statusContainer}>
              <Text style={[
                styles.status,
                { color: payment.status === "paid" ? "#4CAF50" : payment.status === "pending" ? "#FFCA28" : "#F44336" }
              ]}>
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </Text>
              <Text style={styles.amount}>₹{payment.amount}</Text>
              <TouchableOpacity onPress={() => handleStatusChange(payment.id, payment.status)}>
                <Text style={styles.changeStatus}>Change Status</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="payments" size={48} color="#bbb" />
            <Text style={styles.noPayments}>No payments found for this event.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f8fa',
  },
  overview: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    borderRadius: 12,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  overviewText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E1E1E',
    marginBottom: 10,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  legendItem: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    borderRadius: 12,
    marginHorizontal: 10,
    marginBottom: 10,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#B0BEC5',
    backgroundColor: '#F5F5F5',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilter: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E1E',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E1E1E',
    paddingHorizontal: 20,
    marginVertical: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  registrationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: "#eee",
  },
  registrationDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    color: '#1E1E1E',
    fontWeight: '600',
  },
  email: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 90,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    textAlign: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  changeStatus: {
    fontSize: 14,
    color: '#2196F3',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  noPayments: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: "500",
  },
});

export default PaymentOverviewScreen;