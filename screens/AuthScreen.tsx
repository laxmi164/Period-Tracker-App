import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface AuthScreenProps {
  onAuthSuccess: () => void
}

interface UserData {
  email: string
  name: string
  token: string
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps): JSX.Element {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [isLogin, setIsLogin] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)

  const handleAuth = async (): Promise<void> => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      // Simulate authentication
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Store user data
      const userData: UserData = {
        email,
        name: email.split("@")[0],
        token: "dummy_token_" + Date.now(),
      }

      await AsyncStorage.setItem("userToken", userData.token)
      await AsyncStorage.setItem("userData", JSON.stringify(userData))

      onAuthSuccess()
    } catch (error) {
      Alert.alert("Error", "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Period Tracker</Text>
        <Text style={styles.subtitle}>{isLogin ? "Welcome back!" : "Create your account"}</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchButton} onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FF6B8A",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 40,
  },
  form: {
    width: "100%",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  button: {
    backgroundColor: "#FF6B8A",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  switchButton: {
    marginTop: 20,
    alignItems: "center",
  },
  switchText: {
    color: "#FF6B8A",
    fontSize: 14,
  },
})
