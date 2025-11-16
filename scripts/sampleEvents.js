import { addDoc, collection } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

export const addSampleEvents = async () => {
  const events = [
    {
      title: 'Campus Tech Summit 2024',
      date: 'March 15, 2024',
      time: '2:00 PM - 6:00 PM',
      location: 'Student Center Auditorium',
      image: 'https://res.cloudinary.com/dpfrwxe1r/image/upload/v1743422310/WIN_20250311_12_13_51_Pro_ueu367.jpg', // Replace with your Cloudinary URL
      fee: 199.00,
      trending: true,
    },
    {
      title: 'Campus Music Festival 2024',
      date: 'Tomorrow',
      time: '7:00 PM',
      location: 'Main Auditorium',
      image: 'https://res.cloudinary.com/dpfrwxe1r/image/upload/v1743422310/WIN_20250311_12_13_51_Pro_ueu367.jpg', // Replace with your Cloudinary URL
      fee: 50.00,
      trending: true,
    },
    {
      title: 'Basketball Championship Finals',
      date: 'March 16',
      time: '3:00 PM',
      location: 'Sports Complex',
      image: 'https://res.cloudinary.com/dpfrwxe1r/image/upload/v1743422310/WIN_20250311_12_13_51_Pro_ueu367.jpg', // Replace with your Cloudinary URL
      fee: 10.00,
    },
  ];

  for (const event of events) {
    await addDoc(collection(firestore, 'events'), {
      ...event
    }); 
  }
};