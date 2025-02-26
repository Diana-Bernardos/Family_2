"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native"
import { Calendar, Clock, X } from "lucide-react-native"
import { useFamilyStore, THEME_COLORS } from "../stores/familyStore"

export default function AddEvent({
  onClose,
  selectedDate,
  memberId,
}: {
  onClose: () => void
  selectedDate: string
  memberId?: string
}) {
  const [title, setTitle] = useState("")
  const [time, setTime] = useState("")
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS.pink)
  const addEvent = useFamilyStore((state) => state.addEvent)

  const handleSubmit = () => {
    if (title.trim() && time.trim()) {
      addEvent({
        id: Date.now().toString(),
        title: title.trim(),
        date: selectedDate,
        time: time.trim(),
        color: selectedColor,
        memberId,
      })
      onClose()
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <X color={THEME_COLORS.primary} size={24} />
      </TouchableOpacity>
      <Text style={styles.title}>Nuevo Evento</Text>

      <View style={styles.inputContainer}>
        <Calendar size={20} color={THEME_COLORS.primary} />
        <TextInput style={styles.input} placeholder="Título del evento" value={title} onChangeText={setTitle} />
      </View>

      <View style={styles.inputContainer}>
        <Clock size={20} color={THEME_COLORS.primary} />
        <TextInput style={styles.input} placeholder="Hora (ej: 14:30)" value={time} onChangeText={setTime} />
      </View>

      <View style={styles.colorPicker}>
        {Object.values(THEME_COLORS).map((color) => (
          <TouchableOpacity
            key={color}
            style={[styles.colorOption, { backgroundColor: color }, color === selectedColor && styles.selectedColor]}
            onPress={() => setSelectedColor(color)}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, (!title.trim() || !time.trim()) && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!title.trim() || !time.trim()}
      >
        <Text style={styles.buttonText}>Guardar Evento</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
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
  colorPicker: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 8,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
  },
  button: {
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
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

