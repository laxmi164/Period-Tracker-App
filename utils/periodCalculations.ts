import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatDate, getDaysBetween, addDays } from "./dateHelpers";

interface PeriodEntry {
  isPeriod: true;
}

export const getAllPeriodDates = async (): Promise<string[]> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const periodKeys = allKeys.filter(key => key.startsWith('period-'));
    const periodDates = periodKeys.map(key => key.replace('period-', '')).sort(); // Sort dates
    return periodDates;
  } catch (error) {
    console.error("Error getting all period dates:", error);
    return [];
  }
};

export const calculateCycleLengths = (periodDates: string[]): number[] => {
  const cycleLengths: number[] = [];
  for (let i = 0; i < periodDates.length - 1; i++) {
    const startDate = new Date(periodDates[i] + 'T00:00:00');
    const endDate = new Date(periodDates[i + 1] + 'T00:00:00');
    const cycleLength = getDaysBetween(startDate, endDate);
    cycleLengths.push(cycleLength);
  }
  return cycleLengths;
};

export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return sum / numbers.length;
};

export const calculatePeriodLengths = async (periodDates: string[]): Promise<number[]> => {
    const periodLengths: number[] = [];
    let currentPeriodLength = 0;

    for (let i = 0; i < periodDates.length; i++) {
        const currentDate = new Date(periodDates[i] + 'T00:00:00');
        currentPeriodLength++;

        // Check if the next day is also a period day
        const nextDay = addDays(currentDate, 1);
        const nextDayStr = formatDate(nextDay);
        const nextPeriodKey = `period-${nextDayStr}`;
        const nextDayIsPeriod = await AsyncStorage.getItem(nextPeriodKey);

        if (!nextDayIsPeriod) {
            periodLengths.push(currentPeriodLength);
            currentPeriodLength = 0; // Reset for the next period
        }
    }
     // Handle the case where the last period is ongoing
    if (currentPeriodLength > 0) {
        periodLengths.push(currentPeriodLength);
    }


    return periodLengths;
};


export const predictNextPeriod = (lastPeriodDate: string | null, averageCycleLength: number): string | null => {
  if (!lastPeriodDate || averageCycleLength === 0) return null;
  const lastPeriod = new Date(lastPeriodDate + 'T00:00:00');
  const nextPeriod = addDays(lastPeriod, averageCycleLength);
  return formatDate(nextPeriod);
};

export const estimateFertileWindow = (predictedNextPeriodDate: string | null): { start: string | null, end: string | null } => {
  if (!predictedNextPeriodDate) return { start: null, end: null };

  const nextPeriod = new Date(predictedNextPeriodDate + 'T00:00:00');
  // Ovulation is typically around 14 days before the next period
  const ovulationDate = addDays(nextPeriod, -14);

  // Fertile window is roughly 5 days before ovulation to 1 day after
  const fertileStart = addDays(ovulationDate, -5);
  const fertileEnd = addDays(ovulationDate, 1);

  return {
    start: formatDate(fertileStart),
    end: formatDate(fertileEnd),
  };
}; 