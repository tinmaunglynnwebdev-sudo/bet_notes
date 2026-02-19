import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { TextInput, Button, Card, Text, Searchbar, IconButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { STORAGE_KEYS, addItem, getItems, deleteItem, updateItem } from '../utils/storage';

const PASTEL_COLORS = [
  '#FFF8E1', // Amber
  '#E3F2FD', // Blue
  '#F1F8E9', // Green
  '#FCE4EC', // Pink
  '#F3E5F5', // Purple
  '#E0F7FA', // Cyan
];

const NormalNotesScreen = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadItems();
    // Force reload
  }, []);

  const loadItems = async () => {
    const data = await getItems(STORAGE_KEYS.NORMAL_NOTES);
    if (data) {
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setItems(data);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || new Date(date);
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setDate(currentDate.toISOString().split('T')[0]);
  };

  const handleSave = async () => {
    if (!date || !notes) return;
    const itemData = { date, notes };

    let updatedItems;
    if (editingId) {
      updatedItems = await updateItem(STORAGE_KEYS.NORMAL_NOTES, { ...itemData, id: editingId });
    } else {
      updatedItems = await addItem(STORAGE_KEYS.NORMAL_NOTES, itemData);
    }

    if (updatedItems) {
      updatedItems.sort((a, b) => new Date(b.date) - new Date(a.date));
      setItems(updatedItems);
      resetForm();
    }
  };

  const resetForm = () => {
    setNotes('');
    setDate(new Date().toISOString().split('T')[0]);
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setDate(item.date);
    setNotes(item.notes);
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    const updatedItems = await deleteItem(STORAGE_KEYS.NORMAL_NOTES, id);
    if (updatedItems) {
      updatedItems.sort((a, b) => new Date(b.date) - new Date(a.date));
      setItems(updatedItems);
    }
  };

  const filteredItems = items.filter(item => 
    (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.date && item.date.includes(searchQuery))
  );

  const getColorForItem = (id) => {
    // Generate a consistent index based on the char codes of the ID
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % PASTEL_COLORS.length;
    return PASTEL_COLORS[index];
  };

  const renderNoteCard = (item) => (
    <Card key={item.id} style={[styles.card, { backgroundColor: getColorForItem(item.id) }]}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="labelMedium" style={styles.dateText}>{item.date}</Text>
          <View style={styles.cardActions}>
            <IconButton icon="pencil" size={18} onPress={() => handleEdit(item)} />
            <IconButton icon="delete" size={18} onPress={() => handleDelete(item.id)} />
          </View>
        </View>
        <Text variant="bodyMedium" style={styles.noteText}>{item.notes}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search notes..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={() => setShowDatePicker(!showDatePicker)}>
          <View pointerEvents="none">
            <TextInput
              label="Date"
              value={date}
              editable={false}
              right={<TextInput.Icon icon="calendar" />}
              style={styles.input}
            />
          </View>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={new Date(date)}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}
        <TextInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <View style={styles.formActions}>
          <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
            {editingId ? 'Update' : 'Add'}
          </Button>
          <Button mode="text" onPress={resetForm}>
            {editingId ? 'Cancel Edit' : 'Clear'}
          </Button>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.masonryContainer}>
          <View style={styles.column}>
            {filteredItems.filter((_, i) => i % 2 === 0).map(renderNoteCard)}
          </View>
          <View style={styles.column}>
            {filteredItems.filter((_, i) => i % 2 !== 0).map(renderNoteCard)}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  searchBar: { 
    marginBottom: 20, 
    elevation: 0, 
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    height: 48,
  },
  inputContainer: { 
    marginBottom: 20, 
    backgroundColor: 'white', 
    padding: 20, 
    borderRadius: 16,
    elevation: 4
  },
  input: { marginBottom: 12, backgroundColor: 'white' },
  formActions: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  saveButton: { flex: 1, marginRight: 12 },
  
  scrollContent: { paddingBottom: 100 },
  masonryContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { flex: 1, marginHorizontal: 8 },
  
  card: { marginBottom: 12, borderRadius: 16, elevation: 0 },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 8
  },
  dateText: { color: '#666', fontSize: 12, opacity: 0.7 },
  cardActions: { flexDirection: 'row', margin: -8 },
  noteText: { fontSize: 14, lineHeight: 24 },
});

export default NormalNotesScreen;