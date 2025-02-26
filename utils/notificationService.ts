// 1. Primero necesitas instalar las dependencias necesarias:
// npm install expo-notifications expo-device expo-constants

// 2. Crea un nuevo archivo en la carpeta utils llamado notificationService.ts:

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Función para registrar el dispositivo para notificaciones push
export async function registerForPushNotificationsAsync() {
  let token;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('No se pudieron obtener permisos para las notificaciones push!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    })).data;
  } else {
    console.log('Se necesita un dispositivo físico para las notificaciones push');
  }

  return token;
}

// Programar una notificación local para un evento
export async function scheduleEventNotification(event) {
  // Calcular el tiempo de notificación (1 hora antes del evento)
  const eventDate = new Date(`${event.date}T${event.time}`);
  const notificationDate = new Date(eventDate.getTime() - 60 * 60 * 1000); // 1 hora antes
  
  // Verificar si la fecha de notificación ya pasó
  if (notificationDate <= new Date()) {
    console.log('La fecha de notificación ya pasó');
    return null;
  }

  // Crear el contenido de la notificación
  const memberName = event.memberName || 'Familia';
  const title = `Recordatorio: ${event.title}`;
  const body = `${event.title} a las ${event.time} para ${memberName}`;

  // Programar la notificación
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { eventId: event.id },
      sound: true,
    },
    trigger: notificationDate,
  });

  return notificationId;
}

// Programar una notificación diaria para un evento
export async function scheduleDailyNotification(event) {
  // Extraer hora y minutos del formato "HH:MM"
  const [hours, minutes] = event.time.split(':').map(Number);
  
  // Crear trigger diario
  const trigger = {
    hour: hours,
    minute: minutes,
    repeats: true,
  };

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Recordatorio diario: ${event.title}`,
      body: `Es hora de: ${event.title}`,
      data: { eventId: event.id },
    },
    trigger,
  });

  return notificationId;
}

// Cancelar una notificación programada
export async function cancelNotification(notificationId) {
  if (!notificationId) return;
  
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// Cancelar todas las notificaciones
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}