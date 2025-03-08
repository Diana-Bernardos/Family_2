"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, Alert } from "react-native"
import { Plus, Trash2, Calendar, ChevronRight } from "lucide-react-native"
import { useFamilyStore } from "../../stores/familyStore"
import AddFamilyMember from "../../components/AddFamilyMember"
import { THEME_COLORS } from "../../constants/theme"
import { useRouter } from "expo-router"

export default function FamilyMembers() {
  const [modalVisible, setModalVisible] = useState(false)
  const { members, removeMember, events } = useFamilyStore()
  const router = useRouter()

  const handleDeleteMember = (id: string) => {
    Alert.alert(
      "Eliminar miembro",
      "¿Estás seguro de que quieres eliminar a este miembro de la familia? Se eliminarán también todos sus eventos asociados.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => removeMember(id),
        },
      ],
    )
  }

  // Función para contar eventos por miembro
  const countEventsByMember = (memberId: string) => {
    return events.filter((event) => event.memberId === memberId).length
  }

  // Función para navegar al calendario personal
  const navigateToMemberCalendar = (memberId: string) => {
    router.push(`/member/${memberId}`)
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.memberList}>
        {members.length > 0 ? (
          members.map((member) => {
            const eventCount = countEventsByMember(member.id)
            return (
              <TouchableOpacity
                key={member.id}
                style={styles.memberCard}
                onPress={() => navigateToMemberCalendar(member.id)}
                activeOpacity={0.7}
              >
                <View style={styles.memberInfo}>
                  <Image source={{ uri: member.avatar }} style={styles.avatar} />
                  <View style={styles.memberDetails}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.eventCount}>
                      {eventCount} {eventCount === 1 ? "evento" : "eventos"}
                    </Text>
                  </View>
                </View>
                <View style={styles.memberActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation()
                      handleDeleteMember(member.id)
                    }}
                  >
                    <Trash2 size={20} color="#ef4444" />
                  </TouchableOpacity>
                  <ChevronRight size={20} color={THEME_COLORS.primary} />
                </View>
              </TouchableOpacity>
            )
          })
        ) : (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#d1d5db" />
            <Text style={styles.emptyStateText}>No hay miembros en la familia</Text>
            <Text style={styles.emptyStateSubtext}>Añade miembros usando el botón +</Text>
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
            <AddFamilyMember onClose={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  memberList: {
    flex: 1,
    padding: 16,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  eventCount: {
    fontSize: 14,
    color: "#6b7280",
  },
  memberActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginRight: 8,
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
    maxHeight: "80%",
  },
})

