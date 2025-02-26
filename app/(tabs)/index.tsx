"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Image, Alert } from "react-native"
import { Calendar as CalendarComponent } from "react-native-calendars"
import { Plus, ArrowLeft, Book, ShoppingCart, Briefcase, HeartPulse, Utensils, Dumbbell, Trash2 } from "lucide-react-native"
import { useFamilyStore, THEME_COLORS } from "../../stores/familyStore"
import AddEvent from "../../components/AddEvent"
import { useNavigation } from "@react-navigation/native"
import { router } from "expo-router"

// Mapa de tipos de eventos a iconos
const eventIcons = {
  trabajo: Briefcase,
  escuela: Book,
  compras: ShoppingCart,
  salud: HeartPulse,
  comida: Utensils,
  ejercicio: Dumbbell,
  // Puedes añadir más tipos según necesites
}

export default function FamilyCalendar() {
  const { events, members, removeEvent } = useFamilyStore((state) => ({
    events: state.events,
    members: state.members,
    removeEvent: state.removeEvent
  }))
  
  const [selected, setSelected] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [eventToEdit, setEventToEdit] = useState(null)
  const navigation = useNavigation()
  
  // Para asegurar que la UI se actualiza cuando cambia el estado del store
  const [refresh, setRefresh] = useState(0)
  
  useEffect(() => {
    console.log("Eventos actuales:", events.length)
  }, [events, refresh])

  const markedDates = events.reduce((acc, event) => {
    acc[event.date] = {
      marked: true,
      dotColor: event.color || THEME_COLORS.primary,
    }
    return acc
  }, {})

  // Navegar al calendario personal de un miembro
  const navigateToPersonalCalendar = (memberId) => {
    router.push({
      pathname: "/personal",
      params: { memberId },
    })
  }

  const handleDeleteEvent = (eventId: string) => {
    console.log('Intentando eliminar evento con ID:', eventId)
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
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ArrowLeft color={THEME_COLORS.primary} size={24} />
      </TouchableOpacity>

      {/* Sección de fotos de miembros de la familia */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.familyAvatars}>
        {members.map((member) => (
          <TouchableOpacity 
            key={member.id} 
            style={styles.avatarContainer}
            onPress={() => navigateToPersonalCalendar(member.id)}
          >
            <Image source={{ uri: member.avatar }} style={styles.avatar} />
            <Text style={styles.memberName}>{member.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
          .map((event, index) => {
            // Determinar qué icono mostrar basado en el tipo de evento
            const IconComponent = event.type && eventIcons[event.type] ? eventIcons[event.type] : Briefcase;
            
            // Encontrar el miembro al que pertenece este evento
            const member = members.find(m => m.id === event.memberId);
            
            return (
              <View key={event.id} style={[styles.eventCard, { backgroundColor: event.color }]}>
                <View style={styles.eventIconContainer}>
                  <IconComponent size={24} color="#1f2937" />
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventTime}>{event.time}</Text>
                  {member && (
                    <View style={styles.eventMember}>
                      <Image source={{ uri: member.avatar }} style={styles.eventMemberAvatar} />
                      <Text style={styles.eventMemberName}>{member.name}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity 
                  style={styles.deleteEventButton}
                  onPress={() => handleDeleteEvent(event.id)}
                >
                  <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            );
          })}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => {
          if (selected) {
            setEventToEdit(null); // Aseguramos que estamos en modo añadir, no editar
            setModalVisible(true);
          }
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
            <AddEvent 
              onClose={() => {
                setModalVisible(false);
                setRefresh(prev => prev + 1); // Actualizar UI después de añadir evento
              }} 
              selectedDate={selected}
              eventToEdit={eventToEdit}
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
  familyAvatars: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 50, // Para ajustar al botón de retroceso
  },
  avatarContainer: {
    alignItems: "center",
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
  },
  memberName: {
    marginTop: 4,
    fontSize: 12,
    color: THEME_COLORS.text,
    textAlign: "center",
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
  eventIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
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
  eventMember: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  eventMemberAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  eventMemberName: {
    fontSize: 12,
    color: "#1f2937",
  },
  deleteEventButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
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