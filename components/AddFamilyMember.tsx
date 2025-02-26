"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { useFamilyStore, THEME_COLORS } from "../stores/familyStore"
import { Camera, X } from "lucide-react-native"

export default function AddFamilyMember({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState("")
  const addMember = useFamilyStore((state) => state.addMember)

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })

    if (!result.canceled) {
      setAvatar(result.assets[0].uri)
    }
  }

  const handleSubmit = () => {
    if (name.trim()) {
      addMember({
        id: Date.now().toString(),
        name: name.trim(),
        avatar: avatar || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200",
      })
      onClose()
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <X color={THEME_COLORS.primary} size={24} />
      </TouchableOpacity>
      <Text style={styles.title}>Añadir Familiar</Text>

      <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Camera size={32} color={THEME_COLORS.primary} />
          </View>
        )}
      </TouchableOpacity>

      <TextInput style={styles.input} placeholder="Nombre del familiar" value={name} onChangeText={setName} />

      <TouchableOpacity
        style={[styles.button, !name.trim() && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!name.trim()}
      >
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    alignItems: "center",
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
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: THEME_COLORS.blue,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    backgroundColor: THEME_COLORS.blue,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: THEME_COLORS.blue,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

