"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, Alert } from "react-native"
import { Plus, Edit, ArrowLeft, Trash2 } from "lucide-react-native"
import { Calendar } from "react-native-calendars"
import { useFamilyStore, THEME_COLORS } from "../../stores/familyStore"
import AddFamilyMember from "../../components/AddFamilyMember"
import AddEvent from "../../components/AddEvent"
import { useNavigation } from "@react-navigation/native"

export default function FamilyMembers() {
  const { members, events, removeMember, removeEvent } = useFamilyStore((state) => ({
    members: state.members,
    events: state.events,
    removeMember: state.removeMember,
    removeEvent: state.removeEvent
  }))
  
  const [modalVisible, setModalVisible] = useState(false)
  const [expandedMember, setExpandedMember] = useState<string | null>(null)
  const [addEventModalVisible, setAddEventModalVisible] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [editMember, setEditMember] = useState(null)
  const navigation = useNavigation()
  
  // Para asegurar que la UI se actualiza cuando cambia el estado del store
  const [refresh, setRefresh] = useState(0)
  
  useEffect(() => {
    console.log("Miembros actuales:", members.length)
  }, [members, refresh])

  const getMemberEvents = (memberId: string) => {
    return events
      .filter((event) => event.memberId === memberId)
      .reduce((acc, event) => {
        acc[event.date] = { marked: true, dotColor: event.color }
        return acc
      }, {})
  }

  const handleDeleteMember = (id: string) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro que deseas eliminar a este miembro de la familia?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Eliminar", 
          onPress: () => {
            console.log('Eliminando miembro con ID:', id)
            removeMember(id)
            
            // Si el miembro eliminado es el que está expandido, cerramos la vista
            if (expandedMember === id) {
              setExpandedMember(null)
            }
            
            // Forzar actualización de la UI
            setRefresh(prev => prev + 1)
          },
          style: "destructive"
        }
      ]
    )
  }

  const handleDeleteEvent = (eventId: string) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro que deseas eliminar este evento?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Eliminar", 
          onPress: () => {
            console.log('Eliminando evento con ID:', eventId)
            removeEvent(eventId)
            
            // Forzar actualización de la UI
            setRefresh(prev => prev + 1)
          },
          style: "destructive"
        }
      ]
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.memberList}>
        {members.map((member, index) => (
          <View key={member.id} style={styles.memberSection}>
            <View style={[styles.memberCard, { backgroundColor: THEME_COLORS.gradient[index % 3] }]}>
              <TouchableOpacity 
                style={styles.memberInfo}
                onPress={() => setExpandedMember(expandedMember === member.id ? null : member.id)}
              >
                <Image source={{ uri: member.avatar }} style={styles.avatar} />
                <Text style={styles.memberName}>{member.name}</Text>
              </TouchableOpacity>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => {
                    setEditMember(member)
                    setModalVisible(true)
                  }}
                >
                  <Edit size={16} color={THEME_COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteMember(member.id)}
                >
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>

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
                
                {/* Lista de eventos del miembro */}
                <View style={styles.memberEventsList}>
                  <Text style={styles.eventsTitle}>Eventos próximos:</Text>
                  {events
                    .filter(event => event.memberId === member.id)
                    .slice(0, 3) // Mostramos solo los 3 primeros
                    .map((event, eventIndex) => (
                      <View key={eventIndex} style={[styles.eventItem, { backgroundColor: event.color }]}>
                        <View style={styles.eventDetails}>
                          <Text style={styles.eventTitle}>{event.title}</Text>
                          <Text style={styles.eventDate}>{event.date} - {event.time}</Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.deleteEventButton}
                          onPress={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                </View>
                
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
        onPress={() => {
          setEditMember(null) // Aseguramos que estamos en modo añadir, no editar
          setModalVisible(true)
        }}
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
            <AddFamilyMember 
              onClose={() => {
                setModalVisible(false)
                setRefresh(prev => prev + 1) // Actualizar UI después de añadir/editar
              }}
              memberToEdit={editMember}
            />
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
              onClose={() => {
                setAddEventModalVisible(false)
                setRefresh(prev => prev + 1) // Actualizar UI después de añadir evento
              }}
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
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME_COLORS.text,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 8,
    marginRight: 4,
  },
  deleteButton: {
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
  memberEventsList: {
    marginTop: 16,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  eventItem: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  eventDate: {
    fontSize: 12,
    marginTop: 2,
  },
  deleteEventButton: {
    padding: 8,
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