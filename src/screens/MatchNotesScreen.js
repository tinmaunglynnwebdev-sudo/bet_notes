import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { TextInput, Button, Card, Text } from 'react-native-paper';
import { STORAGE_KEYS, addItem, getItems, deleteItem } from '../utils/storage';

const MatchNotesScreen = () => {
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [matchInfo, setMatchInfo] = useState('');
  const [handicap, setHandicap] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const data = await getItems(STORAGE_KEYS.MATCH_NOTES);
    setItems(data);
  };

  const handleAdd = async () => {
    if (!matchDate || !matchInfo) return;
    const newItem = { matchDate, matchInfo, handicap };
    const updatedItems = await addItem(STORAGE_KEYS.MATCH_NOTES, newItem);
    if (updatedItems) {
      setItems(updatedItems);
      setMatchInfo('');
      setHandicap('');
      setMatchDate(new Date().toISOString().split('T')[0]);
    }
  };

  const handleDelete = async (id) => {
    const updatedItems = await deleteItem(STORAGE_KEYS.MATCH_NOTES, id);
    if (updatedItems) setItems(updatedItems);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          label="Match Date Time"
          value={matchDate}
          onChangeText={setMatchDate}
          style={styles.input}
        />
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
        <Button mode="contained" onPress={handleAdd}>
          Add Match Note
        </Button>
      </View>
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

export default MatchNotesScreen;
