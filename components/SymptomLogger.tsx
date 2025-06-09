"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

export default function SymptomLogger({ onSymptomsChange, initialSymptoms = [] }) {
  const [selectedSymptoms, setSelectedSymptoms] = useState(initialSymptoms)

  const symptoms = [
    { id: "cramps", name: "Cramps", icon: "⚡", color: "#FF6B8A" },
    { id: "headache", name: "Headache", icon: "🤕", color: "#FF9800" },
    { id: "bloating", name: "Bloating", icon: "🎈", color: "#2196F3" },
    { id: "fatigue", name: "Fatigue", icon: "😴", color: "#9C27B0" },
    { id: "mood_swings", name: "Mood Swings", icon: "😅", color: "#4CAF50" },
    { id: "acne", name: "Acne", icon: "🔴", color: "#F44336" },
  ]

  const intensityLevels = ["Mild", "Moderate", "Severe"]

  const toggleSymptom = (symptom) => {
    const isSelected = selectedSymptoms.find((s) => s.id === symptom.id)
    let newSymptoms

    if (isSelected) {
      newSymptoms = selectedSymptoms.filter((s) => s.id !== symptom.id)
    } else {
      newSymptoms = [...selectedSymptoms, { ...symptom, intensity: "Mild" }]
    }

    setSelectedSymptoms(newSymptoms)
    onSymptomsChange && onSymptomsChange(newSymptoms)
  }

  const updateIntensity = (symptomId, intensity) => {
    const newSymptoms = selectedSymptoms.map((s) => (s.id === symptomId ? { ...s, intensity } : s))
    setSelectedSymptoms(newSymptoms)
    onSymptomsChange && onSymptomsChange(newSymptoms)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log Symptoms</Text>

      <View style={styles.symptomsGrid}>
        {symptoms.map((symptom) => {
          const isSelected = selectedSymptoms.find((s) => s.id === symptom.id)

          return (
            <TouchableOpacity
              key={symptom.id}
              style={[styles.symptomCard, isSelected && styles.selectedSymptom]}
              onPress={() => toggleSymptom(symptom)}
            >
              <Text style={styles.symptomIcon}>{symptom.icon}</Text>
              <Text style={styles.symptomName}>{symptom.name}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {selectedSymptoms.length > 0 && (
        <View style={styles.intensitySection}>
          <Text style={styles.intensityTitle}>Intensity</Text>
          {selectedSymptoms.map((symptom) => (
            <View key={symptom.id} style={styles.intensityRow}>
              <Text style={styles.symptomLabel}>{symptom.name}</Text>
              <View style={styles.intensityButtons}>
                {intensityLevels.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.intensityButton, symptom.intensity === level && styles.selectedIntensity]}
                    onPress={() => updateIntensity(symptom.id, level)}
                  >
                    <Text style={[styles.intensityText, symptom.intensity === level && styles.selectedIntensityText]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  symptomCard: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedSymptom: {
    backgroundColor: "#E3F2FD",
    borderColor: "#2196F3",
  },
  symptomIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  symptomName: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  intensitySection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  intensityTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  intensityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  symptomLabel: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  intensityButtons: {
    flexDirection: "row",
    gap: 5,
  },
  intensityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedIntensity: {
    backgroundColor: "#FF6B8A",
    borderColor: "#FF6B8A",
  },
  intensityText: {
    fontSize: 12,
    color: "#666",
  },
  selectedIntensityText: {
    color: "white",
    fontWeight: "bold",
  },
})
