import { Tabs } from "expo-router"
import { useEffect, useState } from 'react';
import { registerForPushNotificationsAsync, setupNotificationHandlers } from '../../utils/notificationService';
import { Calendar, Users, MessageSquare, ShoppingBag, BookOpen } from "lucide-react-native"
import { View, Alert, Platform, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useFamilyStore, THEME_COLORS } from "../../stores/familyStore"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { router } from "expo-router";

export default function TabLayout() {
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const familyStore = useFamilyStore();

  // Inicialización y verificación del almacenamiento al cargar la aplicación
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Verificar si hay datos en AsyncStorage
        const storedData = await AsyncStorage.getItem("family-store");
        console.log("Datos almacenados:", storedData ? "Sí hay datos" : "No hay datos");
        
        // Registrar para notificaciones push y guardar permisos
        const token = await registerForPushNotificationsAsync();
        setNotificationPermission(!!token);
        
        // Si no hay permisos, mostrar alerta informativa
        if (!token && Platform.OS !== 'web') {
          Alert.alert(
            "Notificaciones desactivadas",
            "Las notificaciones están desactivadas. Para recibir recordatorios de eventos, por favor activa los permisos de notificaciones en la configuración.",
            [{ text: "OK" }]
          );
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error al inicializar la aplicación:", error);
        setLoading(false);
      }
    };
    
    initializeApp();
  }, []);

  // Configurar manejadores de notificaciones
  useEffect(() => {
    // Función para manejar cuando se recibe una notificación con la app en primer plano
    const handleNotificationReceived = (notification) => {
      console.log("Notificación recibida en primer plano:", notification);
    };

    // Función para manejar cuando el usuario interactúa con una notificación
    const handleNotificationResponse = (response) => {
      const data = response.notification.request.content.data;
      console.log("Usuario interactuó con notificación:", data);
      
      // Navegar según el tipo de notificación
      if (data.type === 'event' && data.eventId) {
        // Buscar el evento y navegar al calendario correspondiente
        const event = familyStore.events.find(e => e.id === data.eventId);
        if (event) {
          if (event.memberId) {
            // Evento de un miembro específico
            router.navigate({
              pathname: "/personal",
              params: { memberId: event.memberId }
            });
          } else {
            // Evento general
            router.navigate("/");
          }
        }
      } else if (data.type === 'school' && data.eventId) {
        // Navegar a la sección de escuela
        router.navigate("/school");
      } else if (data.type === 'shopping' && data.listId) {
        // Navegar a la lista de compras específica
        router.navigate({
          pathname: "/shopping-detail",
          params: { listId: data.listId }
        });
      }
    };

    // Configurar manejadores y obtener función de limpieza
    const unsubscribe = setupNotificationHandlers(
      handleNotificationReceived,
      handleNotificationResponse
    );

    // Limpiar suscripciones al desmontar
    return () => {
      unsubscribe();
    };
  }, [familyStore.events]);

  // Mostrar indicador de carga mientras se inicializa
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LinearGradient
          colors={THEME_COLORS.gradient}
          style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
        />
        <ActivityIndicator size="large" color={THEME_COLORS.primary} />
      </View>
    );
  }

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
          headerShown: false,
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
          name="shopping"
          options={{
            title: "Compras",
            tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="school"
          options={{
            title: "Escuela",
            tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
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