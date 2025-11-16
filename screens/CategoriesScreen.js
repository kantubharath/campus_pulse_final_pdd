import { collection, getDocs, query, where } from 'firebase/firestore'; // Firestore query functions
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../components/Button';
import CategoryCard from '../components/CategoryCard';
import { firestore } from '../firebase/firebaseConfig'; // Import Firestore instance

const CategoriesScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([
    { id: '1', title: 'Academic & Learning', icon: 'school', color: '#FF6F61' },
    { id: '2', title: 'Sports & Fitness', icon: 'sports-basketball', color: '#4DB6AC' },
    { id: '3', title: 'Arts & Culture', icon: 'palette', color: '#FFD54F' },
    { id: '4', title: 'Technology', icon: 'code', color: '#AB47BC' },
    { id: '5', title: 'Career & Development', icon: 'work', color: '#EF5350' },
    { id: '6', title: 'Social & Networking', icon: 'group', color: '#F06292' },
    { id: '7', title: 'Volunteering', icon: 'volunteer-activism', color: '#4DD0E1' },
    { id: '8', title: 'Clubs & Organizations', icon: 'flag', color: '#BA68C8' },
  ]);

  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch the event count for each category from Firestore
  useEffect(() => {
    const fetchEventCounts = async () => {
      try {
        const counts = {};
        for (const category of categories) {
          // Query Firestore to get events for each category
          const eventsQuery = query(collection(firestore, "events"), where("category", "==", category.title));
          const snapshot = await getDocs(eventsQuery);

          // Count the number of documents (events) for each category
          counts[category.id] = snapshot.size; // Event count for this category
        }
        setCategoryCounts(counts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event counts: ', error);
        setLoading(false);
      }
    };

    fetchEventCounts();
  }, [categories, navigation]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Find your interest</Text>
      <TextInput
        style={styles.search}
        placeholder="Search categories..."
        placeholderTextColor="#999"
      />
      <FlatList
        data={categories}
        renderItem={({ item }) => (
          <CategoryCard
            title={item.title}
            events={categoryCounts[item.id] || 0} // Display dynamic event count
            icon={item.icon}
            color={item.color}
            onPress={() => navigation.navigate("MyEvents", { category: item.title })} // Add navigation later
          />
        )}
        keyExtractor={item => item.id}
        numColumns={2}
      />
      <Button title="Browse All Events" onPress={() => navigation.navigate('Home')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  search: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
});

export default CategoriesScreen;