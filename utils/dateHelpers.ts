export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0]
}

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate()
}

export const getMonthName = (month: number): string => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  return months[month]
}

export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / oneDay))
}

export const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export const isSameMonth = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth()
}
