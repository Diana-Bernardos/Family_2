import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Limpiar explícitamente el almacenamiento anterior
// Esta función se ejecuta cuando se importa este archivo
const cleanStorage = async () => {
  try {
    await AsyncStorage.removeItem("family-store");
    await AsyncStorage.removeItem("family-store-v2");
    console.log("Almacenamiento limpiado correctamente");
  } catch (error) {
    console.error("Error al limpiar almacenamiento:", error);
  }
};

// Ejecutar limpieza inmediatamente
cleanStorage();

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
  type?: string  // Añadimos el campo type para categorizar eventos
  description?: string  // Campo opcional para descripción más detallada
}

interface FamilyState {
  members: Member[]
  events: Event[]
  addMember: (member: Member) => void
  updateMember: (id: string, member: Partial<Member>) => void
  removeMember: (id: string) => void
  addEvent: (event: Event) => void
  updateEvent: (id: string, event: Partial<Event>) => void
  removeEvent: (id: string) => void
  clearAllData: () => Promise<void>  // Nueva función para limpiar todos los datos
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      // Iniciamos con arrays vacíos
      members: [],
      events: [],
      
      addMember: (member) => set((state) => ({ members: [...state.members, member] })),
      updateMember: (id, updatedMember) =>
        set((state) => ({
          members: state.members.map((member) => (member.id === id ? { ...member, ...updatedMember } : member)),
        })),
      removeMember: (id) => {
        // Obtener el estado actual antes de la actualización
        const currentMembers = get().members;
        const currentEvents = get().events;
        
        // Verificar si el miembro existe
        const memberExists = currentMembers.some(member => member.id === id);
        if (!memberExists) {
          console.error(`No se encontró ningún miembro con ID: ${id}`);
          return;
        }
        
        // Filtrar miembros y eventos asociados
        const updatedMembers = currentMembers.filter(member => member.id !== id);
        const updatedEvents = currentEvents.filter(event => event.memberId !== id);
        
        // Actualizar el estado
        set({
          members: updatedMembers,
          events: updatedEvents
        });
        
        console.log(`Miembro con ID ${id} eliminado y sus eventos asociados`);
      },
      addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
      updateEvent: (id, updatedEvent) =>
        set((state) => ({
          events: state.events.map((event) => (event.id === id ? { ...event, ...updatedEvent } : event)),
        })),
      removeEvent: (id) => {
        // Obtener los eventos actuales
        const currentEvents = get().events;
        
        // Verificar si el evento existe
        const eventExists = currentEvents.some(event => event.id === id);
        if (!eventExists) {
          console.error(`No se encontró ningún evento con ID: ${id}`);
          return;
        }
        
        // Filtrar el evento por su ID
        const updatedEvents = currentEvents.filter(event => event.id !== id);
        
        // Actualizar el estado
        set({ events: updatedEvents });
        
        console.log(`Evento con ID ${id} eliminado`);
      },
      clearAllData: async () => {
        // Limpiar todos los datos del estado
        set({ members: [], events: [] });
        
        // Limpiar también el almacenamiento para asegurar que los datos no se restauren
        try {
          await AsyncStorage.removeItem("family-store-v3");
          console.log("Todos los datos han sido eliminados");
        } catch (error) {
          console.error("Error al limpiar datos:", error);
        }
      }
    }),
    {
      name: "family-store-v3", // Cambiar el nombre del store para evitar conflictos
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)