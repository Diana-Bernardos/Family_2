"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native"
import { Clock, MapPin, BookOpen, X } from "lucide-react-native"
import { useFamilyStore } from "../stores/familyStore"
import { THEME_COLORS } from "../constants/theme"

const COLORS = ["#FFE4E1", "#D0F0C0", "#B0E0E6", "#FFD700", "#FFA07A", "#87CEFA"]

export default function AddSchoolActivity({
  onClose,
  selectedDate,
}: {
  onClose: () => void
  selectedDate: string
}) {
  const [title, setTitle] = useState("")
  const [time, setTime] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [studentId, setStudentId] = useState<string | undefined>(undefined)

  const { addSchoolActivity, members } = useFamilyStore()

  const handleSubmit = () => {
    if (title.trim()) {
      addSchoolActivity({
        id: Date.now().toString(),
        title: title.trim(),
        date: selectedDate,
        time: time.trim(),
        location: location.trim(),
        description: description.trim(),
        studentId,
        color: selectedColor,
      })
      onClose()
    }
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <X size={24} color="#6b7280" />
      </TouchableOpacity>

      <Text style={styles.title}>Nueva Actividad Escolar</Text>
      <Text style={styles.subtitle}>Fecha: {selectedDate}</Text>

      <View style={styles.inputContainer}>
        <BookOpen size={20} color={THEME_COLORS.primary} />
        <TextInput
          style={styles.input}
          placeholder="Título de la actividad"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.inputContainer}>
        <Clock size={20} color={THEME_COLORS.primary} />
        <TextInput
          style={styles.input}
          placeholder="Hora (ej: 14:30)"
          value={time}
          onChangeText={setTime}
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.inputContainer}>
        <MapPin size={20} color={THEME_COLORS.primary} />
        <TextInput
          style={styles.input}
          placeholder="Ubicación (opcional)"
          value={location}
          onChangeText={setLocation}
          placeholderTextColor="#9ca3af"
        />
      </View>

      <Text style={styles.sectionTitle}>Descripción (opcional)</Text>
      <TextInput
        style={styles.descriptionInput}
        placeholder="Añade detalles sobre la actividad..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        placeholderTextColor="#9ca3af"
      />

      {members.length > 0 && (
        <View style={styles.studentSection}>
          <Text style={styles.sectionTitle}>Asignar a un estudiante (opcional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.studentList}>
            {members.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={[styles.studentItem, studentId === member.id && styles.selectedStudent]}
                onPress={() => setStudentId(studentId === member.id ? undefined : member.id)}
              >
                <Text style={[styles.studentName, studentId === member.id && styles.selectedStudentText]}>
                  {member.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.colorSection}>
        <Text style={styles.sectionTitle}>Color de la actividad</Text>
        <View style={styles.colorPicker}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.colorOption, { backgroundColor: color }, color === selectedColor && styles.selectedColor]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, !title.trim() && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!title.trim()}
      >
        <Text style={styles.buttonText}>Guardar Actividad</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    maxHeight: "80%",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    color: THEME_COLORS.primary,
    textAlign: "center",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 8,
  },
  descriptionInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1f2937",
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  studentSection: {
    marginBottom: 16,
  },
  studentList: {
    paddingVertical: 8,
  },
  studentItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    marginRight: 8,
  },
  selectedStudent: {
    backgroundColor: THEME_COLORS.primary,
  },
  studentName: {
    color: "#4b5563",
    fontWeight: "500",
  },
  selectedStudentText: {
    color: "#ffffff",
  },
  colorSection: {
    marginBottom: 20,
  },
  colorPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    margin: 8,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: THEME_COLORS.primary,
  },
  button: {
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "#c7d2fe",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

