import React, { useState, useCallback } from 'react';
import { View, SectionList, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Text, Button } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { STORAGE_KEYS, getItems, deleteItem } from '../utils/storage';

const ProfitHistoryScreen = ({ navigation }) => {
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

  const calculateMonthlyStats = (items) => {
    let deposit = 0;
    let withdraw = 0;
    let profit = 0;

    items.forEach((item) => {
      const amount = item.amount || 0;
      if (amount < 0) {
        deposit += Math.abs(amount);
      } else {
        withdraw += amount;
      }
      profit += amount;
    });

    return { deposit, withdraw, profit };
  };

  const renderSectionFooter = ({ section }) => {
    const { deposit, withdraw, profit } = calculateMonthlyStats(section.data);
    
    return (
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text variant="bodyMedium">Deposit:</Text>
          <Text variant="bodyMedium" style={{ color: 'red' }}>{deposit.toFixed(2)}</Text>
        </View>
        <View style={styles.footerRow}>
          <Text variant="bodyMedium">Withdraw:</Text>
          <Text variant="bodyMedium" style={{ color: 'green' }}>{withdraw.toFixed(2)}</Text>
        </View>
        <View style={[styles.footerRow, styles.footerTotal]}>
          <Text variant="titleMedium">Profit:</Text>
          <Text variant="titleMedium" style={{ color: profit >= 0 ? 'green' : 'red' }}>
            {profit > 0 ? '+' : ''}{profit.toFixed(2)}
          </Text>
        </View>
      </View>
    );
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
              <Button onPress={() => navigation.navigate('ProfitMain', { editItem: item })}>Edit</Button>
              <Button onPress={() => handleDelete(item.id)}>Delete</Button>
            </Card.Actions>
          </Card>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.headerText}>{title}</Text>
          </View>
        )}
        renderSectionFooter={renderSectionFooter}
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
  footer: {
    backgroundColor: 'white',
    padding: 10,
    marginTop: 5,
    marginBottom: 15,
    borderRadius: 8,
    elevation: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  footerTotal: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 5,
    marginTop: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
});

export default ProfitHistoryScreen;
