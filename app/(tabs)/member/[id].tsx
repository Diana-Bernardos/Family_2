"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal } from "react-native"
import { Calendar as CalendarComponent } from "react-native-calendars"
import { Plus, Calendar, ArrowLeft } from "lucide-react-native"
import { useFamilyStore } from "../../../stores/familyStore"
import AddEvent from "../../../components/AddEvent"
import { THEME_COLORS } from "../../../constants/theme"
import { useLocalSearchParams, useRouter, Stack } from "expo-router"

export default function MemberCalendar() {
  const { id } = useLocalSearchParams()
  const memberId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : ""
  const router = useRouter()
  const [selected, setSelected] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const { events, members } = useFamilyStore()
  const [member, setMember] = useState<any>(null)

  // Obtener el miembro específico y sus eventos
  useEffect(() => {
    if (memberId) {
      const foundMember = members.find((m) => m.id === memberId)
      setMember(foundMember)
    }
  }, [memberId, members])

  // Filtrar eventos solo para este miembro
  const memberEvents = events.filter((event) => event.memberId === memberId)

  const markedDates = memberEvents.reduce((acc, event) => {
    acc[event.date] = {
      marked: true,
      dotColor: event.color || THEME_COLORS.primary,
    }
    return acc
  }, {})

  if (!member) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header con botón de regreso */}
      <Stack.Screen
        options={{
          title: `Calendario de ${member.name}`,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={THEME_COLORS.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Perfil del miembro */}
      <View style={styles.profileSection}>
        <Image source={{ uri: member.avatar }} style={styles.avatar} />
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.eventCount}>
          {memberEvents.length} {memberEvents.length === 1 ? "evento" : "eventos"}
        </Text>
      </View>

      <CalendarComponent
        onDayPress={(day) => setSelected(day.dateString)}
        markedDates={{
          ...markedDates,
          [selected]: {
            selected: true,
            selectedColor: THEME_COLORS.primary,
          },
        }}
        theme={{
          todayTextColor: THEME_COLORS.primary,
          selectedDayBackgroundColor: THEME_COLORS.primary,
          arrowColor: THEME_COLORS.primary,
          textDayFontWeight: "600",
          textMonthFontWeight: "bold",
          textDayHeaderFontWeight: "bold",
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
          dayTextColor: "#1f2937",
          monthTextColor: "#1f2937",
          indicatorColor: THEME_COLORS.primary,
        }}
      />

      <Text style={styles.eventsTitle}>{selected ? `Eventos para ${selected}` : "Selecciona una fecha"}</Text>

      <ScrollView style={styles.eventList}>
        {memberEvents
          .filter((event) => event.date === selected)
          .map((event) => (
            <View key={event.id} style={[styles.eventCard, { borderLeftColor: event.color }]}>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventTime}>{event.time}</Text>
              </View>
            </View>
          ))}
        {selected && memberEvents.filter((e) => e.date === selected).length === 0 && (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#d1d5db" />
            <Text style={styles.emptyStateText}>No hay eventos para esta fecha</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => selected && setModalVisible(true)} disabled={!selected}>
        <Plus color="white" size={24} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <AddEvent onClose={() => setModalVisible(false)} selectedDate={selected} preselectedMemberId={memberId} />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileSection: {
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  memberName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  eventCount: {
    fontSize: 14,
    color: "#6b7280",
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  eventList: {
    flex: 1,
    padding: 16,
  },
  eventCard: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: "#6b7280",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6b7280",
    marginTop: 16,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    maxHeight: "80%",
  },
})

