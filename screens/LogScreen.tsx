"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { storeData, getStoredData, removeStoredData } from "../utils/storage"
import { formatDate } from "../utils/dateHelpers"
import { useRoute, RouteProp } from '@react-navigation/native';
import { BottomTabParamList } from '../navigation/AppNavigator';

// Define the type for the navigation prop specific to this screen's navigator
type LogScreenRouteProp = RouteProp<BottomTabParamList, 'Log'>;

// Define the types for log data structures
interface Mood {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Symptom {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Activity {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface LogEntry {
  date: string;
  mood: Mood | null;
  symptoms: Symptom[];
  activities: Activity[];
  isPeriod: boolean;
  timestamp: string;
}

export default function LogScreen() {
  // Use route params to get the selected date, default to today if not provided
  const route = useRoute<LogScreenRouteProp>();
  const selectedDateParam = route.params?.date;
  const initialDate = selectedDateParam ? new Date(selectedDateParam + 'T00:00:00') : new Date();

  const selectedDateStr = initialDate.toLocaleDateString('en-CA'); // Use local date string in YYYY-MM-DD format

  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [isPeriodDay, setIsPeriodDay] = useState(false); // This might be redundant if period is only marked on calendar

  const moods: Mood[] = [
    { id: "neutral", name: "Neutral", icon: "😐", color: "#FF6B8A" },
    { id: "happy", name: "Happy", icon: "😊", color: "#FF6B8A" },
    { id: "sad", name: "Sad", icon: "😢", color: "#FF6B8A" },
    { id: "sensitive", name: "Sensitive", icon: "😔", color: "#FF6B8A" },
  ]

  const symptoms: Symptom[] = [
    { id: "allgood", name: "All Good", icon: "😊", color: "#9C27B0" },
    { id: "cramps", name: "Cramps", icon: "⚡", color: "#9C27B0" },
    { id: "headache", name: "Headache", icon: "🌡️", color: "#9C27B0" },
    { id: "acne", name: "Acne", icon: "👤", color: "#9C27B0" },
  ]

  const activities: Activity[] = [
    { id: "none", name: "None", icon: "🚫", color: "#FF6B8A" },
    { id: "walking", name: "Walking", icon: "📈", color: "#FF6B8A" },
    { id: "running", name: "Running", icon: "📈", color: "#FF6B8A" },
    { id: "cycling", name: "Cycling", icon: "📈", color: "#FF6B8A" },
  ]

  useEffect(() => {
    loadDayData(selectedDateStr);
  }, [selectedDateStr]); // Load data when the selected date changes

  const loadDayData = async (date: string) => {
    try {
      // Load data for the specified date using the log key format
      const logKey = `log-${date}`;
      const dayData = await getStoredData<LogEntry>(logKey);

      if (dayData) {
        setSelectedMood(dayData.mood);
        setSelectedSymptoms(dayData.symptoms || []);
        setSelectedActivities(dayData.activities || []);
        setIsPeriodDay(dayData.isPeriod || false); // This might be redundant
      } else {
        // Clear selections if no data for this date
        setSelectedMood(null);
        setSelectedSymptoms([]);
        setSelectedActivities([]);
        setIsPeriodDay(false);
      }
    } catch (error) {
      console.error("Error loading day data:", error);
    }
  };

  const toggleSelection = (item: Symptom | Activity, selectedItems: (Symptom | Activity)[], setSelectedItems: React.Dispatch<React.SetStateAction<(Symptom | Activity)[]>>) => {
    const isSelected = selectedItems.some((selected) => selected.id === item.id);
    if (isSelected) {
      setSelectedItems(selectedItems.filter((selected) => selected.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const saveData = async () => {
    try {
      // Save data for the specified date using the log key format
      const logKey = `log-${selectedDateStr}`;
      const newEntry: LogEntry = {
        date: selectedDateStr,
        mood: selectedMood,
        symptoms: selectedSymptoms,
        activities: selectedActivities,
        isPeriod: isPeriodDay, // This might be redundant
        timestamp: new Date().toISOString(), // Use ISO string for precise timestamp
      };

      await storeData(logKey, newEntry);
      Alert.alert("Success", "Data saved successfully for " + selectedDateStr + "!");
    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert("Error", "Failed to save data.");
    }
  };

  const renderOptionGrid = (options: (Mood | Symptom | Activity)[], selectedItems: (Mood | Symptom | Activity)[] | Mood | null, onToggle: any, title: string) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionsGrid}>
        {options.map((option) => {
          const isSelected =
            title === "Moods" ? (selectedMood as Mood)?.id === option.id : (selectedItems as (Symptom | Activity)[]).some((item) => item.id === option.id);

          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, isSelected && styles.selectedOption]}
              onPress={() => {
                if (title === "Moods") {
                  setSelectedMood(isSelected ? null : option as Mood);
                } else {
                  onToggle(option, selectedItems, title === "Symptoms" ? setSelectedSymptoms : setSelectedActivities);
                }
              }}
            >
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <Text style={styles.optionText}>{option.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Log for {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString("en-US", { month: "long", day: 'numeric', year: 'numeric' })}</Text>
          {/* Add a close button or similar if needed for navigation back */}
          {/* <TouchableOpacity style={styles.closeButton}>\n            <Ionicons name=\"close\" size={24} color=\"#FF6B8A\" />\n          </TouchableOpacity> */}
        </View>

        {/* Cycle text might be removed or updated based on how cycle day is calculated and displayed */}
        {/* <View style={styles.dateSection}>\n          <Text style={styles.monthText}>{initialDate.toLocaleDateString(\"en-US\", { month: \"long\", day: 'numeric', year: 'numeric' })}</Text>\n          <Text style={styles.cycleText}>Cycle Day --</Text>\n        </View> */}

        {renderOptionGrid(moods, selectedMood, null, "Moods")}
        {renderOptionGrid(symptoms, selectedSymptoms, toggleSelection, "Symptoms")}
        {renderOptionGrid(activities, selectedActivities, toggleSelection, "Physical Activity")}

        <TouchableOpacity style={styles.saveButton} onPress={saveData}>
          <Text style={styles.saveButtonText}>Save Log</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 5,
  },
  dateSection: {
    marginBottom: 30,
  },
  monthText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
  },
  cycleText: {
    fontSize: 18,
    color: "#FF6B8A",
    fontWeight: "500",
  },
  section: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionCard: {
    width: "22%",
    aspectRatio: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedOption: {
    backgroundColor: "#E3F2FD",
    borderColor: "#2196F3",
  },
  optionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  optionText: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#FF6B8A",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
