import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { TextInput, Button, Card, Text, SegmentedButtons } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { STORAGE_KEYS, addItem, getItems, deleteItem, updateItem } from '../utils/storage';

const ProfitScreen = ({ navigation, route }) => {
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('deposit');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadItems();
      // Force reload
    }, [])
  );

  useEffect(() => {
    if (route.params?.editItem) {
      handleEdit(route.params.editItem);
      // Clear params to avoid re-triggering
      navigation.setParams({ editItem: null });
    }
  }, [route.params?.editItem]);

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || new Date(date);
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setDate(currentDate.toISOString().split('T')[0]);
  };

  const loadItems = async () => {
    const data = await getItems(STORAGE_KEYS.PROFIT);
    // Sort by date descending
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    setItems(data);
  };

  const handleSave = async () => {
    if (!amount || !date) return;
    const value = Math.abs(parseFloat(amount));
    const finalAmount = transactionType === 'withdraw' ? value : -value;
    const itemData = { 
      amount: finalAmount, 
      type: transactionType,
      date, 
      note 
    };

    let updatedItems;
    if (editingId) {
      updatedItems = await updateItem(STORAGE_KEYS.PROFIT, { ...itemData, id: editingId });
    } else {
      updatedItems = await addItem(STORAGE_KEYS.PROFIT, itemData);
    }

    if (updatedItems) {
      updatedItems.sort((a, b) => new Date(b.date) - new Date(a.date));
      setItems(updatedItems);
      resetForm();
    }
  };

  const resetForm = () => {
    setAmount('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setTransactionType('deposit');
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setAmount(Math.abs(item.amount).toString());
    setTransactionType(item.amount >= 0 ? 'withdraw' : 'deposit');
    setDate(item.date);
    setNote(item.note || '');
    setEditingId(item.id);
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
          label="Note"
          value={note}
          onChangeText={setNote}
          style={styles.input}
        />
        <Button mode="contained" onPress={handleSave}>
          {editingId ? 'Update Record' : 'Add Record'}
        </Button>
        {editingId && (
          <Button mode="text" onPress={resetForm} style={{ marginTop: 5 }}>
            Cancel Edit
          </Button>
        )}
      </View>
      <View style={styles.summaryContainer}>
        <Text variant="titleLarge">Total Profit: {totalProfit.toFixed(2)}</Text>
      </View>
      <View style={styles.listHeader}>
        <Text variant="titleMedium">Recent 5 Records</Text>
        <Button mode="text" onPress={() => navigation.navigate('ProfitHistory')}>
          See All History
        </Button>
      </View>
      <FlatList
        data={items.slice(0, 5)}
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
  container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa' },
  inputContainer: { 
    backgroundColor: 'white', 
    padding: 20, 
    marginBottom: 20, 
    borderRadius: 16, 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8 
  },
  segmentedButton: { marginBottom: 16 },
  input: { marginBottom: 12, backgroundColor: '#f8f9fa' },
  summaryContainer: { 
    alignItems: 'center', 
    marginBottom: 20, 
    backgroundColor: '#e8f0fe', 
    padding: 16, 
    borderRadius: 12, 
    elevation: 2 
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  card: { 
    marginBottom: 12, 
    borderRadius: 12, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4 
  },
});

export default ProfitScreen;
