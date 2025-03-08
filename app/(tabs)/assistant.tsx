"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native"
import { Send, Trash2 } from "lucide-react-native"
import { useFamilyStore } from "../../stores/familyStore"
import { THEME_COLORS } from "../../constants/theme"

type Message = {
  id: string
  text: string
  sender: "user" | "assistant"
  timestamp: Date
}

export default function Assistant() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "¡Hola! Soy tu asistente familiar. ¿En qué puedo ayudarte hoy?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)

  const { members, events, shoppingList, schoolActivities } = useFamilyStore()

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simular respuesta del asistente
    setTimeout(() => {
      const assistantResponse = generateAssistantResponse(input.trim())

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: assistantResponse,
        sender: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  const generateAssistantResponse = (userInput: string) => {
    const lowerInput = userInput.toLowerCase()

    // Respuestas sobre el calendario
    if (lowerInput.includes("evento") || lowerInput.includes("calendario")) {
      if (events.length === 0) {
        return "No tienes eventos programados en tu calendario familiar. ¿Quieres añadir uno nuevo?"
      }

      const upcomingEvents = events
        .filter((event) => {
          const eventDate = new Date(event.date)
          const today = new Date()
          return eventDate >= today
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      if (upcomingEvents.length === 0) {
        return "No tienes eventos próximos en tu calendario. ¿Quieres añadir uno nuevo?"
      }

      const nextEvent = upcomingEvents[0]
      return `Tu próximo evento es "${nextEvent.title}" el ${nextEvent.date} a las ${nextEvent.time}. En total tienes ${upcomingEvents.length} eventos próximos.`
    }

    // Respuestas sobre la lista de compras
    if (lowerInput.includes("compra") || lowerInput.includes("lista") || lowerInput.includes("supermercado")) {
      if (shoppingList.length === 0) {
        return "Tu lista de la compra está vacía. ¿Quieres añadir algún artículo?"
      }

      const pendingItems = shoppingList.filter((item) => !item.completed)

      if (pendingItems.length === 0) {
        return "¡Genial! Has completado todos los artículos de tu lista de la compra."
      }

      return `Tienes ${pendingItems.length} artículos pendientes en tu lista de la compra. Los más recientes son: ${pendingItems
        .slice(0, 3)
        .map((item) => item.name)
        .join(", ")}...`
    }

    // Respuestas sobre actividades escolares
    if (lowerInput.includes("escuela") || lowerInput.includes("colegio") || lowerInput.includes("escolar")) {
      if (schoolActivities.length === 0) {
        return "No hay actividades escolares programadas. ¿Quieres añadir alguna?"
      }

      const upcomingActivities = schoolActivities
        .filter((activity) => {
          const activityDate = new Date(activity.date)
          const today = new Date()
          return activityDate >= today
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      if (upcomingActivities.length === 0) {
        return "No hay actividades escolares próximas. ¿Quieres añadir alguna?"
      }

      const nextActivity = upcomingActivities[0]
      return `La próxima actividad escolar es "${nextActivity.title}" el ${nextActivity.date}${nextActivity.time ? ` a las ${nextActivity.time}` : ""}. En total hay ${upcomingActivities.length} actividades escolares próximas.`
    }

    // Respuestas sobre miembros de la familia
    if (lowerInput.includes("familia") || lowerInput.includes("miembro") || lowerInput.includes("familiar")) {
      if (members.length === 0) {
        return "No hay miembros en tu familia registrados. ¿Quieres añadir a alguien?"
      }

      return `Tu familia tiene ${members.length} miembros: ${members.map((m) => m.name).join(", ")}.`
    }

    // Respuestas generales
    if (lowerInput.includes("hola") || lowerInput.includes("buenos días") || lowerInput.includes("buenas")) {
      return "¡Hola! ¿En qué puedo ayudarte hoy con la organización familiar?"
    }

    if (lowerInput.includes("gracias")) {
      return "¡De nada! Estoy aquí para ayudarte con la organización familiar. ¿Necesitas algo más?"
    }

    if (lowerInput.includes("ayuda") || lowerInput.includes("puedes hacer")) {
      return "Puedo ayudarte con información sobre tu calendario familiar, lista de la compra, actividades escolares y miembros de la familia. ¿Sobre qué quieres saber más?"
    }

    // Respuesta por defecto
    return "Entiendo. ¿Puedes darme más detalles para poder ayudarte mejor con la organización familiar?"
  }

  const clearChat = () => {
    setMessages([
      {
        id: "1",
        text: "¡Hola! Soy tu asistente familiar. ¿En qué puedo ayudarte hoy?",
        sender: "assistant",
        timestamp: new Date(),
      },
    ])
  }

  useEffect(() => {
    // Scroll al final cuando se añaden nuevos mensajes
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
          <Trash2 size={20} color={THEME_COLORS.muted} />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageWrapper,
              message.sender === "user" ? styles.userMessageWrapper : styles.assistantMessageWrapper,
            ]}
          >
            <View style={[styles.message, message.sender === "user" ? styles.userMessage : styles.assistantMessage]}>
              <Text
                style={[
                  styles.messageText,
                  message.sender === "user" ? styles.userMessageText : styles.assistantMessageText,
                ]}
              >
                {message.text}
              </Text>
              <Text style={styles.timestamp}>
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          </View>
        ))}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={THEME_COLORS.primary} />
            <Text style={styles.loadingText}>Escribiendo...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!input.trim()}
        >
          <Send size={20} color={input.trim() ? "#fff" : THEME_COLORS.muted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.border,
  },
  clearButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 32,
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: "80%",
  },
  userMessageWrapper: {
    alignSelf: "flex-end",
  },
  assistantMessageWrapper: {
    alignSelf: "flex-start",
  },
  message: {
    padding: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  userMessage: {
    backgroundColor: THEME_COLORS.primary,
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    backgroundColor: THEME_COLORS.card,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: "#fff",
  },
  assistantMessageText: {
    color: THEME_COLORS.text,
  },
  timestamp: {
    fontSize: 10,
    color: THEME_COLORS.muted,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: THEME_COLORS.light,
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    color: THEME_COLORS.muted,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.border,
    backgroundColor: THEME_COLORS.card,
  },
  input: {
    flex: 1,
    backgroundColor: THEME_COLORS.light,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    color: THEME_COLORS.text,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: THEME_COLORS.light,
  },
})

