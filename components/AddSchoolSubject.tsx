// components/AddSchoolSubject.tsx
import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { X } from "lucide-react-native";
import { useFamilyStore, THEME_COLORS, FONTS } from "../stores/familyStore";

export default function AddSchoolSubject({ 
  onClose,
  memberId 
}: { 
  onClose: () => void,
  memberId: string
}) {
  const [name, setName] = useState("");
  const [teacher, setTeacher] = useState("");
  const [color, setColor] = useState(THEME_COLORS.blue);
  const { addSchoolSubject } = useFamilyStore();

  const handleSubmit = () => {
    if (name.trim()) {
      const newSubject = {
        id: Date.now().toString(),
        name: name.trim(),
        color,
        teacher: teacher.trim() || undefined,
        schedule: [],
        memberId,
      };
      
      addSchoolSubject(newSubject);
      onClose();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <X color={THEME_COLORS.primary} size={24} />
      </TouchableOpacity>
      <Text style={styles.title}>Nueva Materia Escolar</Text>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nombre de la materia"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nombre del profesor (opcional)"
            value={teacher}
            onChangeText={setTeacher}
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Color:</Text>
          <View style={styles.colorPicker}>
            {Object.values(THEME_COLORS).map((colorOption) => (
              <TouchableOpacity
                key={colorOption}
                style={[styles.colorOption, { backgroundColor: colorOption }, color === colorOption && styles.selectedColor]}
                onPress={() => setColor(colorOption)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, !name.trim() && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!name.trim()}
      >
        <Text style={styles.buttonText}>Guardar Materia</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    maxHeight: "80%",
  },
  scrollContainer: {
    maxHeight: 400,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    color: THEME_COLORS.primary,
    textAlign: "center",
    fontFamily: FONTS.bold,
  },
  inputContainer: {
    backgroundColor: THEME_COLORS.blue,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  input: {
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: THEME_COLORS.text,
    fontFamily: FONTS.semiBold,
  },
  colorPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 8,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
  },
  button: {
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: FONTS.bold,
  },
});