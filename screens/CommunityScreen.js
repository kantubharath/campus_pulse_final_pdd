import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Button from "../components/Button";
import DiscussionCard from "../components/DiscussionCard";
import Loader from "../components/Loader";
import { auth, firestore } from "../firebase/firebaseConfig";
import axiosInstance from "../utils/axiosInstance";

const generateRandomId = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const CommunityScreen = ({ navigation }) => {
  const [discussions, setDiscussions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/community/discussions");
      setDiscussions(response.data);
    } catch (err) {
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  };

  const startNewDiscussion = async () => {
    if (!newDiscussionTitle.trim()) {
      Alert.alert("Please enter a discussion title.");
      return;
    }
    setPosting(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert("Please log in to start a discussion.");
        setPosting(false);
        return;
      }
      const ref = doc(firestore, 'users', currentUser.uid);
      const snap = await getDoc(ref);
      const user = snap.data();

      const currentTime = new Date();
      const newDiscussion = {
        event: "General",
        date: currentTime.toDateString(),
        posts: [
          {
            id: generateRandomId(),
            userId: currentUser.uid,
            userName: user.fullName || user.email.split("@")[0],
            userImage: user.collegeId || "https://res.cloudinary.com/demo/image/upload/sample.jpg",
            time: currentTime.toISOString(),
            message: newDiscussionTitle,
            comments: 0,
            likes: 0,
          },
        ],
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(firestore, "community"), newDiscussion);
      fetchDiscussions();
      setNewDiscussionTitle("");
    } catch (err) {
      Alert.alert("Failed to start discussion. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const filteredDiscussions = discussions.filter((discussion) =>
    discussion.posts.some((post) =>
      post.message.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f8fa" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.searchBarContainer}>
          <MaterialIcons name="search" size={22} color="#888" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search discussions..."
            placeholderTextColor="#aaa"
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.discussionInput}
            placeholder="Start a new discussion..."
            placeholderTextColor="#aaa"
            value={newDiscussionTitle}
            onChangeText={setNewDiscussionTitle}
            editable={!posting}
            returnKeyType="done"
            onSubmitEditing={startNewDiscussion}
          />
          <TouchableOpacity
            style={styles.postButton}
            onPress={startNewDiscussion}
            disabled={posting}
            activeOpacity={0.8}
          >
            {posting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <MaterialIcons name="send" size={20} color="#fff" />
                <Text style={styles.postButtonText}>Post</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#4F8EF7" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredDiscussions}
            renderItem={({ item }) => (
              <DiscussionCard
                event={item.event}
                date={item.date}
                posts={item.posts}
                discussionId={item.id}
                refresh={fetchDiscussions}
              />
            )}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialIcons name="forum" size={48} color="#bbb" />
                <Text style={styles.emptyText}>No discussions found.</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingTop: 18,
    paddingBottom: 8,
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    letterSpacing: 1,
  },
  body: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f6f8fa",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 12,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#222",
    paddingVertical: 6,
    backgroundColor: "transparent",
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
  },
  discussionInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    fontSize: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  postButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F8EF7",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
    minWidth: 80,
    justifyContent: "center",
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 6,
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
    textAlign: "center",
  },
});

export default CommunityScreen;
