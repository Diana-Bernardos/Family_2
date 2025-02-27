"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, Alert, ActivityIndicator } from "react-native"
import { Plus, Edit, ArrowLeft, Trash2, RefreshCw } from "lucide-react-native"
import { Calendar } from "react-native-calendars"
import { useFamilyStore, THEME_COLORS } from "../../stores/familyStore"
import AddFamilyMember from "../../components/AddFamilyMember"
import AddEvent from "../../components/AddEvent"

export default function FamilyMembers() {
  // Obtener directamente las funciones y datos del store
  const { 
    members, 
    events, 
    removeMember, 
    removeEvent,
    clearAllData
  } = useFamilyStore();
  
  const [modalVisible, setModalVisible] = useState(false)
  const [expandedMember, setExpandedMember] = useState<string | null>(null)
  const [addEventModalVisible, setAddEventModalVisible] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [editMember, setEditMember] = useState(null)
  const [isClearing, setIsClearing] = useState(false)
  
  // Para asegurar que la UI se actualiza cuando cambia el estado del store
  const [refresh, setRefresh] = useState(0)
  
  useEffect(() => {
    console.log("Miembros actuales:", members.length);
    console.log("Eventos actuales:", events.length);
  }, [members, events, refresh])

  const getMemberEvents = (memberId) => {
    return events
      .filter((event) => event.memberId === memberId)
      .reduce((acc, event) => {
        acc[event.date] = { marked: true, dotColor: event.color }
        return acc
      }, {})
  }

  const handleDeleteMember = (id) => {
    if (!id) {
      console.error('ID de miembro no válido para eliminación');
      return;
    }
    
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
            try {
              console.log('Confirmado: eliminando miembro con ID:', id);
              
              // Llamar directamente a la función del store
              removeMember(id);
              
              // Si el miembro eliminado es el que está expandido, cerramos la vista
              if (expandedMember === id) {
                setExpandedMember(null);
              }
              
              // Forzar actualización de la UI
              setRefresh(prev => prev + 1);
              
              console.log('Miembro eliminado, IDs restantes:', members.map(m => m.id));
              
              Alert.alert(
                "Miembro eliminado",
                "El miembro y todos sus eventos han sido eliminados."
              );
            } catch (error) {
              console.error("Error al eliminar miembro:", error);
              Alert.alert(
                "Error",
                "Ocurrió un error al intentar eliminar el miembro."
              );
            }
          },
          style: "destructive"
        }
      ]
    );
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
  
  const handleClearAllData = async () => {
    Alert.alert(
      "Limpiar todos los datos",
      "¿Estás seguro que deseas eliminar TODOS los miembros de la familia y sus eventos? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Eliminar Todo", 
          onPress: async () => {
            try {
              setIsClearing(true);
              
              // Limpiar datos del store
              await clearAllData();
              
              // Actualizar UI
              setExpandedMember(null);
              setRefresh(prev => prev + 1);
              
              Alert.alert("Datos eliminados", "Todos los datos han sido eliminados correctamente.");
            } catch (error) {
              console.error("Error al limpiar datos:", error);
              Alert.alert("Error", "Ocurrió un error al intentar eliminar los datos.");
            } finally {
              setIsClearing(false);
            }
          },
          style: "destructive"
        }
      ]
    )
  }

  const renderEventList = (memberId) => {
    const memberEvents = events.filter(event => event.memberId === memberId);
    
    if (memberEvents.length === 0) {
      return <Text style={styles.noEventsText}>No hay eventos programados</Text>;
    }
    
    return memberEvents.slice(0, 3).map((event) => (
      <View key={event.id} style={[styles.eventItem, { backgroundColor: event.color }]}>
        <View style={styles.eventDetails}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDate}>{event.date} - {event.time}</Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteEventButton}
          onPress={() => handleDeleteEvent(event.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    ));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Miembros de la Familia</Text>
        
        <TouchableOpacity 
          style={styles.clearDataButton}
          onPress={handleClearAllData}
          disabled={isClearing}
        >
          {isClearing ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <RefreshCw size={18} color="#ef4444" />
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.memberList}>
        {members.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay miembros en la familia</Text>
            <Text style={styles.emptySubtext}>Presiona el botón + para añadir un miembro</Text>
          </View>
        ) : (
          members.map((member, index) => (
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
                      setEditMember(member);
                      setModalVisible(true);
                    }}
                  >
                    <Edit size={16} color={THEME_COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteMember(member.id)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Trash2 size={20} color="#ef4444" />
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
                      setSelectedDate(day.dateString);
                      setSelectedMemberId(member.id);
                      setAddEventModalVisible(true);
                    }}
                  />
                  
                  <View style={styles.memberEventsList}>
                    <Text style={styles.eventsTitle}>Eventos próximos:</Text>
                    {renderEventList(member.id)}
                  </View>
                  
                  <TouchableOpacity
                    style={styles.addEventButton}
                    onPress={() => {
                      setSelectedMemberId(member.id);
                      setAddEventModalVisible(true);
                    }}
                  >
                    <Text style={styles.addEventText}>Añadir Evento</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: THEME_COLORS.primary }]}
        onPress={() => {
          setEditMember(null);
          setModalVisible(true);
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
                setModalVisible(false);
                setRefresh(prev => prev + 1);
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
                setAddEventModalVisible(false);
                setRefresh(prev => prev + 1);
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
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME_COLORS.primary,
    flex: 1,
    textAlign: 'center',
  },
  clearDataButton: {
    position: 'absolute',
    right: 16,
    top: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  memberList: {
    padding: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  noEventsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
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
    padding: 10,
    marginRight: 5,
  },
  deleteButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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