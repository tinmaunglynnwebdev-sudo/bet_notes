import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { TextInput, Button, Card, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { STORAGE_KEYS, addItem, getItems, deleteItem, updateItem } from '../utils/storage';

const MatchNotesScreen = () => {
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [matchInfo, setMatchInfo] = useState('');
  const [handicap, setHandicap] = useState('');
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadItems();
    // Force reload
  }, []);

  const loadItems = async () => {
    const data = await getItems(STORAGE_KEYS.MATCH_NOTES);
    setItems(data);
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || new Date(matchDate);
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setMatchDate(currentDate.toISOString().split('T')[0]);
  };

  const handleSave = async () => {
    if (!matchDate || !matchInfo) return;
    const itemData = { matchDate, matchInfo, handicap };

    let updatedItems;
    if (editingId) {
      updatedItems = await updateItem(STORAGE_KEYS.MATCH_NOTES, { ...itemData, id: editingId });
    } else {
      updatedItems = await addItem(STORAGE_KEYS.MATCH_NOTES, itemData);
    }

    if (updatedItems) {
      setItems(updatedItems);
      resetForm();
    }
  };

  const resetForm = () => {
    setMatchInfo('');
    setHandicap('');
    setMatchDate(new Date().toISOString().split('T')[0]);
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setMatchDate(item.matchDate);
    setMatchInfo(item.matchInfo);
    setHandicap(item.handicap || '');
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    const updatedItems = await deleteItem(STORAGE_KEYS.MATCH_NOTES, id);
    if (updatedItems) setItems(updatedItems);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.formCard}>
        <Card.Title title={editingId ? "Edit Match Note" : "New Match Note"} />
        <Card.Content>
          <TouchableOpacity onPress={() => setShowDatePicker(!showDatePicker)}>
            <View pointerEvents="none">
              <TextInput
                label="Match Date"
                value={matchDate}
                editable={false}
                right={<TextInput.Icon icon="calendar" />}
                style={styles.input}
              />
            </View>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={new Date(matchDate)}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}
          <TextInput
            label="Match Info"
            value={matchInfo}
            onChangeText={setMatchInfo}
            style={styles.input}
          />
          <TextInput
            label="Handicap"
            value={handicap}
            onChangeText={setHandicap}
            style={styles.input}
          />
          <View style={styles.formActions}>
            <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
              {editingId ? 'Update' : 'Add'}
            </Button>
            {editingId && (
              <Button mode="text" onPress={resetForm} style={styles.cancelButton}>
                Cancel
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{item.matchInfo}</Text>
              <Text variant="bodyMedium">Date: {item.matchDate}</Text>
              <Text variant="bodyMedium">Handicap: {item.handicap}</Text>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => handleEdit(item)}>Edit</Button>
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
  formCard: { marginBottom: 15, elevation: 4, borderRadius: 12 },
  input: { marginBottom: 10, backgroundColor: 'white' },
  formActions: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  saveButton: { flex: 1, marginRight: 10 },
  cancelButton: { flex: 0.5 },
  card: { marginBottom: 10, borderRadius: 8 },
});

export default MatchNotesScreen;
