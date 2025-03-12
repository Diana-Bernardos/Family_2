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
import { Send, Trash2, Calendar, Plus } from "lucide-react-native"
import { useFamilyStore } from "../../stores/familyStore"
import { THEME_COLORS } from "../../constants/theme"

type Message = {
  id: string
  text: string
  sender: "user" | "assistant"
  timestamp: Date
}

// Tipo para comandos reconocidos
type CommandIntent = {
  type: 'addEvent' | 'addActivity' | 'addShoppingItem' | 'none'
  data: any
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

  // Acceder a las funciones y datos del store
  const {
    members,
    events,
    shoppingList,
    schoolActivities,
    addEvent,
    addSchoolActivity,
    addShoppingItem
  } = useFamilyStore()

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

    // Procesar el mensaje y determinar si contiene comandos
    const userInput = input.trim()
    const { response, command } = processUserInput(userInput)

    // Ejecutar comandos detectados
    if (command.type !== 'none') {
      try {
        executeCommand(command)
      } catch (error) {
        console.error("Error al ejecutar comando:", error)
      }
    }

    // Simular respuesta del asistente con un pequeño retraso
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  const executeCommand = (command: CommandIntent) => {
    switch (command.type) {
      case 'addEvent':
        const eventId = Date.now().toString()
        addEvent({
          id: eventId,
          title: command.data.title,
          date: command.data.date,
          time: command.data.time || "00:00",
          color: command.data.color || "#3B82F6", // Azul por defecto
          memberId: command.data.memberId
        })
        break
      case 'addActivity':
        const activityId = Date.now().toString()
        addSchoolActivity({
          id: activityId,
          title: command.data.title,
          date: command.data.date,
          time: command.data.time,
          description: command.data.description || "",
          location: command.data.location || "",
          studentId: command.data.studentId || "",
          color: command.data.color || "#10B981" // Verde por defecto
        })
        break
      case 'addShoppingItem':
        const itemId = Date.now().toString()
        addShoppingItem({
          id: itemId,
          name: command.data.name,
          completed: false,
          quantity: command.data.quantity || "1",
          category: command.data.category || "general",
          addedBy: command.data.addedBy || ""
        })
        break
    }
  }

  // Formatear fecha a formato YYYY-MM-DD
  const formatDate = (dateStr: string): string => {
    // Intentar varios formatos comunes en español
    if (dateStr.includes("/")) {
      // Formato DD/MM/YYYY
      const parts = dateStr.split("/")
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      }
    } else if (dateStr.includes(" de ")) {
      // Formato "DD de Mes de YYYY" o "DD de Mes"
      const months: {[key: string]: string} = {
        "enero": "01", "febrero": "02", "marzo": "03", "abril": "04",
        "mayo": "05", "junio": "06", "julio": "07", "agosto": "08",
        "septiembre": "09", "octubre": "10", "noviembre": "11", "diciembre": "12"
      }
      
      try {
        let day = ""
        let month = ""
        let year = new Date().getFullYear().toString()
        
        const dayMatch = dateStr.match(/(\d{1,2})\s+de/i)
        if (dayMatch && dayMatch[1]) {
          day = dayMatch[1].padStart(2, '0')
        }
        
        for (const [monthName, monthNum] of Object.entries(months)) {
          if (dateStr.toLowerCase().includes(monthName)) {
            month = monthNum
            break
          }
        }
        
        const yearMatch = dateStr.match(/de\s+(\d{4})/i)
        if (yearMatch && yearMatch[1]) {
          year = yearMatch[1]
        }
        
        if (day && month) {
          return `${year}-${month}-${day}`
        }
      } catch (error) {
        console.error("Error parsing date:", error)
      }
    }
    
    // Si no se pudo analizar, usar la fecha actual
    const today = new Date()
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
  }

  // Formatear hora a formato HH:MM
  const formatTime = (timeStr: string): string => {
    if (timeStr.includes(":")) {
      // Ya está en formato HH:MM o H:MM
      const parts = timeStr.split(":")
      if (parts.length === 2) {
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
      }
    } else {
      // Solo hora sin minutos
      return `${timeStr.padStart(2, '0')}:00`
    }
    
    // Si no se pudo analizar, usar mediodía
    return "12:00"
  }

  const processUserInput = (userInput: string): { response: string, command: CommandIntent } => {
    const lowerInput = userInput.toLowerCase()

    // Detectar patrones para añadir eventos
    const addEventPattern = /añadir evento|crear evento|agregar evento|nuevo evento/i
    const addActivityPattern = /añadir actividad|crear actividad|agregar actividad|nueva actividad escolar/i
    const addShoppingItemPattern = /añadir a la lista|agregar a la compra|comprar/i

    // Extraer información de fecha
    const datePattern = /el (\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2} de [a-zá-úñ]+ de \d{4}|\d{1,2} de [a-zá-úñ]+)/i
    const timePattern = /(a las|a la) (\d{1,2}:\d{2}|\d{1,2})/i
    
    // Comando por defecto
    let command: CommandIntent = { type: 'none', data: {} }
    
    // Verificar si es un comando para añadir evento
    if (addEventPattern.test(lowerInput)) {
      // Extraer título del evento (el texto entre "evento" y "el")
      let title = ""
      const titleMatch = userInput.match(/(?:añadir evento|crear evento|agregar evento|nuevo evento)\s+(.*?)(?=\sel\s|$)/i)
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim()
      } else {
        // Si no se encuentra un patrón específico, usar el texto después de "evento"
        const fallbackTitleMatch = userInput.match(/(?:añadir evento|crear evento|agregar evento|nuevo evento)\s+(.*)/i)
        if (fallbackTitleMatch && fallbackTitleMatch[1]) {
          title = fallbackTitleMatch[1].trim()
        }
      }
      
      // Si hay título, procesar fecha y hora
      if (title) {
        let dateStr = ""
        let timeStr = ""
        
        // Extraer fecha
        const dateMatch = userInput.match(datePattern)
        if (dateMatch && dateMatch[1]) {
          dateStr = formatDate(dateMatch[1])
        } else {
          dateStr = formatDate(new Date().toLocaleDateString())
        }
        
        // Extraer hora
        const timeMatch = userInput.match(timePattern)
        if (timeMatch && timeMatch[2]) {
          timeStr = formatTime(timeMatch[2])
        } else {
          timeStr = "12:00" // Hora por defecto
        }
        
        // Buscar si hay asignación a un miembro específico
        let memberId = undefined
        const forMemberMatch = userInput.match(/para\s+(.*?)(?:\s|$)/i)
        if (forMemberMatch && forMemberMatch[1]) {
          const memberName = forMemberMatch[1].trim().toLowerCase()
          const foundMember = members.find(member => 
            member.name.toLowerCase().includes(memberName) || 
            memberName.includes(member.name.toLowerCase())
          )
          
          if (foundMember) {
            memberId = foundMember.id
          }
        }
        
        command = {
          type: 'addEvent',
          data: {
            title,
            date: dateStr,
            time: timeStr,
            memberId
          }
        }
        
        let memberText = ""
        if (memberId) {
          const member = members.find(m => m.id === memberId)
          if (member) {
            memberText = ` para ${member.name}`
          }
        }
        
        return {
          response: `He añadido el evento "${title}" a tu calendario${memberText} para el ${dateStr} a las ${timeStr}.`,
          command
        }
      }
    }
    // Verificar si es un comando para añadir actividad escolar
    else if (addActivityPattern.test(lowerInput)) {
      // Lógica similar a la de eventos, adaptada para actividades
      let title = ""
      const titleMatch = userInput.match(/(?:añadir actividad|crear actividad|agregar actividad|nueva actividad)\s+(.*?)(?=\sel\s|$)/i)
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim()
      } else {
        const fallbackTitleMatch = userInput.match(/(?:añadir actividad|crear actividad|agregar actividad|nueva actividad)\s+(.*)/i)
        if (fallbackTitleMatch && fallbackTitleMatch[1]) {
          title = fallbackTitleMatch[1].trim()
        }
      }
      
      if (title) {
        let dateStr = ""
        let timeStr = ""
        
        const dateMatch = userInput.match(datePattern)
        if (dateMatch && dateMatch[1]) {
          dateStr = formatDate(dateMatch[1])
        } else {
          dateStr = formatDate(new Date().toLocaleDateString())
        }
        
        const timeMatch = userInput.match(timePattern)
        if (timeMatch && timeMatch[2]) {
          timeStr = formatTime(timeMatch[2])
        }
        
        command = {
          type: 'addActivity',
          data: {
            title,
            date: dateStr,
            time: timeStr
          }
        }
        
        return {
          response: `He añadido la actividad escolar "${title}" para el ${dateStr}${timeStr ? ` a las ${timeStr}` : ""}.`,
          command
        }
      }
    }
    // Verificar si es un comando para añadir artículo a la lista de compras
    else if (addShoppingItemPattern.test(lowerInput)) {
      const itemMatch = userInput.match(/(?:añadir a la lista|agregar a la compra|comprar)\s+(.*?)(?=\sen\s|$)/i)
      let itemName = ""
      
      if (itemMatch && itemMatch[1]) {
        itemName = itemMatch[1].trim()
      }
      
      if (itemName) {
        // Extraer cantidad si existe
        let quantity = "1"
        const quantityMatch = userInput.match(/(\d+)\s+(?:unidades|kilos|kg|litros|l|paquetes|cajas)/i)
        if (quantityMatch && quantityMatch[1]) {
          quantity = quantityMatch[1]
        }
        
        command = {
          type: 'addShoppingItem',
          data: {
            name: itemName,
            quantity
          }
        }
        
        return {
          response: `He añadido "${itemName}" a tu lista de la compra.`,
          command
        }
      }
    }
    
    // Si no es un comando, generar respuesta normal
    return {
      response: generateAssistantResponse(userInput),
      command
    }
  }

  const generateAssistantResponse = (userInput: string) => {
    const lowerInput = userInput.toLowerCase()

    // Respuestas sobre el calendario
    if (lowerInput.includes("evento") || lowerInput.includes("calendario")) {
      if (events.length === 0) {
        return "No tienes eventos programados en tu calendario familiar. Puedes añadir uno diciendo 'Añadir evento [título] el [fecha] a las [hora]'."
      }

      const upcomingEvents = events
        .filter((event) => {
          const eventDate = new Date(event.date)
          const today = new Date()
          return eventDate >= today
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      if (upcomingEvents.length === 0) {
        return "No tienes eventos próximos en tu calendario. Puedes añadir uno diciendo 'Añadir evento [título] el [fecha] a las [hora]'."
      }

      const nextEvent = upcomingEvents[0]
      return `Tu próximo evento es "${nextEvent.title}" el ${nextEvent.date} a las ${nextEvent.time}. En total tienes ${upcomingEvents.length} eventos próximos. Puedes añadir más eventos diciéndome 'Añadir evento [título] el [fecha] a las [hora]'.`
    }

    // Respuestas sobre la lista de compras
    if (lowerInput.includes("compra") || lowerInput.includes("lista") || lowerInput.includes("supermercado")) {
      if (shoppingList.length === 0) {
        return "Tu lista de la compra está vacía. Puedes añadir artículos diciendo 'Añadir a la lista [artículo]'."
      }

      const pendingItems = shoppingList.filter((item) => !item.completed)

      if (pendingItems.length === 0) {
        return "¡Genial! Has completado todos los artículos de tu lista de la compra."
      }

      return `Tienes ${pendingItems.length} artículos pendientes en tu lista de la compra. Los más recientes son: ${pendingItems
        .slice(0, 3)
        .map((item) => item.name)
        .join(", ")}... Puedes añadir más artículos diciendo 'Añadir a la lista [artículo]'.`
    }

    // Respuestas sobre actividades escolares
    if (lowerInput.includes("escuela") || lowerInput.includes("colegio") || lowerInput.includes("escolar")) {
      if (schoolActivities.length === 0) {
        return "No hay actividades escolares programadas. Puedes añadir una diciendo 'Añadir actividad [título] el [fecha] a las [hora]'."
      }

      const upcomingActivities = schoolActivities
        .filter((activity) => {
          const activityDate = new Date(activity.date)
          const today = new Date()
          return activityDate >= today
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      if (upcomingActivities.length === 0) {
        return "No hay actividades escolares próximas. Puedes añadir una diciendo 'Añadir actividad [título] el [fecha] a las [hora]'."
      }

      const nextActivity = upcomingActivities[0]
      return `La próxima actividad escolar es "${nextActivity.title}" el ${nextActivity.date}${nextActivity.time ? ` a las ${nextActivity.time}` : ""}. En total hay ${upcomingActivities.length} actividades escolares próximas. Puedes añadir más diciendo 'Añadir actividad [título] el [fecha] a las [hora]'.`
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
      return "¡Hola! ¿En qué puedo ayudarte hoy con la organización familiar? Puedo añadir eventos, actividades escolares o artículos a la lista de la compra."
    }

    if (lowerInput.includes("gracias")) {
      return "¡De nada! Estoy aquí para ayudarte con la organización familiar. ¿Necesitas algo más?"
    }

    if (lowerInput.includes("ayuda") || lowerInput.includes("puedes hacer")) {
      return `Puedo ayudarte con la organización familiar:
      
- Ver y añadir eventos al calendario diciendo "Añadir evento [título] el [fecha] a las [hora]"
- Gestionar tu lista de la compra diciendo "Añadir a la lista [artículo]"
- Organizar actividades escolares diciendo "Añadir actividad [título] el [fecha] a las [hora]"
- Consultar información sobre los miembros de tu familia

¿En qué te puedo ayudar hoy?`
    }

    // Respuesta por defecto
    return "Entiendo. Recuerda que puedo añadir eventos al calendario, artículos a la lista de la compra y actividades escolares. ¿Necesitas ayuda con alguna de estas tareas?"
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
        <Text style={styles.headerTitle}>Asistente Familiar</Text>
        <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
          <Trash2 size={20} color={THEME_COLORS.muted} />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
        <View style={styles.helpBubble}>
          <Text style={styles.helpText}>Puedes pedirme que añada eventos diciendo "Añadir evento [título] el [fecha] a las [hora]"</Text>
        </View>
        
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
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => setInput(prev => prev + "Añadir evento ")}
          >
            <Calendar size={16} color={THEME_COLORS.primary} />
            <Text style={styles.quickActionText}>Evento</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => setInput(prev => prev + "Añadir a la lista ")}
          >
            <Plus size={16} color={THEME_COLORS.primary} />
            <Text style={styles.quickActionText}>Compra</Text>
          </TouchableOpacity>
        </View>
        
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME_COLORS.text,
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
  helpBubble: {
    backgroundColor: THEME_COLORS.light,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    alignSelf: 'center',
    maxWidth: '90%',
  },
  helpText: {
    fontSize: 14,
    color: THEME_COLORS.muted,
    textAlign: 'center',
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
  quickActions: {
    flexDirection: "row",
    marginBottom: 8,
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME_COLORS.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  quickActionText: {
    fontSize: 14,
    color: THEME_COLORS.primary,
    marginLeft: 4,
  },
  inputContainer: {
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
    marginTop: 8,
  },
  sendButtonDisabled: {
    backgroundColor: THEME_COLORS.light,
  },
})