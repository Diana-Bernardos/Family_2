"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native"
import { Bell, Calendar, ShoppingCart, BookOpen, Clock, Trash2, CheckCircle2 } from "lucide-react-native"
import { useFamilyStore } from "../../stores/familyStore"

export default function Notifications() {
  const { notifications, markNotificationAsRead, removeNotification, clearAllNotifications } = useFamilyStore()

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")

  const handleClearAll = () => {
    if (notifications.length === 0) return

    Alert.alert("Limpiar notificaciones", "¿Estás seguro de que quieres eliminar todas las notificaciones?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: clearAllNotifications,
      },
    ])
  }

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id)
  }

  const handleDelete = (id: string) => {
    Alert.alert("Eliminar notificación", "¿Estás seguro de que quieres eliminar esta notificación?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => removeNotification(id),
      },
    ])
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "event":
        return <Calendar size={20} color="#6366f1" />
      case "shopping":
        return <ShoppingCart size={20} color="#10b981" />
      case "school":
        return <BookOpen size={20} color="#f59e0b" />
      case "reminder":
        return <Clock size={20} color="#ef4444" />
      default:
        return <Bell size={20} color="#6b7280" />
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true
    if (filter === "unread") return !notification.read
    if (filter === "read") return notification.read
    return true
  })

  // Agrupar por fecha
  const groupedNotifications: Record<string, typeof notifications> = {}
  filteredNotifications.forEach((notification) => {
    if (!groupedNotifications[notification.date]) {
      groupedNotifications[notification.date] = []
    }
    groupedNotifications[notification.date].push(notification)
  })

  // Ordenar fechas de más reciente a más antigua
  const sortedDates = Object.keys(groupedNotifications).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === "all" && styles.activeFilter]}
            onPress={() => setFilter("all")}
          >
            <Text style={[styles.filterText, filter === "all" && styles.activeFilterText]}>Todas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === "unread" && styles.activeFilter]}
            onPress={() => setFilter("unread")}
          >
            <Text style={[styles.filterText, filter === "unread" && styles.activeFilterText]}>No leídas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === "read" && styles.activeFilter]}
            onPress={() => setFilter("read")}
          >
            <Text style={[styles.filterText, filter === "read" && styles.activeFilterText]}>Leídas</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.clearButton} onPress={handleClearAll} disabled={notifications.length === 0}>
          <Text style={[styles.clearButtonText, notifications.length === 0 && styles.clearButtonDisabled]}>
            Limpiar todo
          </Text>
        </TouchableOpacity>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Bell size={48} color="#d1d5db" />
          <Text style={styles.emptyStateText}>No tienes notificaciones</Text>
        </View>
      ) : filteredNotifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Bell size={48} color="#d1d5db" />
          <Text style={styles.emptyStateText}>
            No hay notificaciones {filter === "unread" ? "no leídas" : "leídas"}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.notificationList}>
          {sortedDates.map((date) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{formatDate(date)}</Text>

              {groupedNotifications[date].map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[styles.notificationCard, !notification.read && styles.unreadNotification]}
                  onPress={() => handleMarkAsRead(notification.id)}
                >
                  <View style={styles.notificationIcon}>{getNotificationIcon(notification.type)}</View>

                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </View>

                  <View style={styles.notificationActions}>
                    {!notification.read && (
                      <TouchableOpacity style={styles.actionButton} onPress={() => handleMarkAsRead(notification.id)}>
                        <CheckCircle2 size={20} color="#10b981" />
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(notification.id)}>
                      <Trash2 size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

// Función para formatear la fecha
const formatDate = (dateString: string) => {
  const today = new Date().toISOString().split("T")[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

  if (dateString === today) {
    return "Hoy"
  } else if (dateString === yesterday) {
    return "Ayer"
  } else {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 12,
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
    color: "#6366f1",
    fontWeight: "600",
  },
  clearButton: {
    alignSelf: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ef4444",
  },
  clearButtonDisabled: {
    color: "#d1d5db",
  },
  notificationList: {
    flex: 1,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f9fafb",
  },
  notificationCard: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  unreadNotification: {
    backgroundColor: "#f0f9ff",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: "#9ca3af",
  },
  notificationActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6b7280",
    marginTop: 16,
    textAlign: "center",
  },
})

