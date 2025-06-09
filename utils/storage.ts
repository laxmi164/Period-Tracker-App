import AsyncStorage from "@react-native-async-storage/async-storage"

export const storeData = async <T>(key: string, value: T)
: Promise<boolean> =>
{
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(key, jsonValue)
    return true;
  } catch (error) {
    console.error("Error storing data:", error)
    throw error
  }
}

export const getStoredData = async <T>(key: string)
: Promise<T | null> =>
{
  try {
    const jsonValue = await AsyncStorage.getItem(key)
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error("Error retrieving data:", error)
    throw error
  }
}

export const removeStoredData = async (key: string): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(key)
    return true
  } catch (error) {
    console.error("Error removing data:", error)
    throw error
  }
}

export const clearAllData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.clear()
    return true
  } catch (error) {
    console.error("Error clearing all data:", error)
    throw error
  }
}
