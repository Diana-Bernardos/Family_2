import { View, Text, StyleSheet } from "react-native"
import { useFamilyStore } from "../stores/familyStore"

export default function Page() {
  const { members } = useFamilyStore()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a la Aplicación Familiar</Text>
      <Text style={styles.subtitle}>Miembros de la familia:</Text>
      {members.length > 0 ? (
        members.map((member) => (
          <Text key={member.id} style={styles.memberName}>
            {member.name}
          </Text>
        ))
      ) : (
        <Text style={styles.noMembers}>No hay miembros en la familia.</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 8,
  },
  memberName: {
    fontSize: 16,
    color: "#1f2937",
  },
  noMembers: {
    fontSize: 16,
    color: "#9ca3af",
  },
})

