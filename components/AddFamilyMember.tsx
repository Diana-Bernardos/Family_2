"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from "react-native"
import { X, User, Check } from "lucide-react-native"
import { useFamilyStore } from "../stores/familyStore"
import { THEME_COLORS } from "../constants/theme"

// Avatares predefinidos
const AVATARS = [
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&h=100",
]

export default function AddFamilyMember({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0])

  const { addMember } = useFamilyStore()

  const handleSubmit = () => {
    if (name.trim()) {
      addMember({
        id: Date.now().toString(),
        name: name.trim(),
        avatar: selectedAvatar,
      })
      onClose()
    }
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <X size={24} color="#6b7280" />
      </TouchableOpacity>

      <Text style={styles.title}>Añadir Miembro de Familia</Text>

      <View style={styles.avatarContainer}>
        <Image source={{ uri: selectedAvatar }} style={styles.avatar} />
      </View>

      <Text style={styles.sectionTitle}>Selecciona un avatar</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarList}>
        {AVATARS.map((avatar) => (
          <TouchableOpacity
            key={avatar}
            style={[styles.avatarOption, selectedAvatar === avatar && styles.selectedAvatarOption]}
            onPress={() => setSelectedAvatar(avatar)}
          >
            <Image source={{ uri: avatar }} style={styles.avatarOptionImage} />
            {selectedAvatar === avatar && (
              <View style={styles.selectedAvatarCheck}>
                <Check size={16} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <User size={20} color={THEME_COLORS.primary} />
        <TextInput
          style={styles.input}
          placeholder="Nombre del miembro"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#9ca3af"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, !name.trim() && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!name.trim()}
      >
        <Text style={styles.buttonText}>Guardar</Text>
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
    marginBottom: 20,
    color: THEME_COLORS.primary,
    textAlign: "center",
    marginTop: 10,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f3f4f6",
    alignSelf: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 12,
  },
  avatarList: {
    paddingVertical: 8,
    marginBottom: 20,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedAvatarOption: {
    borderColor: THEME_COLORS.primary,
  },
  avatarOptionImage: {
    width: "100%",
    height: "100%",
  },
  selectedAvatarCheck: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  button: {
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 14,
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

