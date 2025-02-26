// components/AddSchoolEvent.tsx
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { X, Calendar, Clock, MapPin } from "lucide-react-native";
import { useFamilyStore, THEME_COLORS, FONTS } from "../stores/familyStore";

const eventTypes = [
  { id: "exam", label: "Examen" },
  { id: "assignment", label: "Tarea" },
  { id: "class", label: "Clase" },
  { id: "holiday", label: "Vacaciones" },
  { id: "meeting", label: "Reunión" },
  { id: "other", label: "Otro" },
];

export default function AddSchoolEvent({ 
  onClose,
  selectedDate,
  memberId,
  subjectId
}: { 
  onClose: () => void,
  selectedDate: string,
  memberId: string,
  subjectId?: string
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [selectedType, setSelectedType] = useState<"exam" | "assignment" | "class" | "holiday" | "meeting" | "other">("assignment");
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS.blue);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  
  const { addSchoolEvent, schoolSubjects } = useFamilyStore();

  // Si hay un subjectId, obtener el color de la materia
  const subject = subjectId ? schoolSubjects.find(s => s.id === subjectId) : null;
  
  useEffect(() => {
    if (subject) {
      setSelectedColor(subject.color);
    }
  }, [subject]);

  const handleSubmit = async () => {
    if (title.trim()) {
      const newEvent = {
        id: Date.now().toString(),
        title: title.trim(),
        date: selectedDate,
        time: time.trim() || undefined,
        description: description.trim() || undefined,
        type: selectedType,
        subject: subjectId,
        memberId,
        color: selectedColor,
        location: location.trim() || undefined,
        reminderSet: reminderEnabled,
      };
      
      addSchoolEvent(newEvent);
      onClose();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <X color={THEME_COLORS.primary} size={24} />
      </TouchableOpacity>
      <Text style={styles.title}>Nuevo Evento Escolar</Text>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Título del evento"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <Calendar size={20} color={THEME_COLORS.text} style={styles.inputIcon} />
            <Text style={styles.dateText}>{selectedDate}</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <Clock size={20} color={THEME_COLORS.text} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Hora (ej: 14:30)"
              value={time}
              onChangeText={setTime}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <MapPin size={20} color={THEME_COLORS.text} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ubicación (opcional)"
              value={location}
              onChangeText={setLocation}
            />
          </View>
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

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Tipo de evento:</Text>
          <View style={styles.typeContainer}>
            {eventTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeOption,
                  selectedType === type.id && styles.selectedTypeOption
                ]}
                onPress={() => setSelectedType(type.id as any)}
              >
                <Text style={styles.typeText}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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

        <View style={styles.sectionContainer}>
          <View style={styles.reminderContainer}>
            <Text style={styles.sectionTitle}>Recordatorio:</Text>
            <TouchableOpacity 
              style={[styles.toggleButton, reminderEnabled && styles.toggleButtonActive]}
              onPress={() => setReminderEnabled(!reminderEnabled)}
            >
              <Text style={[styles.toggleButtonText, reminderEnabled && styles.toggleButtonTextActive]}>
                {reminderEnabled ? "Activado" : "Desactivado"}
              </Text>
            </TouchableOpacity>
          </View>
          {reminderEnabled && (
            <Text style={styles.reminderInfo}>
              Se enviará una notificación 1 hora antes del evento.
            </Text>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, !title.trim() && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!title.trim()}
      >
        <Text style={styles.buttonText}>Guardar Evento</Text>
      </TouchableOpacity>
    </View>
  );
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
    fontFamily: FONTS.bold,
  },
  inputContainer: {
    backgroundColor: THEME_COLORS.blue,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  textArea: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    minHeight: 80,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: THEME_COLORS.text,
    fontFamily: FONTS.semiBold,
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  typeOption: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    marginBottom: 8,
    width: "48%",
    alignItems: "center",
  },
  selectedTypeOption: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    borderWidth: 1,
    borderColor: THEME_COLORS.primary,
  },
  typeText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
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
  reminderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleButtonActive: {
    backgroundColor: THEME_COLORS.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  toggleButtonTextActive: {
    color: "white",
  },
  reminderInfo: {
    fontSize: 12,
    color: "#666",
    fontFamily: FONTS.italic,
    marginTop: 4,
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
    fontFamily: FONTS.bold,
  },
});