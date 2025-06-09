import { View, Text, StyleSheet } from "react-native"

export default function CycleTracker({ cycleData }) {
  const { currentDay, cycleLength, daysUntilPeriod } = cycleData

  const getPhase = () => {
    if (currentDay <= 5) return "Menstrual"
    if (currentDay <= 13) return "Follicular"
    if (currentDay <= 15) return "Ovulation"
    return "Luteal"
  }

  const getPhaseColor = () => {
    const phase = getPhase()
    switch (phase) {
      case "Menstrual":
        return "#FF6B8A"
      case "Follicular":
        return "#4CAF50"
      case "Ovulation":
        return "#FF9800"
      case "Luteal":
        return "#9C27B0"
      default:
        return "#666"
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.cycleInfo}>
        <Text style={styles.title}>Cycle Tracker</Text>
        <Text style={styles.currentDay}>Day {currentDay}</Text>
        <Text style={[styles.phase, { color: getPhaseColor() }]}>{getPhase()} Phase</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progress,
              {
                width: `${(currentDay / cycleLength) * 100}%`,
                backgroundColor: getPhaseColor(),
              },
            ]}
          />
        </View>
        <Text style={styles.daysUntil}>
          {daysUntilPeriod > 0 ? `${daysUntilPeriod} days until period` : "Period expected"}
        </Text>
      </View>
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
  cycleInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  currentDay: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  phase: {
    fontSize: 16,
    fontWeight: "500",
  },
  progressContainer: {
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 10,
  },
  progress: {
    height: "100%",
    borderRadius: 4,
  },
  daysUntil: {
    fontSize: 14,
    color: "#666",
  },
})
