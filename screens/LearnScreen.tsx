import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Linking } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export default function LearnScreen() {
  const educationTopics = [
    {
      id: 1,
      title: "Menstrual Cycle",
      description: "Learn about the monthly changes that happen in the female reproductive system.",
      icon: "🔄",
      // url: "https://www.example.com/menstrual-cycle", // Placeholder URL
    },
    {
      id: 2,
      title: "PMS",
      description: "Understand the physical and emotional symptoms that occur before your period.",
      icon: "😔",
      // url: "https://www.example.com/pms", // Placeholder URL
    },
    {
      id: 3,
      title: "Ovulation",
      description: "Discover the process of releasing an egg from the ovary.",
      icon: "🥚",
      // url: "https://www.example.com/ovulation", // Placeholder URL
    },
    {
      id: 4,
      title: "Menstrual Hygiene",
      description: "Best practices for maintaining hygiene during your period.",
      icon: "🧼",
      // url: "https://www.example.com/menstrual-hygiene", // Placeholder URL
    },
    {
      id: 5,
      title: "Period Pain",
      description: "Learn about causes and remedies for menstrual cramps and pain.",
      icon: "💊",
      // url: "https://www.example.com/period-pain", // Placeholder URL
    },
  ]

  const handleTopicPress = (topicTitle: string) => {
    // Construct the Wikipedia article URL
    const wikipediaArticleUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(topicTitle.replace(/ /g, '_'))}`;
    Linking.openURL(wikipediaArticleUrl).catch(err => console.error('An error occurred', err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Education</Text>

        <View style={styles.educationSection}>
          <Text style={styles.sectionTitle}>Education</Text>
          <Text style={styles.sectionSubtitle}>Learn about menstrual health</Text>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput style={styles.searchInput} placeholder="Search topics..." placeholderTextColor="#999" />
          </View>

          <View style={styles.topicsContainer}>
            {educationTopics.map((topic) => (
              <TouchableOpacity 
                key={topic.id} 
                style={styles.topicCard}
                onPress={() => handleTopicPress(topic.title)}
              >
                <View style={styles.topicContent}>
                  <Text style={styles.topicIcon}>{topic.icon}</Text>
                  <View style={styles.topicText}>
                    <Text style={styles.topicTitle}>{topic.title}</Text>
                    <Text style={styles.topicDescription}>{topic.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF0F3",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  educationSection: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  topicsContainer: {
    gap: 15,
  },
  topicCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 15,
  },
  topicContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  topicIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  topicText: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  topicDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
})
