import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { 
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { categories } from '../static/categories';

const AllEventsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Latest");
  const [locationFilter, setLocationFilter] = useState("All Campus");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/events/all");
        setEvents(response.data);
      } catch (err) {
        console.log("Error in fetching all events", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => event.title.toLowerCase().includes(searchQuery.toLowerCase()) && (categoryFilter === "All" || event.category === categoryFilter));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Campus Pulse</Text>
      </View>
      <ScrollView style={styles.categoryScroll}>
        <View style={styles.categoryContainer}>
          {categories.map((category) => (
            <TouchableOpacity 
              key={category.id}
              style={[styles.categoryCard, categoryFilter === category.title && styles.activeCategoryCard]}
              onPress={() => setCategoryFilter(category.title)}
            >
              <MaterialIcons name={category.icon} size={24} color={categoryFilter === category.title ? "#fff" : category.color} />
              <Text style={[styles.categoryTitle, categoryFilter === category.title && styles.activeCategoryTitle]}>
                {category.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder='Search events by name or category...' value={searchQuery} onChangeText={setSearchQuery} />
      </View>
      <View style={styles.filterContainer}>
        <View style={styles.filterButtons}>
          {['All', 'Academic', 'Sports', 'Arts', 'Social'].map((category) => (
            <TouchableOpacity key={category} style={[styles.filterButton, categoryFilter === category && styles.activeFilterButton]} onPress={() => setCategoryFilter(category)}>
              <Text style={[styles.filterButtonText, categoryFilter === category && styles.activeFilterButtonText]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.sortLocationContainer}>
          <TouchableOpacity style={styles.sortButton} onPress={() => setSortOption(sortOption === "Latest" ? "Oldest" : "Latest")}>
            <Text style={styles.sortText}>Sort by: {sortOption}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.locationButton} onPress={() => setLocationFilter(locationFilter === "All Campus" ? "Main Campus" : "All Campus")}>
            <Text style={styles.locationText}>Location: {locationFilter}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.eventsList}>
        {loading ? (
          <Text style={styles.noEventsText}>Loading events...</Text>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <Image source={{ uri: event.image }} style={styles.eventImage} />
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventDetails}>
                  <MaterialIcons name='calendar-today' size={16} color={"#666"} />
                  <Text style={styles.eventDetailText}>{event.date}</Text>
                </View>
                <View style={styles.eventDetails}>
                  <MaterialIcons name='location-on' size={16} color={"#666"} />
                  <Text style={styles.eventDetailText}>{event.location}</Text>
                </View>
                <TouchableOpacity style={styles.viewDetailsButton} onPress={() => navigation.navigate("EventDetails", { event: { ...event, id: event.id }})}>
                  <Text style={styles.viewDetailsText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noEventsText}>No events found</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  categoryScroll: {
    maxHeight: 200, // Limit the height of the category scroll
  },
  categoryContainer: {
    padding: 10,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activeCategoryCard: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  categoryTitle: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  activeCategoryTitle: {
    color: "#fff",
  },
  searchContainer: {
    padding: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  filterContainer: {
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  activeFilterButton: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666",
  },
  activeFilterButtonText: {
    color: "#fff",
  },
  sortLocationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sortButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  locationButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  sortText: {
    fontSize: 14,
    color: "#666",
  },
  locationText: {
    fontSize: 14,
    color: "#666",
  },
  eventsList: {
    flex: 1,
    padding: 10,
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  eventInfo: {
    padding: 15,
  },
  eventTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    color: "#fff",
    fontSize: 12,
    marginRight: 5,
    marginBottom: 5,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  eventDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  eventDetailText: {
    marginLeft: 5,
    color: "#666",
    fontSize: 14,
  },
  viewDetailsButton: {
    backgroundColor: "#9C27B0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  viewDetailsText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  noEventsText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    padding: 20,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#666",
  },
});

export default AllEventsScreen;