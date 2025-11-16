import { FlatList, StyleSheet, View, Text, SafeAreaView, StatusBar } from "react-native";
import Header from "../components/Header";
import EventCard from "../components/EventCard";
import { MaterialIcons } from "@expo/vector-icons";

const ProfileEventsScreen = ({ route, navigation }) => {
  const { events, title } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f8fa" />
      <Header title={title} navigation={navigation} />
      <View style={styles.container}>
        {(!events || events.length === 0) ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="event-busy" size={48} color="#bbb" />
            <Text style={styles.emptyText}>
              {title === "Registered Events"
                ? "You haven't registered for any events yet."
                : "No participated events found."}
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
                status={title === "Registered Events" ? "Registered" : "Participated"}
                onPress={() => navigation.navigate("EventDetails", { event: item })}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    fontWeight: "500",
  },
});

export default ProfileEventsScreen;