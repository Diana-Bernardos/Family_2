import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Plus } from 'lucide-react-native';

export default function PersonalCalendar() {
  const [selected, setSelected] = useState('');
  const [note, setNote] = useState('');

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={day => setSelected(day.dateString)}
        markedDates={{
          [selected]: {
            selected: true,
            selectedColor: '#6366f1',
          },
        }}
        theme={{
          todayTextColor: '#6366f1',
          selectedDayBackgroundColor: '#6366f1',
          arrowColor: '#6366f1',
        }}
      />

      <View style={styles.notesSection}>
        <Text style={styles.notesTitle}>Notas para {selected}</Text>
        <TextInput
          style={styles.noteInput}
          multiline
          placeholder="Escribe tus notas aquí..."
          value={note}
          onChangeText={setNote}
        />
      </View>

      <TouchableOpacity style={styles.fab}>
        <Plus color="white" size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  notesSection: {
    flex: 1,
    padding: 16,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  noteInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});