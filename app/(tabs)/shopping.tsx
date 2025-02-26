"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from "react-native"
import { Plus, ShoppingBag, Trash2, Check, ChevronRight } from "lucide-react-native"
import { useFamilyStore, THEME_COLORS, FONTS, ShoppingList } from "../../stores/familyStore"
import AddShoppingList from "../../components/AddShoppingList"
import { router } from "expo-router"

export default function ShoppingLists() {
  const { shoppingLists, removeShoppingList } = useFamilyStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const handleDeleteList = (id: string) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro que deseas eliminar esta lista de compras?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Eliminar", 
          onPress: () => {
            removeShoppingList(id);
            setRefresh(prev => prev + 1);
          },
          style: "destructive"
        }
      ]
    );
  };

  const navigateToListDetail = (list: ShoppingList) => {
    router.push({
      pathname: "/shopping-detail",
      params: { listId: list.id }
    });
  };

  const getCompletedItemsCount = (list: ShoppingList) => {
    return list.items.filter(item => item.completed).length;
  };

  const getTotalItemsCount = (list: ShoppingList) => {
    return list.items.length;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Listas de Compras</Text>
      </View>

      <ScrollView style={styles.listContainer}>
        {shoppingLists.length === 0 ? (
          <View style={styles.emptyState}>
            <ShoppingBag size={48} color={THEME_COLORS.primary} />
            <Text style={styles.emptyText}>No hay listas de compras</Text>
            <Text style={styles.emptySubtext}>Crea una lista para tus compras familiares</Text>
          </View>
        ) : (
          shoppingLists.map((list) => (
            <View key={list.id} style={styles.listCard}>
              <TouchableOpacity 
                style={styles.listInfo}
                onPress={() => navigateToListDetail(list)}
              >
                <View style={styles.listHeader}>
                  <Text style={styles.listName}>{list.name}</Text>
                  {list.forDate && (
                    <Text style={styles.listDate}>Para: {list.forDate}</Text>
                  )}
                </View>
                
                <View style={styles.listStats}>
                  <Text style={styles.listItemCount}>
                    {getCompletedItemsCount(list)}/{getTotalItemsCount(list)} productos
                  </Text>
                  <ChevronRight size={16} color={THEME_COLORS.text} />
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteList(list.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash2 size={18} color="#ef4444" />
              </TouchableOpacity>
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
            <AddShoppingList 
              onClose={() => {
                setModalVisible(false);
                setRefresh(prev => prev + 1);
              }}
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME_COLORS.primary,
    fontFamily: FONTS.bold,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.text,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: FONTS.bold,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  listCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listInfo: {
    flex: 1,
  },
  listHeader: {
    marginBottom: 8,
  },
  listName: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME_COLORS.text,
    fontFamily: FONTS.semiBold,
  },
  listDate: {
    fontSize: 12,
    color: "#666",
    fontFamily: FONTS.regular,
  },
  listStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listItemCount: {
    fontSize: 14,
    color: THEME_COLORS.text,
    fontFamily: FONTS.regular,
  },
  deleteButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
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