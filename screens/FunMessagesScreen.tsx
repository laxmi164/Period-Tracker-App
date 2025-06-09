import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const funMessages = [
  "You're strong, beautiful, and capable of anything! 💪💖",
  "Listen to your body, it knows what you need. ✨",
  "Embrace your cycle, it's a part of your unique rhythm. ❤️",
  "Sending you positive vibes today! 😊",
  "Being a woman is your superpower! 💪",
  "Take a moment to breathe and be kind to yourself. 🧘‍♀️",
  "Your intuition is a powerful guide. Trust it. ✨",
];

export default function FunMessagesScreen() {
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // Display a random message when the component mounts
    const randomIndex = Math.floor(Math.random() * funMessages.length);
    setMessage(funMessages[randomIndex]);
  }, []); // Empty dependency array means this runs once on mount

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Daily Inspiration</Text>
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F3', // Light pink background
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  messageContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  messageText: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#555',
  },
}); 