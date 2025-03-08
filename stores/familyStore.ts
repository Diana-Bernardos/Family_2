import type React from "react"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface FamilyMember {
  id: string
  name: string
  avatar?: string
}

interface Event {
  id: string
  title: string
  date: string
  time: string
  color: string
  icon?: React.ReactNode
  memberId?: string
}

interface ShoppingItem {
  id: string
  name: string
  completed: boolean
  quantity?: string
  addedBy?: string
  category?: string
}

interface SchoolActivity {
  id: string
  title: string
  date: string
  time?: string
  description?: string
  location?: string
  studentId?: string
  color: string
}

interface Notification {
  id: string
  title: string
  message: string
  date: string
  time: string
  read: boolean
  type: "event" | "shopping" | "school" | "reminder" | "system"
  relatedId?: string
}

interface FamilyStore {
  members: FamilyMember[]
  events: Event[]
  shoppingList: ShoppingItem[]
  schoolActivities: SchoolActivity[]
  notifications: Notification[]

  // Miembros de familia
  addMember: (member: FamilyMember) => void
  updateMember: (id: string, member: Partial<FamilyMember>) => void
  removeMember: (id: string) => void

  // Eventos
  addEvent: (event: Event) => void
  updateEvent: (id: string, event: Partial<Event>) => void
  removeEvent: (id: string) => void

  // Lista de compras
  addShoppingItem: (item: ShoppingItem) => void
  updateShoppingItem: (id: string, item: Partial<ShoppingItem>) => void
  removeShoppingItem: (id: string) => void
  toggleShoppingItem: (id: string) => void

  // Actividades escolares
  addSchoolActivity: (activity: SchoolActivity) => void
  updateSchoolActivity: (id: string, activity: Partial<SchoolActivity>) => void
  removeSchoolActivity: (id: string) => void

  // Notificaciones
  addNotification: (notification: Notification) => void
  markNotificationAsRead: (id: string) => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void

  // Carga de datos
  loadData: () => Promise<void>
  
  // Control de inicialización
  isInitialized: boolean
  setInitialized: (value: boolean) => void
}

// Función de ayuda para depuración
const debug = (message: string, data?: any) => {
  console.log(`[FamilyStore] ${message}`, data !== undefined ? data : '');
};

// Crear store con persist middleware para guardar automáticamente
export const useFamilyStore = create<FamilyStore>()(
  persist(
    (set, get) => ({
      members: [],
      events: [],
      shoppingList: [],
      schoolActivities: [],
      notifications: [],
      isInitialized: false,

      // Control de inicialización
      setInitialized: (value) => set({ isInitialized: value }),

      // Miembros de familia
      addMember: (member) => {
        debug("Añadiendo miembro:", member);
        set((state) => ({
          members: [...state.members, member]
        }));
      },
      
      updateMember: (id, member) => {
        debug(`Actualizando miembro ${id}:`, member);
        set((state) => ({
          members: state.members.map((m) => (m.id === id ? { ...m, ...member } : m))
        }));
      },
      
      removeMember: (id) => {
        debug(`Eliminando miembro ${id}`);
        set((state) => {
          // También eliminamos todos los eventos asociados a este miembro
          const newEvents = state.events.filter((e) => e.memberId !== id);
          
          // Eliminamos actividades escolares asociadas
          const newSchoolActivities = state.schoolActivities.filter((a) => a.studentId !== id);

          return {
            members: state.members.filter((m) => m.id !== id),
            events: newEvents,
            schoolActivities: newSchoolActivities,
          };
        });
      },

      // Eventos
      addEvent: (event) => {
        debug("Añadiendo evento:", event);
        set((state) => {
          // Crear notificación para el nuevo evento
          const newNotification: Notification = {
            id: Date.now().toString(),
            title: "Nuevo evento familiar",
            message: `Se ha creado el evento "${event.title}" para el ${event.date} a las ${event.time}`,
            date: new Date().toISOString().split("T")[0],
            time: new Date().toTimeString().split(" ")[0].substring(0, 5),
            read: false,
            type: "event",
            relatedId: event.id,
          };

          return {
            events: [...state.events, event],
            notifications: [...state.notifications, newNotification],
          };
        });
      },
      
      updateEvent: (id, event) => {
        debug(`Actualizando evento ${id}:`, event);
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...event } : e)),
        }));
      },
      
      removeEvent: (id) => {
        debug(`Eliminando evento ${id}`);
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        }));
      },

      // Lista de compras
      addShoppingItem: (item) => {
        debug("Añadiendo item de compra:", item);
        set((state) => ({
          shoppingList: [...state.shoppingList, item],
        }));
      },
      
      updateShoppingItem: (id, item) => {
        debug(`Actualizando item de compra ${id}:`, item);
        set((state) => ({
          shoppingList: state.shoppingList.map((i) => (i.id === id ? { ...i, ...item } : i)),
        }));
      },
      
      removeShoppingItem: (id) => {
        debug(`Eliminando item de compra ${id}`);
        set((state) => ({
          shoppingList: state.shoppingList.filter((i) => i.id !== id),
        }));
      },
      
      toggleShoppingItem: (id) => {
        debug(`Cambiando estado de item de compra ${id}`);
        set((state) => ({
          shoppingList: state.shoppingList.map((i) => 
            i.id === id ? { ...i, completed: !i.completed } : i
          ),
        }));
      },

      // Actividades escolares
      addSchoolActivity: (activity) => {
        debug("Añadiendo actividad escolar:", activity);
        set((state) => {
          // Crear notificación para la nueva actividad escolar
          const newNotification: Notification = {
            id: Date.now().toString(),
            title: "Nueva actividad escolar",
            message: `Se ha añadido la actividad "${activity.title}" para el ${activity.date}${activity.time ? ` a las ${activity.time}` : ""}`,
            date: new Date().toISOString().split("T")[0],
            time: new Date().toTimeString().split(" ")[0].substring(0, 5),
            read: false,
            type: "school",
            relatedId: activity.id,
          };

          return {
            schoolActivities: [...state.schoolActivities, activity],
            notifications: [...state.notifications, newNotification],
          };
        });
      },
      
      updateSchoolActivity: (id, activity) => {
        debug(`Actualizando actividad escolar ${id}:`, activity);
        set((state) => ({
          schoolActivities: state.schoolActivities.map((a) => 
            a.id === id ? { ...a, ...activity } : a
          ),
        }));
      },
      
      removeSchoolActivity: (id) => {
        debug(`Eliminando actividad escolar ${id}`);
        set((state) => ({
          schoolActivities: state.schoolActivities.filter((a) => a.id !== id),
        }));
      },

      // Notificaciones
      addNotification: (notification) => {
        debug("Añadiendo notificación:", notification);
        set((state) => ({
          notifications: [...state.notifications, notification],
        }));
      },
      
      markNotificationAsRead: (id) => {
        debug(`Marcando notificación ${id} como leída`);
        set((state) => ({
          notifications: state.notifications.map((n) => 
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },
      
      removeNotification: (id) => {
        debug(`Eliminando notificación ${id}`);
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },
      
      clearAllNotifications: () => {
        debug("Limpiando todas las notificaciones");
        set({ notifications: [] });
      },

      // Carga de datos
      loadData: async () => {
        debug("Cargando datos almacenados");
        try {
          // Esta función ya no es necesaria con persist, pero la mantenemos para compatibilidad
          set({ isInitialized: true });
          debug("Datos cargados correctamente");
        } catch (error) {
          console.error("Error loading stored data:", error);
          debug("Error al cargar datos", error);
        }
      },
    }),
    {
      name: "family-store", // Nombre para el almacenamiento
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Especifica qué partes del estado se persisten
        members: state.members,
        events: state.events,
        shoppingList: state.shoppingList,
        schoolActivities: state.schoolActivities,
        notifications: state.notifications,
      }),
      // Función que se ejecuta cuando se rehidratan los datos
      onRehydrateStorage: () => (state) => {
        if (state) {
          debug("Estado rehidratado desde almacenamiento");
          state.isInitialized = true;
        }
      },
    }
  )
);

// Función de ayuda para obtener el store directamente
export const getStore = () => useFamilyStore.getState();