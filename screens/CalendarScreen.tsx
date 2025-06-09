"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from "react-native"
import { getStoredData } from "../utils/storage"
import { formatDate, getDaysInMonth, addDays, getDaysBetween } from "../utils/dateHelpers"
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { BottomTabParamList } from '../navigation/AppNavigator';
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Calendar, DateData } from 'react-native-calendars';

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

// Define the type for the navigation prop specific to this screen's navigator
type CalendarScreenNavigationProp = NavigationProp<BottomTabParamList, 'Calendar'>;

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loggedDates, setLoggedDates] = useState<string[]>([]);
  const [periodDates, setPeriodDates] = useState<string[]>([]);
  const [periodRanges, setPeriodRanges] = useState<{ start: string, end: string }[]>([]);
  const [selectedLogEntry, setSelectedLogEntry] = useState<LogEntry | null>(null);
  const [markedDates, setMarkedDates] = useState({});
  const [averageCycleLength, setAverageCycleLength] = useState<number | null>(null);
  const [nextPeriodDate, setNextPeriodDate] = useState<string | null>(null);
  const [fertileWindow, setFertileWindow] = useState<{ start: string | null, end: string | null }>({ start: null, end: null });
  const [selectedPeriodLength, setSelectedPeriodLength] = useState<number | null>(null);
  const navigation = useNavigation<CalendarScreenNavigationProp>();

  // Use useFocusEffect to load data whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadCalendarData();
    }, [])
  );

  useEffect(() => {
    // Fetch and display the log entry and period length when selectedDate changes
    const fetchSelectedDayInfo = async () => {
      if (selectedDate) {
        const logKey = `log-${selectedDate}`;
        const logEntry = await getStoredData<LogEntry>(logKey);
        setSelectedLogEntry(logEntry);

        // Calculate period length for the selected date if it's a period day
        if (periodDates.includes(selectedDate)) {
          const date = new Date(selectedDate + 'T00:00:00');

          // Find the start date of the current period
          let periodStart = new Date(date);
          while (periodDates.includes(formatDate(addDays(periodStart, -1)))) {
            periodStart = addDays(periodStart, -1);
          }

          // Find the end date of the current period
          let periodEnd = new Date(date);
          while (periodDates.includes(formatDate(addDays(periodEnd, 1)))) {
            periodEnd = addDays(periodEnd, 1);
          }

          const length = getDaysBetween(periodStart, periodEnd) + 1; // +1 because getDaysBetween is exclusive of end day
          setSelectedPeriodLength(length);
        } else {
          setSelectedPeriodLength(null); // Clear period length if not a period day
        }
      } else {
        setSelectedLogEntry(null);
        setSelectedPeriodLength(null);
      }
    };
    fetchSelectedDayInfo();
  }, [selectedDate, periodDates]);

  const loadCalendarData = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const periodKeys = allKeys.filter(key => key.startsWith('period-'));
      const logKeys = allKeys.filter(key => key.startsWith('log-'));

      const datesWithPeriods = periodKeys.map(key => key.replace('period-', '')).sort();
      setPeriodDates(datesWithPeriods);

      // Identify period ranges
      const identifiedPeriodRanges: { start: string, end: string }[] = [];
      if (datesWithPeriods.length > 0) {
        let currentPeriodStart = datesWithPeriods[0];
        for (let i = 0; i < datesWithPeriods.length; i++) {
          const currentDate = new Date(datesWithPeriods[i] + 'T00:00:00');
          const nextDate = new Date(datesWithPeriods[i + 1] + 'T00:00:00');
          // Check if the next date is consecutive
          if (i === datesWithPeriods.length - 1 || getDaysBetween(currentDate, nextDate) > 1) {
            // End of a period range
            identifiedPeriodRanges.push({ start: currentPeriodStart, end: datesWithPeriods[i] });
            if (i < datesWithPeriods.length - 1) {
              currentPeriodStart = datesWithPeriods[i + 1]; // Start of the next potential period
            }
          }
        }
      }
      setPeriodRanges(identifiedPeriodRanges);

      const datesWithLogs = logKeys.map(key => key.replace('log-', '')).sort();
      setLoggedDates(datesWithLogs);

      // Calculate average cycle length and predict next period based on LAST PERIOD END DATE
      let calculatedAverageCycleLength: number | null = null; // Initialize as null
      let lastPeriodEndDate: string | null = null;

      if (identifiedPeriodRanges.length > 0) {
        // Calculate cycle lengths based on START dates of consecutive periods
        const cycleLengths = [];
        for (let i = 0; i < identifiedPeriodRanges.length - 1; i++) {
          const startDate = new Date(identifiedPeriodRanges[i].start + 'T00:00:00');
          const nextStartDate = new Date(identifiedPeriodRanges[i + 1].start + 'T00:00:00');
          cycleLengths.push(getDaysBetween(startDate, nextStartDate));
        }
        if (cycleLengths.length > 0) {
          const sum = cycleLengths.reduce((a, b) => a + b, 0);
          calculatedAverageCycleLength = Math.round(sum / cycleLengths.length);
        } else {
           // If only one period is recorded, use a default or base cycle length if available/appropriate
           calculatedAverageCycleLength = 28; // Or some other default/initial value
        }

        // Get the end date of the last period
        lastPeriodEndDate = identifiedPeriodRanges[identifiedPeriodRanges.length - 1].end;
      }

      setAverageCycleLength(calculatedAverageCycleLength);

      let calculatedNextPredictedPeriod: string | null = null;
      let calculatedFertileWindowStart: string | null = null;
      let calculatedFertileWindowEnd: string | null = null;

      if (lastPeriodEndDate && calculatedAverageCycleLength !== null) {
        // Predict next period start based on the LAST PERIOD END DATE + Average Cycle Length
        const lastPeriodEnd = new Date(lastPeriodEndDate + 'T00:00:00');
        const nextPeriodPredictionDate = addDays(lastPeriodEnd, calculatedAverageCycleLength);
        calculatedNextPredictedPeriod = formatDate(nextPeriodPredictionDate);

        // Estimate fertile window (14 days before predicted next period start)
        const ovulationDate = addDays(nextPeriodPredictionDate, -14);
        calculatedFertileWindowStart = formatDate(addDays(ovulationDate, -5)); // 5 days before ovulation
        calculatedFertileWindowEnd = formatDate(addDays(ovulationDate, 1));   // 1 day after ovulation
      }
      setNextPeriodDate(calculatedNextPredictedPeriod);
      setFertileWindow({ start: calculatedFertileWindowStart, end: calculatedFertileWindowEnd });

      // Create marked dates object for the calendar
      const marked: { [date: string]: any } = {};

      // Mark fertile window dates (#4fc3f7)
      if (calculatedFertileWindowStart && calculatedFertileWindowEnd) {
        const start = new Date(calculatedFertileWindowStart + 'T00:00:00');
        const end = new Date(calculatedFertileWindowEnd + 'T00:00:00');
        let currentDate = new Date(start);

        while (currentDate <= end) {
          const dateString = formatDate(currentDate);
           // Mark with a blue dot for fertile window
          if (!marked[dateString]) {
             marked[dateString] = { dots: [{ color: '#4fc3f7' }] };
          } else {
             if (!marked[dateString].dots) {
                marked[dateString].dots = [];
             }
             const hasFertileDot = marked[dateString].dots.some((dot: { color: string }) => dot.color === '#4fc3f7');
             if (!hasFertileDot) {
                marked[dateString].dots.push({ color: '#4fc3f7' });
             }
          }
          currentDate = addDays(currentDate, 1);
        }
      }

      // Mark logged dates (#9c27b0) - Purple dot
      datesWithLogs.forEach(date => {
         if (!marked[date]) {
            marked[date] = { dots: [{ color: '#9c27b0' }] };
         } else {
            if (!marked[date].dots) {
               marked[date].dots = [];
            }
            const hasLogDot = marked[date].dots.some((dot: { color: string }) => dot.color === '#9c27b0');
            if (!hasLogDot) {
               marked[date].dots.push({ color: '#9c27b0' });
            }
         }
      });

      // Mark period dates and predicted period date (#ff416c) - Red circle border
      const today = new Date().toLocaleDateString('en-CA');
      identifiedPeriodRanges.forEach(range => {
          const start = new Date(range.start + 'T00:00:00');
          const end = new Date(range.end + 'T00:00:00');
          let currentDate = new Date(start);
          while (currentDate <= end) {
              const dateString = formatDate(currentDate);
              const isPast = new Date(dateString) < new Date(today); // Check if date is in the past
               if (!marked[dateString]) {
                  marked[dateString] = {};
               }
               marked[dateString].customStyles = {
                  container: {
                     borderWidth: 1,
                     borderRadius: 16, // Approximate circle
                     borderColor: '#ff416c', // Red border
                     borderStyle: isPast ? 'dotted' : 'solid', // Dotted for past, solid for current/future (adjust if needed)
                  },
                   text: {
                     color: '#ff416c', // Red text color for period days
                   }
               };
               // Ensure dots are still visible
               if (marked[dateString].dots) {
                  marked[dateString].customStyles.container.backgroundColor = 'rgba(255, 65, 108, 0.1)'; // Light red background with transparency to show dots
               }
              currentDate = addDays(currentDate, 1);
          }
      });

      // Mark predicted period date (#ff416c) - Red dotted circle border
      if (calculatedNextPredictedPeriod) {
         if (!marked[calculatedNextPredictedPeriod]) {
            marked[calculatedNextPredictedPeriod] = {};
         }
          marked[calculatedNextPredictedPeriod].customStyles = {
             container: {
                borderWidth: 1,
                borderRadius: 16, // Approximate circle
                borderColor: '#ff416c', // Red border
                borderStyle: 'dotted', // Dotted for predicted
             },
              text: {
                color: '#ff416c', // Red text color for predicted period
              }
          };
           // Ensure dots are still visible
           if (marked[calculatedNextPredictedPeriod].dots) {
              marked[calculatedNextPredictedPeriod].customStyles.container.backgroundColor = 'rgba(255, 65, 108, 0.1)'; // Light red background with transparency to show dots
           }
      }

      // Mark today (#4caf50) - Green background/circle
      if (!marked[today]) {
         marked[today] = {};
      }
      marked[today].customStyles = {
         container: {
            backgroundColor: '#4caf50', // Green background
            borderRadius: 16, // Approximate circle
         },
         text: {
            color: '#FFFFFF', // White text for today
            fontWeight: 'bold',
         }
      };

      console.log("Marked Dates object:", marked);
      setMarkedDates(marked);
    } catch (error) {
      console.error("Error loading calendar data:", error);
    }
  };

  const onDayPress = (day: DateData) => {
    const dateString = day.dateString;
    setSelectedDate(dateString); // Select the clicked date
    // Navigate to LogScreen with the selected date
    navigation.navigate('Log', { date: dateString });
  };

  // Restore the togglePeriod function and the '+' button
  const togglePeriod = async () => {
    if (!selectedDate) {
      alert('Please select a date first to mark a period.');
      return;
    }

    const periodKey = `period-${selectedDate}`;

    try {
      const existingPeriod = await AsyncStorage.getItem(periodKey);

      if (existingPeriod) {
        Alert.alert(
          'Remove Period Entry',
          `Are you sure you want to remove the period entry for ${selectedDate}?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Remove',
              onPress: async () => {
                await AsyncStorage.removeItem(periodKey);
                console.log(`Period unmarked for ${selectedDate}`);
                loadCalendarData(); // Reload calendar after removal
                setSelectedPeriodLength(null); // Clear selected period length
              },
              style: 'destructive',
            },
          ],
          { cancelable: true }
        );
      } else {
        await AsyncStorage.setItem(periodKey, JSON.stringify({ isPeriod: true }));
        console.log(`Period marked for ${selectedDate}`);
        loadCalendarData(); // Reload calendar after adding period
      }
    } catch (error) {
      console.error(`Error toggling period for ${selectedDate}:`, error);
      alert('Failed to toggle period.');
    }
  };

  const formatDateRange = (startDate: string | null, endDate: string | null): string => {
    if (!startDate || !endDate) return "N/A";
    const start = new Date(startDate + 'T00:00:00').toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const end = new Date(endDate + 'T00:00:00').toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${start} - ${end}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Calendar</Text>

        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={onDayPress}
            markedDates={markedDates}
            markingType="custom"
            theme={{
              todayTextColor: '#4caf50',
              selectedDayBackgroundColor: '#4caf50',
              dotColor: '#ff416c',
              selectedDotColor: '#FFFFFF',
              monthTextColor: '#333',
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14,
              textDayStyle: {
                color: '#333',
              },
            }}
          />

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { borderColor: "#ff416c", borderWidth: 1, borderRadius: 6, }]} />
              <Text style={styles.legendText}>Period/Predicted Period</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.fertileWindowMarker]} />
              <Text style={styles.legendText}>Fertile Window</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.loggedDayMarker]} />
              <Text style={styles.legendText}>Logged Data</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.todayMarker]} />
              <Text style={styles.legendText}>Today</Text>
            </View>
          </View>
        </View>

        {/* Predictions Summary Section */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Your Cycle Insights</Text>
          <View style={styles.insightsGrid}>
            <View style={[styles.insightCard, { borderLeftColor: "#FF6B8A" }]}>
              <Text style={styles.insightLabel}>Avg Cycle Length</Text>
              <Text style={[styles.insightValue, { color: "#FF6B8A" }]}>{averageCycleLength !== null ? averageCycleLength : "N/A"} days</Text>
            </View>
            <View style={[styles.insightCard, { borderLeftColor: "#9C27B0" }]}>
              <Text style={styles.insightLabel}>Next Period Start Prediction (based on last period end date)</Text>
              <Text style={[styles.insightValue, { color: "#9C27B0" }]}>{nextPeriodDate || "N/A"}</Text>
            </View>
            <View style={[styles.insightCard, { borderLeftColor: "#4CAF50" }]}>
              <Text style={styles.insightLabel}>Fertile Window</Text>
              <Text style={[styles.insightValue, { color: "#4CAF50" }]}>{formatDateRange(fertileWindow.start, fertileWindow.end)}</Text>
            </View>
          </View>
        </View>

        {selectedDate && (
          <View style={styles.selectedDateInfo}>
            <Text style={styles.selectedDateTitle}>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>

            <View style={styles.statusCard}>
              <View style={[styles.statusDot, { backgroundColor: '#ff416c' }]} />
              <Text style={styles.statusText}>
                {loggedDates.includes(selectedDate) ? 'Logged' : 'No Log'} | 
                {periodDates.includes(selectedDate) ? ' Period' : ' No Period'} {selectedPeriodLength !== null && periodDates.includes(selectedDate) ? `(${selectedPeriodLength} days)` : ''}
              </Text>
            </View>

            {selectedLogEntry ? (
              <View>
                {selectedLogEntry.mood && (
                  <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Mood</Text>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoIcon}>{selectedLogEntry.mood.icon}</Text>
                      <Text style={styles.infoText}>{selectedLogEntry.mood.name}</Text>
                    </View>
                  </View>
                )}

                {selectedLogEntry.symptoms && selectedLogEntry.symptoms.length > 0 && (
                  <View style={styles.symptomsCard}>
                    <Text style={styles.symptomsTitle}>Symptoms</Text>
                    {selectedLogEntry.symptoms.map((symptom, index) => (
                      <View key={index} style={styles.symptomItem}>
                        <View style={[styles.symptomDot, { backgroundColor: symptom.color || "#ff416c" }]} />
                        <Text style={styles.symptomText}>{symptom.name}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {selectedLogEntry.activities && selectedLogEntry.activities.length > 0 && (
                  <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Activities</Text>
                    {selectedLogEntry.activities.map((activity, index) => (
                      <View key={index} style={styles.infoItem}>
                        <Text style={styles.infoIcon}>{activity.icon}</Text>
                        <Text style={styles.infoText}>{activity.name}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : loggedDates.includes(selectedDate) ? (
              <Text style={styles.noDataText}>No detailed log data for this date</Text>
            ) : (
              <Text style={styles.noDataText}>No log data for this date</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Restore the '+' button */}
      <TouchableOpacity style={styles.addButton} onPress={togglePeriod}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  calendarContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  legend: {
    flexDirection: "row",
    flexWrap: 'wrap',
    justifyContent: "center",
    marginTop: 20,
    gap: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
  selectedDateInfo: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F3",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
  },
  infoCard: {
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
  symptomsCard: {
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  symptomsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  symptomItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  symptomDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  symptomText: {
    fontSize: 14,
    color: "#666",
  },
  noDataText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF6B8A",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  loggedDayMarker: {
    backgroundColor: "#9c27b0",
  },
  todayMarker: {
    backgroundColor: "#4caf50",
  },
  fertileWindowMarker: {
    backgroundColor: "#4fc3f7",
  },
  insightsSection: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  insightsGrid: {
    flexDirection: "row",
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  insightCard: {
    width: '48%',
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    justifyContent: 'center',
  },
  insightLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
