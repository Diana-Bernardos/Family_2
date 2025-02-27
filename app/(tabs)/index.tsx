"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Image, Alert } from "react-native"
import { Calendar as CalendarComponent } from "react-native-calendars"
import { Plus, ArrowLeft, Book, ShoppingCart, Briefcase, HeartPulse, Utensils, Dumbbell, Trash2 } from "lucide-react-native"
import { useFamilyStore, THEME_COLORS } from "../../stores/familyStore"
import AddEvent from "../../components/AddEvent"
import { router } from "expo-router"

// Mapa de tipos de eventos a iconos
const eventIcons = {
  trabajo: Briefcase,
  escuela: Book,
  compras: ShoppingCart,
  salud: HeartPulse,
  comida: Utensils,
  ejercicio: Dumbbell,
};

export default function FamilyCalendar() {
  // Obtener directamente las funciones y datos del store
  const { 
    members, 
    events, 
    removeEvent 
  } = useFamilyStore();
  
  const [selected, setSelected] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [eventToEdit, setEventToEdit] = useState(null)
  
  // Para asegurar que la UI se actualiza cuando cambia el estado del store
  const [refresh, setRefresh] = useState(0)
  
  useEffect(() => {
    console.log("Eventos actuales:", events.length);
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
    console.log("Navegando al calendario personal del miembro:", memberId);
    router.push(`/personal?memberId=${memberId}`);
  }

  const handleDeleteEvent = async (eventId) => {
    if (!eventId) {
      console.error('ID de evento no válido para eliminación');
      return;
    }
    
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
          onPress: async () => {
            try {
              console.log('Confirmado: eliminando evento con ID:', eventId);
              
              // Usar await ya que la función ahora es asíncrona debido a las notificaciones
              await removeEvent(eventId);
              
              // Forzar actualización de la UI
              setRefresh(prev => prev + 1);
              
              Alert.alert(
                "Evento eliminado",
                "El evento ha sido eliminado correctamente."
              );
            } catch (error) {
              console.error("Error al eliminar evento:", error);
              Alert.alert(
                "Error",
                "Ocurrió un error al intentar eliminar el evento."
              );
            }
          },
          style: "destructive"
        }
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendario Familiar</Text>
      </View>

      {/* Sección de fotos de miembros de la familia */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.familyAvatars}>
        {members.length === 0 ? (
          <View style={styles.emptyAvatars}>
            <Text style={styles.emptyAvatarsText}>Agrega miembros en la pestaña Familia</Text>
          </View>
        ) : (
          members.map((member) => (
            <TouchableOpacity 
              key={member.id} 
              style={styles.avatarContainer}
              onPress={() => navigateToPersonalCalendar(member.id)}
              activeOpacity={0.7}
            >
              <Image source={{ uri: member.avatar }} style={styles.avatar} />
              <Text style={styles.memberName}>{member.name}</Text>
            </TouchableOpacity>
          ))
        )}
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
        {!selected ? (
          <Text style={styles.selectDateText}>Selecciona una fecha para ver los eventos</Text>
        ) : events.filter(event => event.date === selected).length === 0 ? (
          <Text style={styles.noEventsText}>No hay eventos para esta fecha</Text>
        ) : (
          events
            .filter(event => event.date === selected)
            .map(event => {
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
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Trash2 size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              );
            })
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => {
          if (selected) {
            setEventToEdit(null);
            setModalVisible(true);
          } else {
            Alert.alert(
              "Selecciona una fecha",
              "Por favor, selecciona una fecha en el calendario para añadir un evento."
            );
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
                setRefresh(prev => prev + 1);
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
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME_COLORS.primary,
  },
  familyAvatars: {
    flexDirection: "row",
    padding: 16,
    minHeight: 100,
  },
  emptyAvatars: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  emptyAvatarsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: "center",
    marginRight: 16,
    width: 70,
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
  selectDateText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
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
});