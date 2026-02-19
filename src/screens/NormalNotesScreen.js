import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { TextInput, Button, Card, Text } from 'react-native-paper';
import { STORAGE_KEYS, addItem, getItems, deleteItem } from '../utils/storage';

const NormalNotesScreen = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const data = await getItems(STORAGE_KEYS.NORMAL_NOTES);
    setItems(data);
  };

  const handleAdd = async () => {
    if (!date || !notes) return;
    const newItem = { date, notes };
    const updatedItems = await addItem(STORAGE_KEYS.NORMAL_NOTES, newItem);
    if (updatedItems) {
      setItems(updatedItems);
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  };

  const handleDelete = async (id) => {
    const updatedItems = await deleteItem(STORAGE_KEYS.NORMAL_NOTES, id);
    if (updatedItems) setItems(updatedItems);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          label="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
          style={styles.input}
        />
        <TextInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <Button mode="contained" onPress={handleAdd}>
          Add Note
        </Button>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="bodyMedium">{item.date}</Text>
              <Text variant="bodyMedium">{item.notes}</Text>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => handleDelete(item.id)}>Delete</Button>
            </Card.Actions>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  inputContainer: { marginBottom: 10 },
  input: { marginBottom: 10, backgroundColor: 'white' },
  card: { marginBottom: 10 },
});

export default NormalNotesScreen;
