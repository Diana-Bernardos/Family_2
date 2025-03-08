"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, Image } from "react-native"
import { Calendar as CalendarComponent } from "react-native-calendars"
import { Plus, Trash2, MapPin, Clock, BookOpen } from "lucide-react-native"
import { useFamilyStore } from "../../stores/familyStore"
import AddSchoolActivity from "../../components/AddSchoolActivity"
import { THEME_COLORS } from "../../constants/theme"

export default function SchoolCalendar() {
  const [selected, setSelected] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const { schoolActivities, removeSchoolActivity, members } = useFamilyStore()

  const markedDates = schoolActivities.reduce((acc, activity) => {
    acc[activity.date] = {
      marked: true,
      dotColor: activity.color || THEME_COLORS.primary,
    }
    return acc
  }, {})

  const handleDeleteActivity = (id: string) => {
    Alert.alert("Eliminar actividad", "¿Estás seguro de que quieres eliminar esta actividad escolar?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => removeSchoolActivity(id),
      },
    ])
  }

  // Función para encontrar el estudiante asociado a una actividad
  const findStudentForActivity = (studentId?: string) => {
    if (!studentId) return null
    return members.find((m) => m.id === studentId)
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

      <Text style={styles.activitiesTitle}>{selected ? `Actividades para ${selected}` : "Selecciona una fecha"}</Text>

      <ScrollView style={styles.activityList}>
        {schoolActivities
          .filter((activity) => activity.date === selected)
          .map((activity) => {
            const student = findStudentForActivity(activity.studentId)
            return (
              <View key={activity.id} style={[styles.activityCard, { borderLeftColor: activity.color }]}>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>

                  {activity.time && (
                    <View style={styles.activityDetail}>
                      <Clock size={14} color="#6b7280" />
                      <Text style={styles.activityDetailText}>{activity.time}</Text>
                    </View>
                  )}

                  {activity.location && (
                    <View style={styles.activityDetail}>
                      <MapPin size={14} color="#6b7280" />
                      <Text style={styles.activityDetailText}>{activity.location}</Text>
                    </View>
                  )}

                  {activity.description && <Text style={styles.activityDescription}>{activity.description}</Text>}

                  {student && (
                    <View style={styles.studentInfo}>
                      <Image source={{ uri: student.avatar }} style={styles.studentAvatar} />
                      <Text style={styles.studentName}>{student.name}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteActivity(activity.id)}>
                  <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )
          })}
        {selected && schoolActivities.filter((a) => a.date === selected).length === 0 && (
          <View style={styles.emptyState}>
            <BookOpen size={48} color="#d1d5db" />
            <Text style={styles.emptyStateText}>No hay actividades escolares para esta fecha</Text>
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
            <AddSchoolActivity onClose={() => setModalVisible(false)} selectedDate={selected} />
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
  activitiesTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  activityList: {
    flex: 1,
    padding: 16,
  },
  activityCard: {
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
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 6,
  },
  activityDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  activityDetailText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 6,
  },
  activityDescription: {
    fontSize: 14,
    color: "#4b5563",
    marginTop: 8,
    lineHeight: 20,
  },
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#f3f4f6",
    padding: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  studentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  studentName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4b5563",
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
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

