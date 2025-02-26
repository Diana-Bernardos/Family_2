import { Tabs } from "expo-router"
import { Calendar, Users, MessageSquare } from "lucide-react-native"
import { View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { THEME_COLORS } from "../../stores/familyStore"

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={THEME_COLORS.gradient}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderTopWidth: 1,
            borderTopColor: "#e5e5e5",
          },
          tabBarActiveTintColor: THEME_COLORS.primary,
          tabBarInactiveTintColor: "#94a3b8",
          headerShown: false, // Mantenemos el encabezado oculto
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Calendario",
            tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="family"
          options={{
            title: "Familia",
            tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="assistant"
          options={{
            title: "Asistente",
            tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
          }}
        />
      </Tabs>
    </View>
  )
}