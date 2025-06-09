"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null)
  const [cycleSettings, setCycleSettings] = useState({
    averageCycleLength: 28,
    averagePeriodLength: 5,
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem("userData")
      if (userDataStr) {
        setUserData(JSON.parse(userDataStr))
      }

      const settingsStr = await AsyncStorage.getItem("cycleSettings")
      if (settingsStr) {
        setCycleSettings(JSON.parse(settingsStr))
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("userToken")
            await AsyncStorage.removeItem("userData")
            // The app will automatically redirect to auth screen
          } catch (error) {
            console.error("Error logging out:", error)
          }
        },
      },
    ])
  }

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Profile editing feature coming soon!")
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Text style={styles.sectionSubtitle}>Manage your account</Text>

          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={30} color="white" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userData?.name || "User"}</Text>
              <Text style={styles.userEmail}>{userData?.email || "user@example.com"}</Text>
            </View>
          </View>

          <View style={styles.settingsCard}>
            <View style={styles.settingsHeader}>
              <Ionicons name="settings" size={20} color="#9C27B0" />
              <Text style={styles.settingsTitle}>Cycle Settings</Text>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Average Cycle Length</Text>
              <Text style={styles.settingValue}>{cycleSettings.averageCycleLength} days</Text>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Average Period Length</Text>
              <Text style={styles.settingValue}>{cycleSettings.averagePeriodLength} days</Text>
            </View>

            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#FF6B8A" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
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
  profileSection: {
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
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF6B8A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  settingsCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  settingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#333",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  settingLabel: {
    fontSize: 14,
    color: "#666",
  },
  settingValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9C27B0",
  },
  editButton: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF6B8A",
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 15,
  },
  editButtonText: {
    color: "#FF6B8A",
    fontSize: 14,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 15,
  },
  logoutText: {
    color: "#FF6B8A",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
  },
})
