"use client"

import { useEffect, useState } from "react"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { View, ActivityIndicator, Text, Image, StyleSheet } from "react-native"
import { useFamilyStore } from "../stores/familyStore"
import { LinearGradient } from "expo-linear-gradient"
import { THEME_COLORS } from "../constants/theme"

declare global {
  interface Window {
    frameworkReady?: () => void
  }
}

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useFamilyStore((state) => state.loadData)
  const addNotification = useFamilyStore((state) => state.addNotification)
  const events = useFamilyStore((state) => state.events)
  const schoolActivities = useFamilyStore((state) => state.schoolActivities)

  useEffect(() => {
    window.frameworkReady?.()

    // Cargar datos y simular un tiempo de carga mínimo
    const loadAppData = async () => {
      await loadData()
      // Simular un tiempo de carga mínimo para mostrar la pantalla de carga
      setTimeout(() => {
        setIsLoading(false)
      }, 1500)
    }

    loadAppData()
  }, [loadData])

  // Efecto para verificar eventos próximos y crear recordatorios
  useEffect(() => {
    if (isLoading) return

    const checkUpcomingEvents = () => {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const tomorrowDateStr = tomorrow.toISOString().split("T")[0]

      // Verificar eventos familiares para mañana
      const tomorrowEvents = events.filter((event) => event.date === tomorrowDateStr)

      if (tomorrowEvents.length > 0) {
        addNotification({
          id: `reminder-events-${Date.now()}`,
          title: "Recordatorio de eventos",
          message: `Tienes ${tomorrowEvents.length} evento(s) programado(s) para mañana`,
          date: today.toISOString().split("T")[0],
          time: today.toTimeString().split(" ")[0].substring(0, 5),
          read: false,
          type: "reminder",
        })
      }

      // Verificar actividades escolares para mañana
      const tomorrowActivities = schoolActivities.filter((activity) => activity.date === tomorrowDateStr)

      if (tomorrowActivities.length > 0) {
        addNotification({
          id: `reminder-school-${Date.now()}`,
          title: "Recordatorio escolar",
          message: `Hay ${tomorrowActivities.length} actividad(es) escolar(es) programada(s) para mañana`,
          date: today.toISOString().split("T")[0],
          time: today.toTimeString().split(" ")[0].substring(0, 5),
          read: false,
          type: "reminder",
        })
      }
    }

    // Verificar al inicio
    checkUpcomingEvents()

    // Configurar verificación periódica (cada 12 horas)
    const intervalId = setInterval(checkUpcomingEvents, 12 * 60 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [isLoading, events, schoolActivities, addNotification])

  if (isLoading) {
    return (
      <LinearGradient colors={[THEME_COLORS.primary, "#818cf8", "#a5b4fc"]} style={styles.loadingContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1631979822193-25db6e6d9ef3?auto=format&fit=crop&w=200&h=200",
            }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Familia App</Text>
        </View>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={["#f9fafb", "#f3f4f6", "#e5e7eb"]} style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#ffffff",
  },
})

