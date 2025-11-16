// components/DiscussionCard.js
import { Image, StyleSheet, Text, View, TouchableOpacity, Alert, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase/firebaseConfig';

const DiscussionCard = ({ event, date, posts, discussionId, refresh }) => {
  const [replyToPostId, setReplyToPostId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const currentUserId = auth.currentUser?.uid;
  const currentUserName = auth.currentUser?.displayName || auth.currentUser?.email.split("@")[0];

  const handleDeletePost = async (postId) => {
    try {
      const discussionRef = doc(firestore, "community", discussionId);
      const discussionSnap = await getDoc(discussionRef);
      if (!discussionSnap.exists()) return;

      const updatedPosts = discussionSnap.data().posts.filter(post => post.id !== postId);
      await updateDoc(discussionRef, { posts: updatedPosts });
      refresh();
    } catch (err) {
      console.log("Error deleting post:", err);
    }
  };

  const handleReply = async (postId) => {
    if (!replyText.trim()) return;
    try {
      const discussionRef = doc(firestore, "community", discussionId);
      const discussionSnap = await getDoc(discussionRef);
      if (!discussionSnap.exists()) return;

      const posts = discussionSnap.data().posts;
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            replies: [...(post.replies || []), {
              message: replyText,
              userId: currentUserId,
              userName: currentUserName,
              time: new Date().toISOString()
            }]
          };
        }
        return post;
      });

      await updateDoc(discussionRef, { posts: updatedPosts });
      setReplyToPostId(null);
      setReplyText("");
      refresh();
    } catch (err) {
      console.log("Error replying to post:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.event}>{event}</Text>
      <Text style={styles.date}>{date}</Text>
      {posts.map(post => (
        <View key={post.id} style={styles.post}>
          <TouchableOpacity
            onLongPress={() => {
              if (post.userId === currentUserId) {
                Alert.alert(
                  "Post Options",
                  "Choose an action",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => handleDeletePost(post.id),
                    },
                    {
                      text: "Reply",
                      onPress: () => {
                        setReplyToPostId(post.id);
                        setReplyText("");
                      },
                    },
                  ],
                  { cancelable: true }
                );
              } else {
                Alert.alert("You can only reply to this post.", "", [
                  {
                    text: "Reply",
                    onPress: () => {
                      setReplyToPostId(post.id);
                      setReplyText("");
                    },
                  },
                  { text: "Cancel", style: "cancel" },
                ]);
              }
            }}>
            <View style={styles.postHeader}>
              <Image source={{ uri: post.userImage }} style={styles.userImage} />
              <Text style={styles.userName}>{post.userName}</Text>
              <Text style={styles.time}>{new Date(post.time).toLocaleString()}</Text>
            </View>
            <Text style={styles.message}>{post.message}</Text>
          </TouchableOpacity>

          {post.replies && post.replies.map((reply, index) => (
            <View key={index} style={styles.replyBox}>
              <Text style={styles.replyText}>↳ <Text style={{ fontWeight: 'bold' }}>{reply.userName || "Anonymous"}:</Text> {reply.message}</Text>
            </View>
          ))}

          {replyToPostId === post.id && (
            <View style={styles.replyInputWrapper}>
              <TextInput
                style={styles.replyInput}
                placeholder="Write a reply..."
                value={replyText}
                onChangeText={setReplyText}
              />
              <TouchableOpacity onPress={() => handleReply(post.id)}>
                <Text style={styles.replySend}>Send</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  event: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  post: {
    marginVertical: 10,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  message: {
    fontSize: 14,
    color: '#333',
    marginVertical: 5,
  },
  replyBox: {
    marginLeft: 40,
    marginTop: 5,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
  },
  replyText: {
    color: '#333',
    fontSize: 13,
  },
  replyInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 40,
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  replySend: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
});

export default DiscussionCard;
