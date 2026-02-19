import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { TextInput, Button, Card, Text, SegmentedButtons } from 'react-native-paper';
import { STORAGE_KEYS, addItem, getItems, deleteItem } from '../utils/storage';

const ProfitScreen = () => {
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('deposit');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const data = await getItems(STORAGE_KEYS.PROFIT);
    setItems(data);
  };

  const handleAdd = async () => {
    if (!amount || !date) return;
    const value = Math.abs(parseFloat(amount));
    const finalAmount = transactionType === 'withdraw' ? value : -value;
    const newItem = { 
      amount: finalAmount, 
      type: transactionType,
      date, 
      note 
    };
    const updatedItems = await addItem(STORAGE_KEYS.PROFIT, newItem);
    if (updatedItems) {
      setItems(updatedItems);
      setAmount('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  };

  const handleDelete = async (id) => {
    const updatedItems = await deleteItem(STORAGE_KEYS.PROFIT, id);
    if (updatedItems) setItems(updatedItems);
  };

  const totalProfit = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <SegmentedButtons
          value={transactionType}
          onValueChange={setTransactionType}
          buttons={[
            {
              value: 'deposit',
              label: 'Deposit',
            },
            {
              value: 'withdraw',
              label: 'Withdraw',
            },
          ]}
          style={styles.segmentedButton}
        />
        <TextInput
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          label="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
          style={styles.input}
        />
        <TextInput
          label="Note"
          value={note}
          onChangeText={setNote}
          style={styles.input}
        />
        <Button mode="contained" onPress={handleAdd}>
          Add Record
        </Button>
      </View>
      <View style={styles.summaryContainer}>
        <Text variant="titleLarge">Total Profit: {totalProfit.toFixed(2)}</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: item.amount >= 0 ? 'green' : 'red' }}>
                {item.type ? item.type.toUpperCase() : (item.amount >= 0 ? 'WITHDRAW' : 'DEPOSIT')} {Math.abs(item.amount)}
              </Text>
              <Text variant="bodyMedium">{item.date}</Text>
              <Text variant="bodyMedium">{item.note}</Text>
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
  segmentedButton: { marginBottom: 10 },
  input: { marginBottom: 10, backgroundColor: 'white' },
  summaryContainer: { alignItems: 'center', marginBottom: 10 },
  card: { marginBottom: 10 },
});

export default ProfitScreen;
