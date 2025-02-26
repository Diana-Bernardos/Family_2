// app/(tabs)/school.tsx
"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, Image } from "react-native"
import { Calendar as CalendarComponent } from "react-native-calendars"
import { Plus, BookOpen, Trash2, Book, GraduationCap, Clock, Flag, Users, HelpCircle } from "lucide-react-native"
import { useFamilyStore, THEME_COLORS, FONTS, SchoolEvent } from "../../stores/familyStore"
import { router } from "expo-router"
import AddSchoolEvent from "../../components/AddSchoolEvents"

// Mapa de tipos de eventos escolares a iconos
const eventIcons = {
  exam: GraduationCap,
  assignment: Book,
  class: Clock,
  holiday: Flag,
  meeting: Users,
  other: HelpCircle,
}

export default function SchoolCalendar() {
  const { members, schoolEvents, schoolSubjects, removeSchoolEvent } = useFamilyStore();
  const [selected, setSelected] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refresh, setRefresh] = useState(0);

  // Seleccionar el primer estudiante por defecto
  useEffect(() => {
    if (members.length > 0 && !selectedStudent) {
      setSelectedStudent(members[0].id);
    }
  }, [members, selectedStudent]);

  // Filtrar eventos por estudiante seleccionado
  const filteredEvents = selectedStudent 
    ? schoolEvents.filter(event => event.memberId === selectedStudent)
    : schoolEvents;

  // Construir objeto de fechas marcadas para el calendario
  const markedDates = filteredEvents.reduce((acc, event) => {
    acc[event.date] = {
      marked: true,
      dotColor: event.color || THEME_COLORS.primary,
    };
    return acc;
  }, {} as any);

  // Si hay una fecha seleccionada, marcarla
  if (selected) {
    markedDates[selected] = {
      ...markedDates[selected],
      selected: true,
      selectedColor: THEME_COLORS.primary,
    };
  }

  // Manejar la eliminación de un evento
  const handleDeleteEvent = (eventId: string) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro que deseas eliminar este evento escolar?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Eliminar", 
          onPress: () => {
            removeSchoolEvent(eventId);
            setRefresh(prev => prev + 1);
          },
          style: "destructive"
        }
      ]
    );
  };

  // Navegar a la vista de materias
  const navigateToSubjects = () => {
    router.push({
      pathname: "/school-subjects",
      params: { studentId: selectedStudent }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendario Escolar</Text>
      </View>

      {/* Selector de estudiante */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.studentSelector}>
        {members.length === 0 ? (
          <View style={styles.emptyStudents}>
            <Text style={styles.emptyText}>No hay estudiantes</Text>
          </View>
        ) : (
          members.map((member) => (
            <TouchableOpacity 
              key={member.id} 
              style={[
                styles.studentItem,
                selectedStudent === member.id && styles.selectedStudent
              ]}
              onPress={() => setSelectedStudent(member.id)}
            >
              <Image source={{ uri: member.avatar }} style={styles.studentAvatar} />
              <Text style={[
                styles.studentName,
                selectedStudent === member.id && styles.selectedStudentText
              ]}>
                {member.name}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Botón de materias */}
      {selectedStudent && (
        <TouchableOpacity 
          style={styles.subjectsButton}
          onPress={navigateToSubjects}
        >
          <BookOpen size={16} color={THEME_COLORS.background} />
          <Text style={styles.subjectsButtonText}>Ver Materias</Text>
        </TouchableOpacity>
      )}

      {/* Calendario */}
      <View style={styles.calendarContainer}>
        <CalendarComponent
          onDayPress={(day) => setSelected(day.dateString)}
          markedDates={markedDates}
          theme={{
            todayTextColor: THEME_COLORS.primary,
            selectedDayBackgroundColor: THEME_COLORS.primary,
            arrowColor: THEME_COLORS.primary,
            textDayFontFamily: FONTS.regular,
            textMonthFontFamily: FONTS.semiBold,
            textDayHeaderFontFamily: FONTS.semiBold,
          }}
        />
      </View>

      {/* Lista de eventos */}
      <ScrollView style={styles.eventList}>
        {!selected ? (
          <Text style={styles.selectDateText}>Selecciona una fecha para ver eventos</Text>
        ) : filteredEvents.filter(event => event.date === selected).length === 0 ? (
          <Text style={styles.noEventsText}>No hay eventos para esta fecha</Text>
        ) : (
          filteredEvents
            .filter(event => event.date === selected)
            .map(event => {
              // Determinar qué icono mostrar basado en el tipo de evento
              const IconComponent = eventIcons[event.type] || HelpCircle;
              
              // Encontrar la materia relacionada si existe
              const subject = event.subject 
                ? schoolSubjects.find(s => s.id === event.subject)
                : null;
              
              return (
                <View key={event.id} style={[styles.eventCard, { backgroundColor: event.color }]}>
                  <View style={styles.eventIconContainer}>
                    <IconComponent size={24} color="#1f2937" />
                  </View>
                  
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    
                    {event.time && (
                      <Text style={styles.eventTime}>{event.time}</Text>
                    )}
                    
                    {subject && (
                      <View style={styles.eventSubject}>
                        <View style={[styles.subjectDot, { backgroundColor: subject.color }]} />
                        <Text style={styles.subjectName}>{subject.name}</Text>
                      </View>
                    )}
                    
                    {event.location && (
                      <Text style={styles.eventLocation}>
                        Ubicación: {event.location}
                      </Text>
                    )}
                    
                    {event.description && (
                      <Text style={styles.eventDescription}>
                        {event.description}
                      </Text>
                    )}
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.deleteEventButton}
                    onPress={() => handleDeleteEvent(event.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Trash2 size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              );
            })
        )}
      </ScrollView>

      {/* Botón para añadir evento */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {
          if (selected && selectedStudent) {
            setModalVisible(true);
          } else if (!selectedStudent) {
            Alert.alert(
              "Selecciona un estudiante",
              "Por favor, selecciona un estudiante para añadir un evento."
            );
          } else {
            Alert.alert(
              "Selecciona una fecha",
              "Por favor, selecciona una fecha para añadir un evento."
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
            <AddSchoolEvent 
              onClose={() => {
                setModalVisible(false);
                setRefresh(prev => prev + 1);
              }}
              selectedDate={selected}
              memberId={selectedStudent || ""}
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
    backgroundColor: "transparent",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: THEME_COLORS.primary,
    fontFamily: FONTS.bold,
  },
  studentSelector: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  studentItem: {
    alignItems: "center",
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
  },
  selectedStudent: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
  },
  studentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
  },
  studentName: {
    marginTop: 4,
    fontSize: 12,
    color: THEME_COLORS.text,
    fontFamily: FONTS.regular,
  },
  selectedStudentText: {
    fontFamily: FONTS.semiBold,
  },
  emptyStudents: {
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    fontFamily: FONTS.italic,
  },
  subjectsButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: THEME_COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  subjectsButtonText: {
    color: THEME_COLORS.background,
    marginLeft: 8,
    fontFamily: FONTS.semiBold,
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
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
    fontFamily: FONTS.italic,
  },
  noEventsText: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
    fontFamily: FONTS.italic,
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
    fontFamily: FONTS.semiBold,
  },
  eventTime: {
    fontSize: 14,
    color: "#374151",
    marginTop: 2,
    fontFamily: FONTS.regular,
  },
  eventSubject: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  subjectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  subjectName: {
    fontSize: 12,
    color: "#374151",
    fontFamily: FONTS.regular,
  },
  eventLocation: {
    fontSize: 12,
    color: "#374151",
    marginTop: 4,
    fontFamily: FONTS.regular,
  },
  eventDescription: {
    fontSize: 12,
    color: "#4B5563",
    marginTop: 4,
    fontFamily: FONTS.regular,
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