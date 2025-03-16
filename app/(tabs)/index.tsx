"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal } from "react-native"
import { Calendar as CalendarComponent } from "react-native-calendars"
import { Plus, Calendar } from "lucide-react-native"
import { useFamilyStore } from "../../stores/familyStore"
import AddEvent from "../../components/AddEvent"
import ShareButton from "../../components/SimpleShareButton"
import { THEME_COLORS } from "../../constants/theme"
import { useRouter } from "expo-router"

export default function FamilyCalendar() {
  const [selected, setSelected] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const { events, members } = useFamilyStore()
  const router = useRouter()

  const markedDates = events.reduce((acc, event) => {
    acc[event.date] = {
      marked: true,
      dotColor: event.color || THEME_COLORS.primary,
    }
    return acc
  }, {})

  // Función para encontrar el miembro asociado a un evento
  const findMemberForEvent = (memberId?: string) => {
    if (!memberId) return null
    return members.find((m) => m.id === memberId)
  }

  // Función para navegar al calendario personal
  const navigateToMemberCalendar = (memberId: string) => {
    router.push(`/member/${memberId}`)
  }

  return (
    <View style={styles.container}>
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

      <View style={styles.familySection}>
        <Text style={styles.familyTitle}>Familia</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.familyAvatars}>
          {members.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={styles.familyMember}
              onPress={() => navigateToMemberCalendar(member.id)}
              activeOpacity={0.7}
            >
              <Image source={{ uri: member.avatar }} style={styles.familyAvatar} />
              <Text style={styles.familyName}>{member.name}</Text>
            </TouchableOpacity>
          ))}
          {members.length === 0 && <Text style={styles.noMembers}>No hay miembros en la familia</Text>}
        </ScrollView>
      </View>

      <Text style={styles.eventsTitle}>{selected ? `Eventos para ${selected}` : "Selecciona una fecha"}</Text>

      <ScrollView style={styles.eventList}>
        {events
          .filter((event) => event.date === selected)
          .map((event) => {
            const member = findMemberForEvent(event.memberId)
            return (
              <View key={event.id} style={[styles.eventCard, { borderLeftColor: event.color }]}>
                <View style={styles.eventInfo}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    
                    {/* Botón de compartir implementado aquí */}
                    <ShareButton 
                      contentId={event.id}
                      contentType="event"
                      contentTitle={event.title}
                      size={18}
                    />
                  </View>
                  <Text style={styles.eventTime}>{event.time}</Text>

                  {member && (
                    <TouchableOpacity
                      style={styles.memberInfo}
                      onPress={() => navigateToMemberCalendar(member.id)}
                      activeOpacity={0.7}
                    >
                      <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                      <Text style={styles.memberName}>{member.name}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )
          })}
        {selected && events.filter((e) => e.date === selected).length === 0 && (
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
            <AddEvent onClose={() => setModalVisible(false)} selectedDate={selected} />
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
  familySection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  familyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: THEME_COLORS.primary,
    marginBottom: 12,
  },
  familyAvatars: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  familyMember: {
    alignItems: "center",
    marginRight: 16,
  },
  familyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  familyName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
  },
  noMembers: {
    fontSize: 14,
    color: "#9ca3af",
    alignSelf: "center",
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
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
  },
  eventTime: {
    fontSize: 14,
    color: "#6b7280",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#f3f4f6",
    padding: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  memberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  memberName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4b5563",
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