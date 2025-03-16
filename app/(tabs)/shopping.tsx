"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useFamilyStore } from "../../stores/familyStore"
import { Check, Plus, Edit, Trash2 } from "lucide-react-native"
import ShareButton from "../../components/SimpleShareButton"
import { THEME_COLORS } from "../../constants/theme"

export default function ShoppingList() {
  const [newItem, setNewItem] = useState("")
  const [editingItem, setEditingItem] = useState<{ id: string; name: string; quantity: string }>()
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editName, setEditName] = useState("")
  const [editQuantity, setEditQuantity] = useState("")
  const { shoppingList, addShoppingItem, toggleShoppingItem, updateShoppingItem, removeShoppingItem } = useFamilyStore()

  const handleAddItem = () => {
    if (newItem.trim()) {
      addShoppingItem({
        id: Date.now().toString(),
        name: newItem.trim(),
        completed: false,
        quantity: "1",
        category: "general",
      })
      setNewItem("")
    }
  }

  const handleEditItem = (item: { id: string; name: string; quantity?: string }) => {
    setEditingItem(item)
    setEditName(item.name)
    setEditQuantity(item.quantity || "1")
    setEditModalVisible(true)
  }

  const saveEditedItem = () => {
    if (editingItem && editName.trim()) {
      updateShoppingItem(editingItem.id, {
        name: editName.trim(),
        quantity: editQuantity.trim() || "1",
      })
      setEditModalVisible(false)
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

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity style={styles.checkboxContainer} onPress={() => toggleShoppingItem(item.id)}>
        <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
          {item.completed && <Check size={16} color="#fff" />}
        </View>
      </TouchableOpacity>
      <View style={styles.itemDetails}>
        <Text style={[styles.itemText, item.completed && styles.itemTextChecked]}>{item.name}</Text>
        {item.quantity && item.quantity !== "1" && (
          <Text style={styles.quantityText}>{item.quantity} unidades</Text>
        )}
      </View>
      <View style={styles.itemActions}>
        {/* Botón de compartir implementado aquí */}
        <ShareButton
          contentId={item.id}
          contentType="shopping"
          contentTitle={item.name}
          size={18}
          style={styles.actionButton}
        />
        <TouchableOpacity style={styles.actionButton} onPress={() => handleEditItem(item)}>
          <Edit size={18} color={THEME_COLORS.muted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteItem(item.id)}>
          <Trash2 size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lista de la Compra</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Añadir nuevo artículo"
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={handleAddItem}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listHeaderText}>Artículos</Text>
          <Text style={styles.listCountText}>
            {shoppingList.filter((item) => !item.completed).length} pendientes ·{" "}
            {shoppingList.filter((item) => item.completed).length} completados
          </Text>
        </View>

        <FlatList
          data={shoppingList.sort((a, b) => {
            // Ordenar por completado (primero no completados) y luego por id (para mantener orden de creación)
            if (a.completed !== b.completed) {
              return a.completed ? 1 : -1
            }
            return a.id > b.id ? -1 : 1
          })}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay artículos en la lista de la compra</Text>
              <Text style={styles.emptySubtext}>Añade artículos usando el campo de arriba</Text>
            </View>
          }
        />
      </View>

      <Modal visible={editModalVisible} transparent animationType="fade" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar artículo</Text>
            
            <Text style={styles.inputLabel}>Nombre</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Nombre del artículo"
            />
            
            <Text style={styles.inputLabel}>Cantidad</Text>
            <TextInput
              style={styles.modalInput}
              value={editQuantity}
              onChangeText={setEditQuantity}
              placeholder="Cantidad"
              keyboardType="numeric"
            />
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={saveEditedItem}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1f2937",
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 8,
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
  },
  listHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4b5563",
  },
  listCountText: {
    fontSize: 12,
    color: "#6b7280",
  },
  list: {
    flex: 1,
    padding: 16,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: THEME_COLORS.primary,
  },
  itemDetails: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    color: "#1f2937",
  },
  itemTextChecked: {
    textDecorationLine: "line-through",
    color: "#6b7280",
  },
  quantityText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: THEME_COLORS.primary,
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4b5563",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
})