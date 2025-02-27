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
    
    // Canal para recordatorios de eventos
    await Notifications.setNotificationChannelAsync('events', {
      name: 'Recordatorios de eventos',
      description: 'Notificaciones para los eventos del calendario familiar',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366f1', // Mismo color que THEME_COLORS.primary
    });
    
    // Canal para lista de compras
    await Notifications.setNotificationChannelAsync('shopping', {
      name: 'Lista de compras',
      description: 'Notificaciones para listas de compras',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 100, 100, 100],
      lightColor: '#6366f1',
    });
    
    // Canal para eventos escolares
    await Notifications.setNotificationChannelAsync('school', {
      name: 'Eventos escolares',
      description: 'Notificaciones para eventos escolares',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366f1',
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
    
    // Obtener el token - aseguramos que intentamos usar el projectId desde la configuración
    try {
      token = Constants.expoConfig?.extra?.eas?.projectId 
        ? (await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig.extra.eas.projectId,
          })).data
        : (await Notifications.getExpoPushTokenAsync()).data;
      
      console.log('Token para notificaciones push:', token);
    } catch (error) {
      console.error('Error al obtener token de notificaciones:', error);
    }
  } else {
    console.log('Se necesita un dispositivo físico para las notificaciones push');
  }

  return token;
}

// Programar una notificación local para un evento
export async function scheduleEventNotification(event, memberName = null) {
  if (!event.date || !event.time) {
    console.error('Fecha o tiempo faltante para programar notificación');
    return null;
  }
  
  try {
    // Calcular el tiempo de notificación (1 hora antes del evento)
    const eventDate = new Date(`${event.date}T${event.time}`);
    const notificationDate = new Date(eventDate.getTime() - 60 * 60 * 1000); // 1 hora antes
    
    // Verificar si la fecha de notificación ya pasó
    if (notificationDate <= new Date()) {
      console.log('La fecha de notificación ya pasó, no se programará');
      return null;
    }

    // Crear el contenido de la notificación
    const memberNameDisplay = memberName || 'Familia';
    const title = `Recordatorio: ${event.title}`;
    const body = `${event.title} a las ${event.time} para ${memberNameDisplay}`;

    // Seleccionar el canal de notificación adecuado según el tipo de evento
    let channelId = 'default';
    if (event.type === 'escuela') channelId = 'school';
    else if (event.type === 'compras') channelId = 'shopping';
    
    // Programar la notificación
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { eventId: event.id, type: 'event' },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        color: event.color,
        channelId,
      },
      trigger: notificationDate,
    });

    console.log(`Notificación programada con ID: ${notificationId} para evento: ${event.title}`);
    return notificationId;
  } catch (error) {
    console.error('Error al programar notificación:', error);
    return null;
  }
}

// Programar una notificación para eventos escolares
export async function scheduleSchoolEventNotification(event, studentName = null) {
  if (!event.date || !event.time) {
    console.error('Fecha o tiempo faltante para programar notificación escolar');
    return null;
  }
  
  try {
    // Calcular tiempo de notificación según el tipo
    const eventDate = new Date(`${event.date}T${event.time}`);
    let notificationDate;
    
    switch(event.type) {
      case 'exam': // Examen - notificar 1 día antes
        notificationDate = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'assignment': // Tarea - notificar 2 horas antes
        notificationDate = new Date(eventDate.getTime() - 2 * 60 * 60 * 1000);
        break;
      default: // Otros eventos - notificar 1 hora antes
        notificationDate = new Date(eventDate.getTime() - 60 * 60 * 1000);
        break;
    }
    
    // Verificar si la fecha ya pasó
    if (notificationDate <= new Date()) {
      console.log('La fecha de notificación escolar ya pasó');
      return null;
    }

    // Crear contenido
    const studentNameDisplay = studentName || 'Estudiante';
    let title = '';
    let body = '';
    
    switch(event.type) {
      case 'exam':
        title = `¡Examen mañana! ${event.title}`;
        body = `Recuerda que mañana a las ${event.time} ${studentNameDisplay} tiene el examen: ${event.title}`;
        break;
      case 'assignment':
        title = `Entrega pendiente: ${event.title}`;
        body = `La tarea "${event.title}" debe entregarse hoy a las ${event.time}`;
        break;
      default:
        title = `Recordatorio escolar: ${event.title}`;
        body = `${event.title} a las ${event.time} para ${studentNameDisplay}`;
        break;
    }

    // Programar notificación
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { eventId: event.id, type: 'school' },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        color: event.color,
        channelId: 'school',
      },
      trigger: notificationDate,
    });

    console.log(`Notificación escolar programada con ID: ${notificationId}`);
    return notificationId;
  } catch (error) {
    console.error('Error al programar notificación escolar:', error);
    return null;
  }
}

// Programar recordatorio para lista de compras
export async function scheduleShoppingListReminder(list, reminderDate) {
  if (!list || !reminderDate) {
    console.error('Datos insuficientes para programar recordatorio de compras');
    return null;
  }
  
  try {
    // Calcular fecha de recordatorio
    const notificationDate = new Date(reminderDate);
    
    // Verificar si ya pasó
    if (notificationDate <= new Date()) {
      console.log('La fecha del recordatorio de compras ya pasó');
      return null;
    }
    
    // Contenido de la notificación
    const title = `Lista de compras: ${list.name}`;
    const body = `Recuerda que tienes pendiente tu lista "${list.name}" con ${list.items.length} productos`;
    
    // Programar notificación
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { listId: list.id, type: 'shopping' },
        sound: true,
        channelId: 'shopping',
      },
      trigger: notificationDate,
    });
    
    console.log(`Recordatorio de compras programado con ID: ${notificationId}`);
    return notificationId;
  } catch (error) {
    console.error('Error al programar recordatorio de compras:', error);
    return null;
  }
}

// Programar una notificación diaria para un evento
export async function scheduleDailyNotification(event) {
  try {
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
        data: { eventId: event.id, type: 'daily' },
        sound: true,
      },
      trigger,
    });

    console.log(`Notificación diaria programada con ID: ${notificationId}`);
    return notificationId;
  } catch (error) {
    console.error('Error al programar notificación diaria:', error);
    return null;
  }
}

// Cancelar una notificación programada
export async function cancelNotification(notificationId) {
  if (!notificationId) {
    console.log('No se proporcionó ID de notificación para cancelar');
    return;
  }
  
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`Notificación con ID: ${notificationId} cancelada`);
  } catch (error) {
    console.error(`Error al cancelar notificación ${notificationId}:`, error);
  }
}

// Cancelar todas las notificaciones
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Todas las notificaciones canceladas');
  } catch (error) {
    console.error('Error al cancelar todas las notificaciones:', error);
  }
}

// Configurar manejador de notificaciones recibidas
export function setupNotificationHandlers(onNotificationReceived, onNotificationResponse) {
  // Configurar el manejador para notificaciones recibidas mientras la app está en primer plano
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    notification => {
      console.log('Notificación recibida:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    }
  );

  // Configurar el manejador para cuando el usuario interactúa con una notificación
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    response => {
      console.log('Respuesta a notificación recibida:', response);
      if (onNotificationResponse) {
        onNotificationResponse(response);
      }
    }
  );

  // Retornar función para limpiar suscripciones
  return () => {
    Notifications.removeNotificationSubscription(receivedSubscription);
    Notifications.removeNotificationSubscription(responseSubscription);
  };
}