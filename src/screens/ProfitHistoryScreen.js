import React, { useState, useCallback } from 'react';
import { View, SectionList, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Text, Button } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { STORAGE_KEYS, getItems, deleteItem } from '../utils/storage';

const ProfitHistoryScreen = () => {
  const [items, setItems] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [])
  );

  const loadItems = async () => {
    const data = await getItems(STORAGE_KEYS.PROFIT);
    // Sort by date descending
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    setItems(data);
  };

  const handleDelete = async (id) => {
    const updatedItems = await deleteItem(STORAGE_KEYS.PROFIT, id);
    if (updatedItems) {
      updatedItems.sort((a, b) => new Date(b.date) - new Date(a.date));
      setItems(updatedItems);
    }
  };

  const groupItemsByMonth = (items) => {
    const grouped = {};
    items.forEach((item) => {
      const date = new Date(item.date);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(item);
    });

    return Object.keys(grouped).map((key) => ({
      title: key,
      data: grouped[key],
    }));
  };

  const sections = groupItemsByMonth(items);

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: item.amount >= 0 ? 'green' : 'red' }}>
                {item.type ? item.type.toUpperCase() : (item.amount >= 0 ? 'WITHDRAW' : 'DEPOSIT')} {Math.abs(item.amount)}
              </Text>
              <Text variant="bodyMedium">{item.date}</Text>
              {item.note ? <Text variant="bodyMedium">{item.note}</Text> : null}
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => handleDelete(item.id)}>Delete</Button>
            </Card.Actions>
          </Card>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.headerText}>{title}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No history found.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  card: { marginBottom: 10 },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: '#f5f5f5',
  },
  headerText: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
});

export default ProfitHistoryScreen;
