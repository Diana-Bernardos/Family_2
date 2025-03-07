"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native"
import { Clock, Tag, X } from "lucide-react-native"
import { useFamilyStore } from "../stores/familyStore"
import { THEME_COLORS } from "../constants/theme"

const COLORS = ["#FFE4E1", "#D0F0C0", "#B0E0E6", "#FFD700", "#FFA07A", "#87CEFA"]

export default function AddEvent({
  onClose,
  selectedDate,
  preselectedMemberId,
}: {
  onClose: () => void
  selectedDate: string
  preselectedMemberId?: string
}) {
  const [title, setTitle] = useState("")
  const [time, setTime] = useState("")
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [memberId, setMemberId] = useState<string | undefined>(preselectedMemberId)

  const { addEvent, members } = useFamilyStore()

  const handleSubmit = () => {
    if (title.trim()) {
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
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <X size={24} color="#6b7280" />
      </TouchableOpacity>

      <Text style={styles.title}>Nuevo Evento</Text>
      <Text style={styles.subtitle}>Fecha: {selectedDate}</Text>

      <View style={styles.inputContainer}>
        <Tag size={20} color={THEME_COLORS.primary} />
        <TextInput
          style={styles.input}
          placeholder="Título del evento"
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

      {members.length > 0 && !preselectedMemberId && (
        <View style={styles.memberSection}>
          <Text style={styles.sectionTitle}>Asignar a un miembro (opcional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.memberList}>
            {members.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={[styles.memberItem, memberId === member.id && styles.selectedMember]}
                onPress={() => setMemberId(memberId === member.id ? undefined : member.id)}
              >
                <Text style={[styles.memberName, memberId === member.id && styles.selectedMemberText]}>
                  {member.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {preselectedMemberId && (
        <View style={styles.preselectedMemberSection}>
          <Text style={styles.sectionTitle}>Evento asignado a:</Text>
          <Text style={styles.preselectedMemberName}>{members.find((m) => m.id === preselectedMemberId)?.name}</Text>
        </View>
      )}

      <View style={styles.colorSection}>
        <Text style={styles.sectionTitle}>Color del evento</Text>
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
        <Text style={styles.buttonText}>Guardar Evento</Text>
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
  memberSection: {
    marginBottom: 16,
  },
  preselectedMemberSection: {
    marginBottom: 16,
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
  },
  preselectedMemberName: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME_COLORS.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 8,
  },
  memberList: {
    paddingVertical: 8,
  },
  memberItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    marginRight: 8,
  },
  selectedMember: {
    backgroundColor: THEME_COLORS.primary,
  },
  memberName: {
    color: "#4b5563",
    fontWeight: "500",
  },
  selectedMemberText: {
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

