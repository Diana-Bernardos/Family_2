import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from "react-native"
import { Plus, ArrowLeft, Check, ShoppingBag, Trash2 } from "lucide-react-native"
import { useFamilyStore } from "../stores/familyStore"
import { THEME_COLORS, FONTS } from "../constants/theme" 
import type { ShoppingList, ShoppingItem } from "../stores/familyStore"
import { useLocalSearchParams, router } from "expo-router"
import AddShoppingItem from "../components/AddShoppingItem"

export default function ShoppingListDetail() {
  const { listId } = useLocalSearchParams();
  const { 
    shoppingLists, 
    toggleShoppingItem, 
    removeShoppingItem, 
    members 
  } = useFamilyStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [refresh, setRefresh] = useState(0);

  // Encontrar la lista seleccionada
  const list = shoppingLists.find(l => l.id === listId);

  // Obtener el nombre del miembro que creó la lista
  const getCreatorName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.name : "Desconocido";
  };

  const handleToggleItem = async (itemId: string) => {
    if (!list || !itemId) {
      console.error('ID de lista o item no válido');
      return;
    }
    
    try {
      await toggleShoppingItem(list.id, itemId);
      setRefresh(prev => prev + 1);
    } catch (error) {
      console.error("Error al cambiar estado del item:", error);
      Alert.alert(
        "Error",
        "Ocurrió un error al intentar marcar/desmarcar el item."
      );
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!list || !itemId) {
      console.error('ID de lista o item no válido para eliminación');
      return;
    }
    
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro que deseas eliminar este producto de la lista?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Eliminar", 
          onPress: async () => {
            try {
              await removeShoppingItem(list.id, itemId);
              setRefresh(prev => prev + 1);
              
              console.log(`Item ${itemId} eliminado de la lista ${list.id}`);
              
              Alert.alert(
                "Producto eliminado",
                "El producto ha sido eliminado de la lista."
              );
            } catch (error) {
              console.error("Error al eliminar item:", error);
              Alert.alert(
                "Error",
                "Ocurrió un error al intentar eliminar el item."
              );
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  // Agrupar items por categoría
  const groupItemsByCategory = (items: ShoppingItem[]) => {
    return items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, ShoppingItem[]>);
  };

  // Si no se encuentra la lista, mostrar un mensaje
  if (!list) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color={THEME_COLORS.primary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lista no encontrada</Text>
        </View>
      </View>
    );
  }

  const groupedItems = groupItemsByCategory(list.items);
  const categories = Object.keys(groupedItems).sort();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color={THEME_COLORS.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{list.name}</Text>
      </View>

      <View style={styles.listInfo}>
        <Text style={styles.listCreator}>
          Creada por: {getCreatorName(list.createdBy)}
        </Text>
        {list.forDate && (
          <Text style={styles.listDate}>Para: {list.forDate}</Text>
        )}
      </View>

      <ScrollView style={styles.itemsContainer}>
        {list.items.length === 0 ? (
          <View style={styles.emptyState}>
            <ShoppingBag size={48} color={THEME_COLORS.primary} />
            <Text style={styles.emptyText}>No hay productos en la lista</Text>
            <Text style={styles.emptySubtext}>Añade productos con el botón +</Text>
          </View>
        ) : (
          categories.map(category => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              
              {groupedItems[category].map(item => (
                <View key={item.id} style={styles.itemCard}>
                  <TouchableOpacity 
                    style={styles.checkButton}
                    onPress={() => handleToggleItem(item.id)}
                  >
                    <View style={[
                      styles.checkbox,
                      item.completed && styles.checkboxCompleted
                    ]}>
                      {item.completed && <Check size={16} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                  
                  <View style={styles.itemInfo}>
                    <Text style={[
                      styles.itemName,
                      item.completed && styles.itemCompleted
                    ]}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemQuantity}>
                      Cantidad: {item.quantity}
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.deleteItemButton}
                    onPress={() => handleDeleteItem(item.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
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
            <AddShoppingItem 
              onClose={() => {
                setModalVisible(false);
                setRefresh(prev => prev + 1);
              }}
              listId={list.id}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: THEME_COLORS.primary,
    fontFamily: FONTS.bold,
  },
  listInfo: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  listCreator: {
    fontSize: 14,
    color: THEME_COLORS.text,
    fontFamily: FONTS.regular,
  },
  listDate: {
    fontSize: 14,
    color: THEME_COLORS.text,
    fontFamily: FONTS.regular,
    marginTop: 4,
  },
  itemsContainer: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: THEME_COLORS.text,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: FONTS.bold,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontFamily: FONTS.regular,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: THEME_COLORS.primary,
    marginBottom: 8,
    fontFamily: FONTS.semiBold,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkButton: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxCompleted: {
    backgroundColor: THEME_COLORS.primary,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: THEME_COLORS.text,
    fontFamily: FONTS.regular,
  },
  itemCompleted: {
    textDecorationLine: "line-through",
    color: "#666",
  },
  itemQuantity: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    fontFamily: FONTS.regular,
  },
  deleteItemButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
});