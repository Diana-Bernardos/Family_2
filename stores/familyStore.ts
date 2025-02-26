import type React from "react"
import { create } from "zustand"
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

interface FamilyStore {
  members: FamilyMember[]
  events: Event[]
  addMember: (member: FamilyMember) => void
  updateMember: (id: string, member: Partial<FamilyMember>) => void
  removeMember: (id: string) => void
  addEvent: (event: Event) => void
  updateEvent: (id: string, event: Partial<Event>) => void
  removeEvent: (id: string) => void
}

export const THEME_COLORS = {
  primary: "#1F2937",
  pink: "#FFE4E1",
  green: "#D0F0C0",
  blue: "#B0E0E6",
  gradient: ["#FFE4E1", "#D0F0C0", "#B0E0E6"],
  text: "#333333",
  background: "#FFFFFF",
}

export const useFamilyStore = create<FamilyStore>((set) => ({
  members: [],
  events: [],
  addMember: (member) =>
    set((state) => {
      const newMembers = [...state.members, member]
      AsyncStorage.setItem("familyMembers", JSON.stringify(newMembers))
      return { members: newMembers }
    }),
  updateMember: (id, member) =>
    set((state) => {
      const newMembers = state.members.map((m) => (m.id === id ? { ...m, ...member } : m))
      AsyncStorage.setItem("familyMembers", JSON.stringify(newMembers))
      return { members: newMembers }
    }),
  removeMember: (id) =>
    set((state) => {
      const newMembers = state.members.filter((m) => m.id !== id)
      AsyncStorage.setItem("familyMembers", JSON.stringify(newMembers))
      return { members: newMembers }
    }),
  addEvent: (event) =>
    set((state) => {
      const newEvents = [...state.events, event]
      AsyncStorage.setItem("familyEvents", JSON.stringify(newEvents))
      return { events: newEvents }
    }),
  updateEvent: (id, event) =>
    set((state) => {
      const newEvents = state.events.map((e) => (e.id === id ? { ...e, ...event } : e))
      AsyncStorage.setItem("familyEvents", JSON.stringify(newEvents))
      return { events: newEvents }
    }),
  removeEvent: (id) =>
    set((state) => {
      const newEvents = state.events.filter((e) => e.id !== id)
      AsyncStorage.setItem("familyEvents", JSON.stringify(newEvents))
      return { events: newEvents }
    }),
}))

// Initialize store with saved data
const initializeStore = async () => {
  try {
    const members = await AsyncStorage.getItem("familyMembers")
    const events = await AsyncStorage.getItem("familyEvents")

    if (members) {
      useFamilyStore.setState({ members: JSON.parse(members) })
    }
    if (events) {
      useFamilyStore.setState({ events: JSON.parse(events) })
    }
  } catch (error) {
    console.error("Error loading stored data:", error)
  }
}

initializeStore()

