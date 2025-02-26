import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Plus, ArrowLeft, Book, ShoppingCart, Briefcase, HeartPulse, Utensils, Dumbbell, Trash2 } from 'lucide-react-native';
import { useFamilyStore, THEME_COLORS } from "../stores/familyStore";
import { useLocalSearchParams, router } from 'expo-router';
import AddEvent from '../components/AddEvent';

// Mapa de tipos de eventos a iconos
const eventIcons = {
  trabajo: Briefcase,
  escuela: Book,
  compras: ShoppingCart,
  salud: HeartPulse,
  comida: Utensils,
  ejercicio: Dumbbell,
};

export default function PersonalCalendar() {
  const [selected, setSelected] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  // Obtener directamente los datos y funciones del store
  const removeEvent = useFamilyStore(state => state.removeEvent);
  const members = useFamilyStore(state => state.members);
  const events = useFamilyStore(state => state.events);
  
  // Obtener el ID del miembro de los parámetros
  const { memberId } = useLocalSearchParams();
  
  // Para forzar actualización de la UI
  const [refresh, setRefresh] = useState(0);
  
  useEffect(() => {
    console.log("ID del miembro recibido:", memberId);
    console.log("Eventos actuales:", events.length);
  }, [memberId, events, refresh]);
  
  // Encontrar el miembro seleccionado
  const member = members.find(m => m.id === memberId);
  
  // Filtrar eventos solo para este miembro
  const memberEvents = events.filter(event => event.memberId === memberId);
  
  // Marcar fechas con eventos en el calendario
  const markedDates = memberEvents.reduce((acc, event) => {
    acc[event.date] = {
      marked: true,
      dotColor: event.color || THEME_COLORS.primary,
    };
    return acc;
  }, {});

  if (selected) {
    markedDates[selected] = {
      ...markedDates[selected],
      selected: true,
      selectedColor: THEME_COLORS.primary,
    };
  }

  const handleDeleteEvent = (eventId) => {
    console.log('Intentando eliminar evento con ID:', eventId);
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
            console.log('Eliminando evento con ID:', eventId);
            removeEvent(eventId);
            setRefresh(prev => prev + 1);
          },
          style: "destructive"
        }
      ]
    );
  };

  if (!member) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color={THEME_COLORS.primary} size={24} />
          </TouchableOpacity>
          <Text style={styles.errorText}>Miembro no encontrado</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Encabezado con foto y nombre */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={THEME_COLORS.primary} size={24} />
        </TouchableOpacity>
        
        <View style={styles.memberInfo}>
          <Image source={{ uri: member.avatar }} style={styles.avatar} />
          <Text style={styles.memberName}>{member.name}</Text>
        </View>
      </View>
      
      <Calendar
        onDayPress={day => setSelected(day.dateString)}
        markedDates={markedDates}
        theme={{
          todayTextColor: THEME_COLORS.primary,
          selectedDayBackgroundColor: THEME_COLORS.primary,
          arrowColor: THEME_COLORS.primary,
        }}
      />

      <ScrollView style={styles.eventList}>
        <Text style={styles.eventsTitle}>
          {selected ? `Eventos para ${selected}` : 'Selecciona una fecha'}
        </Text>
        
        {memberEvents
          .filter(event => event.date === selected)
          .map((event) => {
            // Determinar qué icono mostrar basado en el tipo de evento
            const IconComponent = event.type && eventIcons[event.type] ? eventIcons[event.type] : Briefcase;
            
            return (
              <View key={event.id} style={[styles.eventCard, { backgroundColor: event.color }]}>
                <View style={styles.eventIconContainer}>
                  <IconComponent size={24} color="#1f2937" />
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventTime}>{event.time}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.deleteEventButton}
                  onPress={() => handleDeleteEvent(event.id)}
                  activeOpacity={0.7}
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
      
      {/* Modal para añadir evento */}
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
              memberId={memberId}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME_COLORS.text,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    fontWeight: '500',
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  eventList: {
    flex: 1,
    paddingTop: 16,
  },
  eventCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  eventTime: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  deleteEventButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    width: 40, 
    height: 40,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
  },
});