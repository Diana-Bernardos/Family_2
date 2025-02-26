"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from "react-native"
import { Calendar as CalendarComponent } from "react-native-calendars"
import { Plus, ArrowLeft } from "lucide-react-native"
import { useFamilyStore, THEME_COLORS } from "../../stores/familyStore"
import AddEvent from "../../components/AddEvent"
import { useNavigation } from "@react-navigation/native"

export default function FamilyCalendar() {
  const [selected, setSelected] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const { events } = useFamilyStore()
  const navigation = useNavigation()

  const markedDates = events.reduce((acc, event) => {
    acc[event.date] = {
      marked: true,
      dotColor: event.color || THEME_COLORS.primary,
    }
    return acc
  }, {})

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ArrowLeft color={THEME_COLORS.primary} size={24} />
      </TouchableOpacity>

      <View style={styles.calendarContainer}>
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
          }}
        />
      </View>

      <ScrollView style={styles.eventList}>
        {events
          .filter((event) => event.date === selected)
          .map((event, index) => (
            <View key={index} style={[styles.eventCard, { backgroundColor: event.color }]}>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventTime}>{event.time}</Text>
              </View>
            </View>
          ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => selected && setModalVisible(true)}>
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
    backgroundColor: "transparent",
  },
  calendarContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    margin: 10,
    overflow: "hidden",
  },
  eventList: {
    flex: 1,
    padding: 16,
  },
  eventCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  eventTime: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
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
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
})

