"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch, Alert } from "react-native"
import { Calendar, Clock, X, Book, ShoppingCart, Briefcase, HeartPulse, Utensils, Dumbbell, Bell } from "lucide-react-native"
import { useFamilyStore, THEME_COLORS } from "../stores/familyStore"

// Opciones de tipo de evento con sus iconos
const eventTypes = [
  { id: 'trabajo', label: 'Trabajo', icon: Briefcase },
  { id: 'escuela', label: 'Escuela', icon: Book },
  { id: 'compras', label: 'Compras', icon: ShoppingCart },
  { id: 'salud', label: 'Salud', icon: HeartPulse },
  { id: 'comida', label: 'Comida', icon: Utensils },
  { id: 'ejercicio', label: 'Ejercicio', icon: Dumbbell },
];

export default function AddEvent({
  onClose,
  selectedDate,
  memberId,
  eventToEdit
}: {
  onClose: () => void
  selectedDate: string
  memberId?: string
  eventToEdit?: any
}) {
  const [title, setTitle] = useState("")
  const [time, setTime] = useState("")
  const [description, setDescription] = useState("")
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS.pink)
  const [selectedType, setSelectedType] = useState("")
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const { addEvent, updateEvent, members } = useFamilyStore()

  // Si no hay un miembro seleccionado, permitir seleccionar uno
  const [selectedMemberId, setSelectedMemberId] = useState(memberId || "")
  
  // Si hay un evento para editar, inicializar el formulario con sus datos
  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title || "");
      setTime(eventToEdit.time || "");
      setDescription(eventToEdit.description || "");
      setSelectedColor(eventToEdit.color || THEME_COLORS.pink);
      setSelectedType(eventToEdit.type || "");
      setSelectedMemberId(eventToEdit.memberId || "");
      // Si el evento tiene un ID de notificación, asumimos que las notificaciones están habilitadas
      setReminderEnabled(eventToEdit.notificationId ? true : false);
    }
  }, [eventToEdit]);

  const handleSubmit = async () => {
    if (title.trim() && time.trim()) {
      try {
        if (eventToEdit) {
          // Actualizar evento existente
          await updateEvent(eventToEdit.id, {
            title: title.trim(),
            date: selectedDate,
            time: time.trim(),
            description: description.trim() || undefined,
            color: selectedColor,
            memberId: selectedMemberId || undefined,
            type: selectedType || undefined,
            // No necesitamos incluir notificationId aquí ya que se manejará en el store
          });
          
          Alert.alert(
            "Evento actualizado",
            reminderEnabled 
              ? "El evento se ha actualizado y se te notificará 1 hora antes"
              : "El evento se ha actualizado sin recordatorio"
          );
        } else {
          // Crear nuevo evento
          await addEvent({
            id: Date.now().toString(),
            title: title.trim(),
            date: selectedDate,
            time: time.trim(),
            description: description.trim() || undefined,
            color: selectedColor,
            memberId: selectedMemberId || undefined,
            type: selectedType || undefined,
            // El notificationId se asignará en el store si reminderEnabled es true
          });
          
          Alert.alert(
            "Evento creado",
            reminderEnabled 
              ? "El evento se ha creado y se te notificará 1 hora antes"
              : "El evento se ha creado sin recordatorio"
          );
        }
        
        onClose();
      } catch (error) {
        console.error("Error al guardar evento:", error);
        Alert.alert(
          "Error",
          "No se pudo guardar el evento. Por favor, inténtalo de nuevo."
        );
      }
    } else {
      Alert.alert(
        "Campos incompletos",
        "Por favor, completa al menos el título y la hora del evento."
      );
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <X color={THEME_COLORS.primary} size={24} />
      </TouchableOpacity>
      <Text style={styles.title}>
        {eventToEdit ? "Editar Evento" : "Nuevo Evento"}
      </Text>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.inputContainer}>
          <Calendar size={20} color={THEME_COLORS.primary} />
          <TextInput 
            style={styles.input} 
            placeholder="Título del evento" 
            value={title} 
            onChangeText={setTitle} 
          />
        </View>

        <View style={styles.inputContainer}>
          <Clock size={20} color={THEME_COLORS.primary} />
          <TextInput 
            style={styles.input} 
            placeholder="Hora (ej: 14:30)" 
            value={time} 
            onChangeText={setTime} 
          />
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.textArea} 
            placeholder="Descripción (opcional)" 
            value={description} 
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        {/* Selector de miembro de la familia */}
        {!memberId && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Asignar a:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.membersContainer}>
              {members.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.memberOption,
                    selectedMemberId === member.id && styles.selectedMemberOption
                  ]}
                  onPress={() => setSelectedMemberId(member.id)}
                >
                  <Text style={styles.memberOptionText}>{member.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Selector de tipo de evento */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Tipo de evento:</Text>
          <View style={styles.typeContainer}>
            {eventTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeOption,
                    selectedType === type.id && styles.selectedTypeOption
                  ]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <IconComponent size={20} color={selectedType === type.id ? THEME_COLORS.primary : "#666"} />
                  <Text style={styles.typeText}>{type.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selector de color */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Color:</Text>
          <View style={styles.colorPicker}>
            {Object.values(THEME_COLORS).map((color) => (
              <TouchableOpacity
                key={color}
                style={[styles.colorOption, { backgroundColor: color }, color === selectedColor && styles.selectedColor]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
        </View>
        
        {/* Opción de recordatorio */}
        <View style={styles.sectionContainer}>
          <View style={styles.reminderRow}>
            <View style={styles.reminderTextContainer}>
              <Bell size={20} color={THEME_COLORS.primary} style={styles.reminderIcon} />
              <Text style={styles.sectionTitle}>Recordatorio</Text>
            </View>
            <Switch
              trackColor={{ false: "#e0e0e0", true: THEME_COLORS.primary }}
              thumbColor="#ffffff"
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
            />
          </View>
          
          {reminderEnabled && (
            <Text style={styles.reminderInfo}>
              Se te enviará una notificación 1 hora antes del evento
            </Text>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, (!title.trim() || !time.trim()) && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!title.trim() || !time.trim()}
      >
        <Text style={styles.buttonText}>
          {eventToEdit ? "Actualizar Evento" : "Guardar Evento"}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    maxHeight: "80%",
  },
  scrollContainer: {
    maxHeight: 400,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    color: THEME_COLORS.primary,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME_COLORS.blue,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  textArea: {
    flex: 1,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: THEME_COLORS.text,
  },
  colorPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 8,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  typeOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    width: "48%",
  },
  selectedTypeOption: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    borderWidth: 1,
    borderColor: THEME_COLORS.primary,
  },
  typeText: {
    marginLeft: 8,
    fontSize: 14,
  },
  membersContainer: {
    flexDirection: "row",
  },
  memberOption: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedMemberOption: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    borderWidth: 1,
    borderColor: THEME_COLORS.primary,
  },
  memberOptionText: {
    fontSize: 14,
  },
  reminderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reminderTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  reminderIcon: {
    marginRight: 8,
  },
  reminderInfo: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
  },
  button: {
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})