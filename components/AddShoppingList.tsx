import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { X } from "lucide-react-native";
import { useFamilyStore, THEME_COLORS, FONTS } from "../stores/familyStore";

export default function AddShoppingList({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [forDate, setForDate] = useState("");
  const { addShoppingList, members } = useFamilyStore();
  const currentMember = members.length > 0 ? members[0].id : ""; // Usar el primer miembro como default

  const handleSubmit = () => {
    if (name.trim()) {
      const newList = {
        id: Date.now().toString(),
        name: name.trim(),
        items: [],
        createdAt: new Date().toISOString(),
        createdBy: currentMember,
        forDate: forDate.trim() || undefined,
      };
      
      addShoppingList(newList);
      onClose();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <X color={THEME_COLORS.primary} size={24} />
      </TouchableOpacity>
      <Text style={styles.title}>Nueva Lista de Compras</Text>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nombre de la lista"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Fecha (opcional, ej: 2023-12-24)"
            value={forDate}
            onChangeText={setForDate}
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, !name.trim() && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!name.trim()}
      >
        <Text style={styles.buttonText}>Crear Lista</Text>
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
  input: {
    fontSize: 16,
    fontFamily: FONTS.regular,
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
