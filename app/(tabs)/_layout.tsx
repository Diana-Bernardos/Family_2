import { Tabs } from "expo-router"
import { Calendar, Users, MessageSquare, ShoppingCart, BookOpen, Bell } from "lucide-react-native"
import { Text, View } from "react-native"
import { useFamilyStore } from "../../stores/familyStore"
import { THEME_COLORS } from "../../constants/theme"

export default function TabLayout() {
  const { notifications } = useFamilyStore()
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e5e5e5",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: THEME_COLORS.primary,
        tabBarInactiveTintColor: "#94a3b8",
        headerShown: true,
        headerStyle: {
          backgroundColor: "#fff",
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: "#f3f4f6",
        },
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
          color: "#1f2937",
        },
        headerTitleAlign: "center",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Calendario Familiar",
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
          tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 12, marginTop: -5 }}>Calendario</Text>,
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: "Miembros de la Familia",
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 12, marginTop: -5 }}>Familia</Text>,
        }}
      />
      <Tabs.Screen
        name="school"
        options={{
          title: "Calendario Escolar",
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
          tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 12, marginTop: -5 }}>Escolar</Text>,
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          title: "Lista de la Compra",
          tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />,
          tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 12, marginTop: -5 }}>Compra</Text>,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notificaciones",
          tabBarIcon: ({ color, size }) => (
            <>
              <Bell size={size} color={color} />
              {unreadCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -6,
                    backgroundColor: "#ef4444",
                    borderRadius: 10,
                    width: 16,
                    height: 16,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              )}
            </>
          ),
          tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 12, marginTop: -5 }}>Alertas</Text>,
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: "Asistente Familiar",
          tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
          tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 12, marginTop: -5 }}>Asistente</Text>,
        }}
      />
    </Tabs>
  )
}

