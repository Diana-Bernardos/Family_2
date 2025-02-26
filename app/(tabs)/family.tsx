"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal } from "react-native"
import { Plus, CreditCard as Edit, ArrowLeft } from "lucide-react-native"
import { Calendar } from "react-native-calendars"
import { useFamilyStore, THEME_COLORS } from "../../stores/familyStore"
import AddFamilyMember from "../../components/AddFamilyMember"
import AddEvent from "../../components/AddEvent"
import { useNavigation } from "@react-navigation/native"

export default function FamilyMembers() {
  const { members, events } = useFamilyStore()
  const [modalVisible, setModalVisible] = useState(false)
  const [expandedMember, setExpandedMember] = useState<string | null>(null)
  const [addEventModalVisible, setAddEventModalVisible] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const navigation = useNavigation()

  const getMemberEvents = (memberId: string) => {
    return events
      .filter((event) => event.memberId === memberId)
      .reduce((acc, event) => {
        acc[event.date] = { marked: true, dotColor: event.color }
        return acc
      }, {})
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.memberList}>
        {members.map((member, index) => (
          <View key={index} style={styles.memberSection}>
            <TouchableOpacity
              style={[styles.memberCard, { backgroundColor: THEME_COLORS.gradient[index % 3] }]}
              onPress={() => setExpandedMember(expandedMember === member.id ? null : member.id)}
            >
              <Image source={{ uri: member.avatar }} style={styles.avatar} />
              <Text style={styles.memberName}>{member.name}</Text>
              <TouchableOpacity style={styles.editButton}>
                <Edit size={16} color={THEME_COLORS.primary} />
              </TouchableOpacity>
            </TouchableOpacity>

            {expandedMember === member.id && (
              <View style={styles.calendarContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setExpandedMember(null)}>
                  <ArrowLeft color={THEME_COLORS.primary} size={24} />
                </TouchableOpacity>
                <Calendar
                  markedDates={getMemberEvents(member.id)}
                  theme={{
                    todayTextColor: THEME_COLORS.primary,
                    selectedDayBackgroundColor: THEME_COLORS.primary,
                    arrowColor: THEME_COLORS.primary,
                  }}
                  onDayPress={(day) => {
                    setSelectedDate(day.dateString)
                    setSelectedMemberId(member.id)
                    setAddEventModalVisible(true)
                  }}
                />
                <TouchableOpacity
                  style={styles.addEventButton}
                  onPress={() => {
                    setSelectedMemberId(member.id)
                    setAddEventModalVisible(true)
                  }}
                >
                  <Text style={styles.addEventText}>Añadir Evento</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: THEME_COLORS.primary }]}
        onPress={() => setModalVisible(true)}
      >
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
            <AddFamilyMember onClose={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <Modal
        visible={addEventModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddEventModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <AddEvent
              onClose={() => setAddEventModalVisible(false)}
              selectedDate={selectedDate}
              memberId={selectedMemberId || undefined}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    // Eliminamos el paddingTop
  },
  memberList: {
    padding: 16,
  },
  memberSection: {
    marginBottom: 16,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  memberName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: THEME_COLORS.text,
  },
  editButton: {
    padding: 8,
  },
  calendarContainer: {
    backgroundColor: THEME_COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
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
    backgroundColor: THEME_COLORS.background,
    borderRadius: 12,
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
  },
  addEventButton: {
    backgroundColor: THEME_COLORS.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  addEventText: {
    color: THEME_COLORS.background,
    fontSize: 14,
    fontWeight: "bold",
  },
})

