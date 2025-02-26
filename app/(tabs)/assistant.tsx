"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native"
import { Send } from "lucide-react-native"
import { THEME_COLORS } from "../../stores/familyStore"
import { useNavigation } from "@react-navigation/native"
import { generateResponse } from "../../utils/ollamaApi"
import { useFamilyStore } from "../../stores/familyStore"

export default function Assistant() {
  const [message, setMessage] = useState("")
  const [chat, setChat] = useState([
    {
      type: "assistant",
      content: "¡Hola! Soy tu asistente familiar. ¿En qué puedo ayudarte hoy?",
    },
  ])
  const navigation = useNavigation()
  const { members, events } = useFamilyStore()

  const sendMessage = async () => {
    if (!message.trim()) return

    const newMessage = {
      type: "user",
      content: message,
    }

    setChat((prev) => [...prev, newMessage])
    setMessage("")

    // Preparar el contexto para el modelo
    const context = `
      Información de la familia:
      Miembros: ${members.map((m) => m.name).join(", ")}
      Eventos próximos: ${events
        .slice(0, 5)
        .map((e) => `${e.title} el ${e.date}`)
        .join(", ")}
    `

    const prompt = `${context}\n\nUsuario: ${message}\n\nAsistente:`

    try {
      const response = await generateResponse(prompt)
      setChat((prev) => [...prev, { type: "assistant", content: response }])
    } catch (error) {
      console.error("Error generating response:", error)
      setChat((prev) => [
        ...prev,
        { type: "assistant", content: "Lo siento, ha ocurrido un error. Por favor, intenta de nuevo." },
      ])
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatContainer}>
        {chat.map((msg, index) => (
          <View
            key={index}
            style={[styles.message, msg.type === "user" ? styles.userMessage : styles.assistantMessage]}
          >
            <Text style={styles.messageText}>{msg.content}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu mensaje..."
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Send size={20} color={THEME_COLORS.background} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  message: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    backgroundColor: THEME_COLORS.blue,
    alignSelf: "flex-end",
  },
  assistantMessage: {
    backgroundColor: THEME_COLORS.green,
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    color: THEME_COLORS.text,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.blue,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  input: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
})

