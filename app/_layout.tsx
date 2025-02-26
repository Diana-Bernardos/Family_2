"use client"

import { useState, useEffect } from "react"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import SplashScreen from "./ShplashScreen"

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {isLoading ? (
        <SplashScreen />
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="personal" options={{ headerShown: false, presentation: 'modal' }} />
        </Stack>
      )}
      <StatusBar style="auto" />
    </>
  )
}