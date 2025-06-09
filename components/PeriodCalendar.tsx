import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { formatDate, getDaysInMonth } from "../utils/dateHelpers"

interface PeriodEntry {
  date: string
  isPeriod: boolean
  symptoms?: Array<{ name: string; intensity: string; color?: string }>
}

interface PeriodCalendarProps {
  currentDate: Date
  periodData: PeriodEntry[]
  onDatePress?: (date: string) => void
  selectedDate?: string | null
}

export default function PeriodCalendar({
  currentDate,
  periodData,
  onDatePress,
  selectedDate,
}: PeriodCalendarProps): JSX.Element {
  const renderCalendar = (): JSX.Element[] => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = new Date(year, month, 1).getDay()

    const days: JSX.Element[] = []
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    // Add day headers
    dayNames.forEach((day) => {
      days.push(
        <Text key={day} style={styles.dayHeader}>
          {day}
        </Text>,
      )
    })

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />)
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(new Date(year, month, day))
      const isPeriodDay = periodData.some((entry) => entry.date === dateStr && entry.isPeriod)

      days.push(
        <TouchableOpacity
          key={day}
          style={[styles.dayCell, isPeriodDay && styles.periodDay, selectedDate === dateStr && styles.selectedDay]}
          onPress={() => onDatePress && onDatePress(dateStr)}
        >
          <Text style={[styles.dayText, isPeriodDay && styles.periodDayText]}>{day}</Text>
        </TouchableOpacity>,
      )
    }

    return days
  }

  return <View style={styles.calendar}>{renderCalendar()}</View>
}

const styles = StyleSheet.create({
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayHeader: {
    width: "14.28%",
    textAlign: "center",
    fontWeight: "bold",
    paddingVertical: 10,
    color: "#666",
  },
  dayCell: {
    width: "14.28%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 2,
  },
  dayText: {
    fontSize: 16,
  },
  periodDay: {
    backgroundColor: "#FF6B8A",
    borderRadius: 20,
  },
  periodDayText: {
    color: "white",
    fontWeight: "bold",
  },
  selectedDay: {
    borderWidth: 2,
    borderColor: "#FF6B8A",
    borderRadius: 20,
  },
})
