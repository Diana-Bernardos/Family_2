import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { X } from "lucide-react-native";
import { useFamilyStore } from "../stores/familyStore";
import { THEME_COLORS, FONTS } from "../constants/theme"; // Importación corregida

export default function AddShoppingItem({ 
  onClose,
  listId
}: { 
  onClose: () => void,
  listId: string
}) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
  
  const { addShoppingItem, members } = useFamilyStore();
  const currentMember = members.length > 0 ? members[0].id : ""; // Usar el primer miembro como default

  const handleSubmit = () => {
    if (name.trim()) {
      const newItem = {
        id: Date.now().toString(),
        name: name.trim(),
        quantity: quantity.trim() || "1",
        category: category.trim() || "General",
        completed: false,
        addedBy: currentMember,
        addedAt: new Date().toISOString(),
      };
      
      addShoppingItem(listId, newItem);
      onClose();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <X color={THEME_COLORS.primary} size={24} />
      </TouchableOpacity>
      <Text style={styles.title}>Añadir Producto</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del producto"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Cantidad (ej: 2, 500g, 1L)"
          value={quantity}
          onChangeText={setQuantity}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Categoría (ej: Frutas, Lácteos)"
          value={category}
          onChangeText={setCategory}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, !name.trim() && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!name.trim()}
      >
        <Text style={styles.buttonText}>Añadir a la Lista</Text>
      </TouchableOpacity>
    </View>
  );
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