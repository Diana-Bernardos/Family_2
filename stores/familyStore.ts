// stores/familyStore.ts

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
  addEvent: (event: Event) => void
  updateEvent: (id: string, event: Partial<Event>) => void
  removeEvent: (id: string) => void
  
  // Funciones para listas de compras
  addShoppingList: (list: ShoppingList) => void
  updateShoppingList: (id: string, list: Partial<ShoppingList>) => void
  removeShoppingList: (id: string) => void
  addShoppingItem: (listId: string, item: ShoppingItem) => void
  updateShoppingItem: (listId: string, itemId: string, item: Partial<ShoppingItem>) => void
  removeShoppingItem: (listId: string, itemId: string) => void
  toggleShoppingItem: (listId: string, itemId: string) => void
  
  // Funciones para calendario escolar
  addSchoolEvent: (event: SchoolEvent) => void
  updateSchoolEvent: (id: string, event: Partial<SchoolEvent>) => void
  removeSchoolEvent: (id: string) => void
  addSchoolSubject: (subject: SchoolSubject) => void
  updateSchoolSubject: (id: string, subject: Partial<SchoolSubject>) => void
  removeSchoolSubject: (id: string) => void
  
  clearAllData: () => Promise<void>
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
      addMember: (member) => set((state) => ({ members: [...state.members, member] })),
      updateMember: (id, updatedMember) =>
        set((state) => ({
          members: state.members.map((member) => (member.id === id ? { ...member, ...updatedMember } : member)),
        })),
      removeMember: (id) => {
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
      
      // Funciones para eventos
      addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
      updateEvent: (id, updatedEvent) =>
        set((state) => ({
          events: state.events.map((event) => (event.id === id ? { ...event, ...updatedEvent } : event)),
        })),
      removeEvent: (id) => {
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
      
      // Funciones para listas de compras
      addShoppingList: (list) => set((state) => ({ 
        shoppingLists: [...state.shoppingLists, list]
      })),
      
      updateShoppingList: (id, updatedList) => set((state) => ({
        shoppingLists: state.shoppingLists.map((list) => 
          list.id === id ? { ...list, ...updatedList } : list
        ),
      })),
      
      removeShoppingList: (id) => set((state) => ({
        shoppingLists: state.shoppingLists.filter((list) => list.id !== id),
      })),
      
      addShoppingItem: (listId, item) => set((state) => ({
        shoppingLists: state.shoppingLists.map((list) => 
          list.id === listId 
            ? { ...list, items: [...list.items, item] } 
            : list
        ),
      })),
      
      updateShoppingItem: (listId, itemId, updatedItem) => set((state) => ({
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
      })),
      
      removeShoppingItem: (listId, itemId) => set((state) => ({
        shoppingLists: state.shoppingLists.map((list) => 
          list.id === listId 
            ? { 
                ...list, 
                items: list.items.filter((item) => item.id !== itemId) 
              } 
            : list
        ),
      })),
      
      toggleShoppingItem: (listId, itemId) => set((state) => ({
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
      })),
      
      // Funciones para eventos escolares
      addSchoolEvent: (event) => set((state) => ({ 
        schoolEvents: [...state.schoolEvents, event] 
      })),
      
      updateSchoolEvent: (id, updatedEvent) => set((state) => ({
        schoolEvents: state.schoolEvents.map((event) => 
          event.id === id ? { ...event, ...updatedEvent } : event
        ),
      })),
      
      removeSchoolEvent: (id) => set((state) => ({
        schoolEvents: state.schoolEvents.filter((event) => event.id !== id),
      })),
      
      // Funciones para materias escolares
      addSchoolSubject: (subject) => set((state) => ({ 
        schoolSubjects: [...state.schoolSubjects, subject] 
      })),
      
      updateSchoolSubject: (id, updatedSubject) => set((state) => ({
        schoolSubjects: state.schoolSubjects.map((subject) => 
          subject.id === id ? { ...subject, ...updatedSubject } : subject
        ),
      })),
      
      removeSchoolSubject: (id) => set((state) => ({
        schoolSubjects: state.schoolSubjects.filter((subject) => subject.id !== id),
      })),
      
      // Limpiar todos los datos
      clearAllData: async () => {
        set({ 
          members: [], 
          events: [], 
          shoppingLists: [],
          schoolEvents: [],
          schoolSubjects: []
        });
        
        try {
          await AsyncStorage.removeItem("family-store-v4");
          console.log("Todos los datos han sido eliminados");
        } catch (error) {
          console.error("Error al limpiar datos:", error);
        }
      }
    }),
    {
      name: "family-store-v4",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)