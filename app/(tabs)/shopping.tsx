"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Plus, Trash2, ShoppingCart, Check, X } from "lucide-react-native"
import { useFamilyStore } from "../../stores/familyStore"
import { THEME_COLORS } from "../../constants/theme"

export default function ShoppingList() {
  const { shoppingList, addShoppingItem, removeShoppingItem, toggleShoppingItem } = useFamilyStore()
  const [modalVisible, setModalVisible] = useState(false)
  const [itemName, setItemName] = useState("")
  const [itemQuantity, setItemQuantity] = useState("")
  const [itemCategory, setItemCategory] = useState("")
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")

  const handleAddItem = () => {
    if (itemName.trim()) {
      addShoppingItem({
        id: Date.now().toString(),
        name: itemName.trim(),
        quantity: itemQuantity.trim(),
        category: itemCategory.trim(),
        completed: false,
      })
      setItemName("")
      setItemQuantity("")
      setItemCategory("")
      setModalVisible(false)
    }
  }

  const handleDeleteItem = (id: string) => {
    Alert.alert("Eliminar artículo", "¿Estás seguro de que quieres eliminar este artículo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => removeShoppingItem(id),
      },
    ])
  }

  const filteredItems = shoppingList.filter((item) => {
    if (filter === "all") return true
    if (filter === "pending") return !item.completed
    if (filter === "completed") return item.completed
    return true
  })

  // Agrupar por categoría
  const groupedItems: Record<string, typeof shoppingList> = {}
  filteredItems.forEach((item) => {
    const category = item.category || "Sin categoría"
    if (!groupedItems[category]) {
      groupedItems[category] = []
    }
    groupedItems[category].push(item)
  })

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === "all" && styles.activeFilter]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterText, filter === "all" && styles.activeFilterText]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === "pending" && styles.activeFilter]}
          onPress={() => setFilter("pending")}
        >
          <Text style={[styles.filterText, filter === "pending" && styles.activeFilterText]}>Pendientes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === "completed" && styles.activeFilter]}
          onPress={() => setFilter("completed")}
        >
          <Text style={[styles.filterText, filter === "completed" && styles.activeFilterText]}>Completados</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.itemList}>
        {Object.keys(groupedItems).length > 0 ? (
          Object.entries(groupedItems).map(([category, items]) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {items.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <TouchableOpacity
                    style={[styles.checkbox, item.completed && styles.checkboxChecked]}
                    onPress={() => toggleShoppingItem(item.id)}
                  >
                    {item.completed && <Check size={16} color="#fff" />}
                  </TouchableOpacity>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, item.completed && styles.itemCompleted]}>{item.name}</Text>
                    {item.quantity && <Text style={styles.itemQuantity}>Cantidad: {item.quantity}</Text>}
                  </View>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteItem(item.id)}>
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <ShoppingCart size={48} color="#d1d5db" />
            <Text style={styles.emptyStateText}>Tu lista de la compra está vacía</Text>
            <Text style={styles.emptyStateSubtext}>Añade artículos usando el botón +</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Plus color="white" size={24} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Añadir artículo</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre del artículo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Leche, Pan, Huevos..."
                value={itemName}
                onChangeText={setItemName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cantidad (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 1L, 500g, 2 unidades..."
                value={itemQuantity}
                onChangeText={setItemQuantity}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Categoría (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Lácteos, Frutas, Limpieza..."
                value={itemCategory}
                onChangeText={setItemCategory}
              />
            </View>

            <TouchableOpacity
              style={[styles.addButton, !itemName.trim() && styles.addButtonDisabled]}
              onPress={handleAddItem}
              disabled={!itemName.trim()}
            >
              <Text style={styles.addButtonText}>Añadir a la lista</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  filterContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activeFilter: {
    backgroundColor: "#e0e7ff",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  activeFilterText: {
    color: THEME_COLORS.primary,
    fontWeight: "600",
  },
  itemList: {
    flex: 1,
    padding: 16,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4b5563",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: THEME_COLORS.primary,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  itemCompleted: {
    textDecorationLine: "line-through",
    color: "#9ca3af",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
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
    padding: 20,
    maxHeight: "80%",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  addButtonDisabled: {
    backgroundColor: "#c7d2fe",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

