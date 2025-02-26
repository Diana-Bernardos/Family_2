import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"

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
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      members: [
        {
          id: "1",
          name: "Juan",
          avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200",
        },
        {
          id: "2",
          name: "María",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
        },
        {
          id: "3",
          name: "Pedro",
          avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200",
        },
      ],
      events: [
        {
          id: "1",
          title: "Reunión de trabajo",
          date: "2023-05-20",
          time: "09:00",
          color: THEME_COLORS.blue,
          memberId: "1",
          type: "trabajo",
        },
        {
          id: "2",
          title: "Cita médica",
          date: "2023-05-22",
          time: "16:30",
          color: THEME_COLORS.green,
          memberId: "2",
          type: "salud",
        },
        {
          id: "3",
          title: "Clase de piano",
          date: "2023-05-21",
          time: "18:00",
          color: THEME_COLORS.yellow,
          memberId: "3",
          type: "escuela",
        },
      ],
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
    }),
    {
      name: "family-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)