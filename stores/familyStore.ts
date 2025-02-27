// stores/familyStore.ts

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { 
  scheduleEventNotification, 
  scheduleSchoolEventNotification,
  scheduleShoppingListReminder,
  cancelNotification 
} from "../utils/notificationService"

export const THEME_COLORS = {
  primary: "#6366f1", // indigo
  secondary: "#a855f7", // púrpura
  accent: "#ec4899", // rosa
  blue: "#e0f2fe", // azul claro
  green: "#dcfce7", // verde claro
  yellow: "#fef9c3", // amarillo claro
  pink: "#fce7f3", // rosa claro
  purple: "#f3e8ff", // púrpura claro
  text: "#1f2937", // gris oscuro
  background: "#ffffff", // blanco
  gradient: ["#e0f2fe", "#f3e8ff", "#fce7f3"], // azul claro a rosa claro
}

// Definir las fuentes personalizadas
export const FONTS = {
  regular: "Montserrat-Regular",
  bold: "Montserrat-Bold",
  semiBold: "Montserrat-SemiBold",
  italic: "Montserrat-Italic",
}

export type Member = {
  id: string
  name: string
  avatar: string
}

export type Event = {
  id: string
  title: string
  date: string
  time: string
  color: string
  memberId?: string
  type?: string
  description?: string
  notificationId?: string // ID de la notificación asociada
}

// Nuevos tipos para listas de compras
export type ShoppingItem = {
  id: string
  name: string
  quantity: string
  category: string
  completed: boolean
  addedBy: string // ID del miembro que añadió el item
  addedAt: string // Fecha de añadido
}

export type ShoppingList = {
  id: string
  name: string
  items: ShoppingItem[]
  createdAt: string
  createdBy: string // ID del miembro que creó la lista
  forDate?: string // Fecha opcional para la que está planeada la compra
  notificationId?: string // ID de la notificación de recordatorio
}

// Nuevos tipos para calendario escolar
export type SchoolEvent = {
  id: string
  title: string
  date: string
  endDate?: string // Para eventos multi-día
  time?: string
  endTime?: string
  description?: string
  type: "exam" | "assignment" | "class" | "holiday" | "meeting" | "other"
  subject?: string
  memberId: string // ID del miembro de la familia (estudiante)
  color: string
  location?: string
  reminderSet?: boolean
  notificationId?: string // ID de notificación si está configurada
}

export type SchoolSubject = {
  id: string
  name: string
  color: string
  teacher?: string
  schedule?: {
    day: string // "monday", "tuesday", etc.
    startTime: string
    endTime: string
  }[]
  memberId: string // ID del miembro de la familia (estudiante)
}

interface FamilyState {
  members: Member[]
  events: Event[]
  shoppingLists: ShoppingList[]
  schoolEvents: SchoolEvent[]
  schoolSubjects: SchoolSubject[]
  
  addMember: (member: Member) => void
  updateMember: (id: string, member: Partial<Member>) => void
  removeMember: (id: string) => void
  addEvent: (event: Event) => Promise<Event>
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>
  removeEvent: (id: string) => Promise<void>
  
  // Funciones para listas de compras
  addShoppingList: (list: ShoppingList) => Promise<ShoppingList>
  updateShoppingList: (id: string, list: Partial<ShoppingList>) => Promise<void>
  removeShoppingList: (id: string) => Promise<void>
  addShoppingItem: (listId: string, item: ShoppingItem) => Promise<void>
  updateShoppingItem: (listId: string, itemId: string, item: Partial<ShoppingItem>) => Promise<void>
  removeShoppingItem: (listId: string, itemId: string) => Promise<void>
  toggleShoppingItem: (listId: string, itemId: string) => Promise<void>
  
  // Funciones para calendario escolar
  addSchoolEvent: (event: SchoolEvent) => Promise<SchoolEvent>
  updateSchoolEvent: (id: string, event: Partial<SchoolEvent>) => Promise<void>
  removeSchoolEvent: (id: string) => Promise<void>
  addSchoolSubject: (subject: SchoolSubject) => void
  updateSchoolSubject: (id: string, subject: Partial<SchoolSubject>) => void
  removeSchoolSubject: (id: string) => void
  
  clearAllData: () => Promise<void>
}

// Crear una función para debugg los estados y acciones
const logState = (message: string, state: any) => {
  console.log(`[FamilyStore] ${message}:`, state);
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      members: [],
      events: [],
      shoppingLists: [],
      schoolEvents: [],
      schoolSubjects: [],
      
      // Funciones para miembros
      addMember: (member) => {
        logState("Añadiendo miembro", member);
        set((state) => ({ 
          members: [...state.members, member] 
        }));
      },
      
      updateMember: (id, updatedMember) => {
        logState(`Actualizando miembro ${id}`, updatedMember);
        set((state) => ({
          members: state.members.map((member) => 
            member.id === id ? { ...member, ...updatedMember } : member
          ),
        }));
      },
      
      removeMember: (id) => {
        if (!id) {
          console.error("ID de miembro no válido");
          return;
        }
        
        logState(`Eliminando miembro ${id}`, {});
        const currentMembers = get().members;
        const currentEvents = get().events;
        const currentSchoolEvents = get().schoolEvents;
        const currentSchoolSubjects = get().schoolSubjects;
        
        // Verificar si el miembro existe
        const memberExists = currentMembers.some(member => member.id === id);
        if (!memberExists) {
          console.error(`No se encontró ningún miembro con ID: ${id}`);
          return;
        }

        // Cancelar notificaciones para eventos de este miembro
        currentEvents
          .filter(event => event.memberId === id && event.notificationId)
          .forEach(event => {
            if (event.notificationId) {
              cancelNotification(event.notificationId);
            }
          });
        
        // Cancelar notificaciones para eventos escolares
        currentSchoolEvents
          .filter(event => event.memberId === id && event.notificationId)
          .forEach(event => {
            if (event.notificationId) {
              cancelNotification(event.notificationId);
            }
          });
        
        // Filtrar miembros y eventos asociados
        const updatedMembers = currentMembers.filter(member => member.id !== id);
        const updatedEvents = currentEvents.filter(event => event.memberId !== id);
        const updatedSchoolEvents = currentSchoolEvents.filter(event => event.memberId !== id);
        const updatedSchoolSubjects = currentSchoolSubjects.filter(subject => subject.memberId !== id);
        
        // Actualizar el estado
        set({
          members: updatedMembers,
          events: updatedEvents,
          schoolEvents: updatedSchoolEvents,
          schoolSubjects: updatedSchoolSubjects
        });
        
        console.log(`Miembro con ID ${id} eliminado y sus datos asociados`);
      },
      
      // Funciones para eventos con notificaciones
      addEvent: async (event) => {
        logState("Añadiendo evento", event);
        
        let eventWithNotification = { ...event };
        
        // Si el evento tiene memberId, programar notificación
        if (event.memberId) {
          const member = get().members.find(m => m.id === event.memberId);
          const memberName = member ? member.name : null;
          
          // Programar notificación
          const notificationId = await scheduleEventNotification(event, memberName);
          
          if (notificationId) {
            eventWithNotification.notificationId = notificationId;
          }
        } else {
          // Evento general sin miembro específico
          const notificationId = await scheduleEventNotification(event);
          
          if (notificationId) {
            eventWithNotification.notificationId = notificationId;
          }
        }
        
        // Añadir evento al estado
        set((state) => ({ 
          events: [...state.events, eventWithNotification] 
        }));
        
        return eventWithNotification;
      },
      
      updateEvent: async (id, updatedEvent) => {
        if (!id) {
          console.error("ID de evento no válido");
          return;
        }
        
        logState(`Actualizando evento ${id}`, updatedEvent);
        
        const currentEvents = get().events;
        const eventToUpdate = currentEvents.find(event => event.id === id);
        
        if (!eventToUpdate) {
          console.error(`No se encontró el evento con ID: ${id}`);
          return;
        }
        
        // Si hay cambios en fecha, hora o título y existe una notificación anterior, cancelarla
        const dateChanged = updatedEvent.date && updatedEvent.date !== eventToUpdate.date;
        const timeChanged = updatedEvent.time && updatedEvent.time !== eventToUpdate.time;
        const titleChanged = updatedEvent.title && updatedEvent.title !== eventToUpdate.title;
        
        if ((dateChanged || timeChanged || titleChanged) && eventToUpdate.notificationId) {
          await cancelNotification(eventToUpdate.notificationId);
          
          // Crear evento actualizado para programar nueva notificación
          const updatedEventFull = { ...eventToUpdate, ...updatedEvent };
          
          // Buscar miembro si existe
          const memberName = updatedEventFull.memberId 
            ? get().members.find(m => m.id === updatedEventFull.memberId)?.name 
            : null;
          
          // Programar nueva notificación
          const newNotificationId = await scheduleEventNotification(updatedEventFull, memberName);
          
          // Actualizar el evento con el nuevo ID de notificación
          updatedEvent.notificationId = newNotificationId || undefined;
        }
        
        // Actualizar el evento en el estado
        set((state) => ({
          events: state.events.map((event) => 
            event.id === id ? { ...event, ...updatedEvent } : event
          ),
        }));
      },
      
      removeEvent: async (id) => {
        if (!id) {
          console.error("ID de evento no válido");
          return;
        }
        
        logState(`Eliminando evento ${id}`, {});
        
        const currentEvents = get().events;
        const eventToRemove = currentEvents.find(event => event.id === id);
        
        // Verificar si el evento existe
        if (!eventToRemove) {
          console.error(`No se encontró ningún evento con ID: ${id}`);
          return;
        }
        
        // Cancelar notificación asociada si existe
        if (eventToRemove.notificationId) {
          await cancelNotification(eventToRemove.notificationId);
        }
        
        // Filtrar el evento por su ID
        const updatedEvents = currentEvents.filter(event => event.id !== id);
        
        // Actualizar el estado
        set({ events: updatedEvents });
        
        console.log(`Evento con ID ${id} eliminado y notificación cancelada`);
      },
      
      // Funciones para listas de compras con notificaciones
      addShoppingList: async (list) => {
        logState("Añadiendo lista de compras", list);
        
        let listWithNotification = { ...list };
        
        // Si la lista tiene fecha, programar recordatorio para el día anterior
        if (list.forDate) {
          const forDateObj = new Date(list.forDate);
          // Configurar recordatorio para el día anterior a las 9 AM
          const reminderDate = new Date(forDateObj);
          reminderDate.setDate(reminderDate.getDate() - 1);
          reminderDate.setHours(9, 0, 0, 0);
          
          if (reminderDate > new Date()) { // Solo si la fecha es futura
            const notificationId = await scheduleShoppingListReminder(list, reminderDate);
            if (notificationId) {
              listWithNotification.notificationId = notificationId;
            }
          }
        }
        
        set((state) => ({ 
          shoppingLists: [...state.shoppingLists, listWithNotification]
        }));
        
        return listWithNotification;
      },
      
      updateShoppingList: async (id, updatedList) => {
        if (!id) {
          console.error("ID de lista de compras no válido");
          return;
        }
        
        logState(`Actualizando lista de compras ${id}`, updatedList);
        
        const currentLists = get().shoppingLists;
        const listToUpdate = currentLists.find(list => list.id === id);
        
        if (!listToUpdate) {
          console.error(`No se encontró la lista de compras con ID: ${id}`);
          return;
        }
        
        // Si se actualizó la fecha y existía una notificación, cancelarla y crear nueva
        if (updatedList.forDate && updatedList.forDate !== listToUpdate.forDate && listToUpdate.notificationId) {
          await cancelNotification(listToUpdate.notificationId);
          
          // Crear recordatorio para la nueva fecha (día anterior a las 9 AM)
          const forDateObj = new Date(updatedList.forDate);
          const reminderDate = new Date(forDateObj);
          reminderDate.setDate(reminderDate.getDate() - 1);
          reminderDate.setHours(9, 0, 0, 0);
          
          if (reminderDate > new Date()) {
            const updatedListFull = { ...listToUpdate, ...updatedList };
            const newNotificationId = await scheduleShoppingListReminder(updatedListFull, reminderDate);
            updatedList.notificationId = newNotificationId || undefined;
          } else {
            updatedList.notificationId = undefined;
          }
        }
        
        set((state) => ({
          shoppingLists: state.shoppingLists.map((list) => 
            list.id === id ? { ...list, ...updatedList } : list
          ),
        }));
      },
      
      removeShoppingList: async (id) => {
        if (!id) {
          console.error("ID de lista de compras no válido");
          return;
        }
        
        logState(`Eliminando lista de compras ${id}`, {});
        
        const currentLists = get().shoppingLists;
        const listToRemove = currentLists.find(list => list.id === id);
        
        if (!listToRemove) {
          console.error(`No se encontró la lista de compras con ID: ${id}`);
          return;
        }
        
        // Cancelar notificación asociada si existe
        if (listToRemove.notificationId) {
          await cancelNotification(listToRemove.notificationId);
        }
        
        set((state) => ({
          shoppingLists: state.shoppingLists.filter((list) => list.id !== id),
        }));
        
        console.log(`Lista de compras con ID ${id} eliminada y notificación cancelada`);
      },
      
      addShoppingItem: async (listId, item) => {
        if (!listId) {
          console.error("ID de lista de compras no válido");
          return;
        }
        
        logState(`Añadiendo item a lista ${listId}`, item);
        
        set((state) => ({
          shoppingLists: state.shoppingLists.map((list) => 
            list.id === listId 
              ? { ...list, items: [...list.items, item] } 
              : list
          ),
        }));
      },
      
      updateShoppingItem: async (listId, itemId, updatedItem) => {
        if (!listId || !itemId) {
          console.error("ID de lista o item no válido");
          return;
        }
        
        logState(`Actualizando item ${itemId} en lista ${listId}`, updatedItem);
        
        set((state) => ({
          shoppingLists: state.shoppingLists.map((list) => 
            list.id === listId 
              ? { 
                  ...list, 
                  items: list.items.map((item) => 
                    item.id === itemId ? { ...item, ...updatedItem } : item
                  ) 
                } 
              : list
          ),
        }));
      },
      
      removeShoppingItem: async (listId, itemId) => {
        if (!listId || !itemId) {
          console.error("ID de lista o item no válido");
          return;
        }
        
        logState(`Eliminando item ${itemId} de lista ${listId}`, {});
        
        set((state) => ({
          shoppingLists: state.shoppingLists.map((list) => 
            list.id === listId 
              ? { 
                  ...list, 
                  items: list.items.filter((item) => item.id !== itemId) 
                } 
              : list
          ),
        }));
      },
      
      toggleShoppingItem: async (listId, itemId) => {
        if (!listId || !itemId) {
          console.error("ID de lista o item no válido");
          return;
        }
        
        logState(`Cambiando estado de item ${itemId} en lista ${listId}`, {});
        
        set((state) => {
          // Buscar la lista y el ítem específico
          const targetList = state.shoppingLists.find(list => list.id === listId);
          if (!targetList) {
            console.error(`No se encontró la lista de compras con ID: ${listId}`);
            return state;
          }
          
          const targetItem = targetList.items.find(item => item.id === itemId);
          if (!targetItem) {
            console.error(`No se encontró el ítem con ID: ${itemId} en la lista ${listId}`);
            return state;
          }
          
          // Actualizar el estado de completed del ítem
          return {
            shoppingLists: state.shoppingLists.map((list) => 
              list.id === listId 
                ? { 
                    ...list, 
                    items: list.items.map((item) => 
                      item.id === itemId 
                        ? { ...item, completed: !item.completed } 
                        : item
                    ) 
                  } 
                : list
            ),
          };
        });
      },
      
      // Funciones para eventos escolares con notificaciones
      addSchoolEvent: async (event) => {
        logState("Añadiendo evento escolar", event);
        
        let eventWithNotification = { ...event };
        
        // Solo programar notificación si reminderSet es true
        if (event.reminderSet !== false) {
          const student = get().members.find(m => m.id === event.memberId);
          const studentName = student ? student.name : null;
          
          // Programar notificación para evento escolar
          const notificationId = await scheduleSchoolEventNotification(event, studentName);
          
          if (notificationId) {
            eventWithNotification.notificationId = notificationId;
          }
        }
        
        // Añadir evento al estado
        set((state) => ({ 
          schoolEvents: [...state.schoolEvents, eventWithNotification] 
        }));
        
        return eventWithNotification;
      },
      
      updateSchoolEvent: async (id, updatedEvent) => {
        if (!id) {
          console.error("ID de evento escolar no válido");
          return;
        }
        
        logState(`Actualizando evento escolar ${id}`, updatedEvent);
        
        const currentEvents = get().schoolEvents;
        const eventToUpdate = currentEvents.find(event => event.id === id);
        
        if (!eventToUpdate) {
          console.error(`No se encontró el evento escolar con ID: ${id}`);
          return;
        }
        
        // Determinar si necesitamos reprogramar la notificación
        const dateChanged = updatedEvent.date && updatedEvent.date !== eventToUpdate.date;
        const timeChanged = updatedEvent.time && updatedEvent.time !== eventToUpdate.time;
        const titleChanged = updatedEvent.title && updatedEvent.title !== eventToUpdate.title;
        const typeChanged = updatedEvent.type && updatedEvent.type !== eventToUpdate.type;
        const reminderSettingChanged = updatedEvent.reminderSet !== undefined && 
                                 updatedEvent.reminderSet !== eventToUpdate.reminderSet;
        
        // Verificar si hay cambios relevantes o si se activó/desactivó el recordatorio
        if ((dateChanged || timeChanged || titleChanged || typeChanged || reminderSettingChanged)) {
          // Si existe una notificación anterior, cancelarla
          if (eventToUpdate.notificationId) {
            await cancelNotification(eventToUpdate.notificationId);
            updatedEvent.notificationId = undefined; // Limpiar ID de notificación anterior
          }
          
          // Solo programar nueva notificación si reminderSet es true
          const newReminderSetting = updatedEvent.reminderSet !== undefined 
            ? updatedEvent.reminderSet 
            : eventToUpdate.reminderSet;
            
          if (newReminderSetting !== false) {
            // Crear evento actualizado completo
            const updatedEventFull = { ...eventToUpdate, ...updatedEvent };
            
            // Buscar estudiante
            const studentName = get().members.find(m => m.id === updatedEventFull.memberId)?.name;
            
            // Programar nueva notificación
            const newNotificationId = await scheduleSchoolEventNotification(updatedEventFull, studentName);
            
            if (newNotificationId) {
              updatedEvent.notificationId = newNotificationId;
            }
          }
        }
        
        // Actualizar el evento en el estado
        set((state) => ({
          schoolEvents: state.schoolEvents.map((event) => 
            event.id === id ? { ...event, ...updatedEvent } : event
          ),
        }));
      },
      
      removeSchoolEvent: async (id) => {
        if (!id) {
          console.error("ID de evento escolar no válido");
          return;
        }
        
        logState(`Eliminando evento escolar ${id}`, {});
        
        const currentEvents = get().schoolEvents;
        const eventToRemove = currentEvents.find(event => event.id === id);
        
        if (!eventToRemove) {
          console.error(`No se encontró el evento escolar con ID: ${id}`);
          return;
        }
        
        // Cancelar notificación asociada si existe
        if (eventToRemove.notificationId) {
          await cancelNotification(eventToRemove.notificationId);
        }
        
        // Actualizar el estado
        set((state) => ({
          schoolEvents: state.schoolEvents.filter((event) => event.id !== id),
        }));
        
        console.log(`Evento escolar con ID ${id} eliminado y notificación cancelada`);
      },
      
      // Funciones para materias escolares
      addSchoolSubject: (subject) => {
        if (!subject.memberId) {
          console.error("ID de miembro no proporcionado para la materia escolar");
          return;
        }
        
        logState("Añadiendo materia escolar", subject);
        set((state) => ({ 
          schoolSubjects: [...state.schoolSubjects, subject] 
        }));
      },
      
      updateSchoolSubject: (id, updatedSubject) => {
        if (!id) {
          console.error("ID de materia escolar no válido");
          return;
        }
        
        logState(`Actualizando materia escolar ${id}`, updatedSubject);
        set((state) => ({
          schoolSubjects: state.schoolSubjects.map((subject) => 
            subject.id === id ? { ...subject, ...updatedSubject } : subject
          ),
        }));
      },
      
      removeSchoolSubject: (id) => {
        if (!id) {
          console.error("ID de materia escolar no válido");
          return;
        }
        
        logState(`Eliminando materia escolar ${id}`, {});
        set((state) => ({
          schoolSubjects: state.schoolSubjects.filter((subject) => subject.id !== id),
        }));
      },
      
      // Limpiar todos los datos y cancelar todas las notificaciones
      clearAllData: async () => {
        console.log("Limpiando todos los datos");
        
        // Cancelar todas las notificaciones de eventos
        for (const event of get().events) {
          if (event.notificationId) {
            await cancelNotification(event.notificationId);
          }
        }
        
        // Cancelar todas las notificaciones de eventos escolares
        for (const event of get().schoolEvents) {
          if (event.notificationId) {
            await cancelNotification(event.notificationId);
          }
        }
        
        // Cancelar todas las notificaciones de listas de compras
        for (const list of get().shoppingLists) {
          if (list.notificationId) {
            await cancelNotification(list.notificationId);
          }
        }
        
        // Actualizar estado
        set({ 
          members: [], 
          events: [], 
          shoppingLists: [],
          schoolEvents: [],
          schoolSubjects: []
        });
        
        try {
          // Limpiar almacenamiento
          await AsyncStorage.removeItem("family-store");
          console.log("Todos los datos han sido eliminados de AsyncStorage");
        } catch (error) {
          console.error("Error al limpiar datos de AsyncStorage:", error);
        }
      }
    }),
    {
      name: "family-store", // Nombre simplificado para evitar problemas de versionado
      storage: createJSONStorage(() => AsyncStorage),
      // Añadimos opción para debugging
      partialize: (state) => ({
        members: state.members,
        events: state.events,
        shoppingLists: state.shoppingLists,
        schoolEvents: state.schoolEvents,
        schoolSubjects: state.schoolSubjects,
      }),
      // Configuramos onRehydrateStorage para depurar problemas de carga
      onRehydrateStorage: () => (state) => {
        console.log("Datos recuperados del almacenamiento:", state);
      },
    }
  )
)