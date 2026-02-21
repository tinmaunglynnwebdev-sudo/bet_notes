import React, { useState, useCallback } from 'react';
import { View, SectionList, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Text, Button } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { STORAGE_KEYS, getItems, deleteItem } from '../utils/storage';
import * as Print from 'expo-print';
import { Share } from 'react-native';

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

  const exportToPDF = async (section) => {
    const { title, data } = section;
    const { deposit, withdraw, profit } = calculateMonthlyStats(data);

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1a73e8; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .profit { color: ${profit >= 0 ? 'green' : 'red'}; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>BetNotes - ${title} Report</h1>
          <h2>Summary</h2>
          <p>Deposit: ${deposit.toFixed(2)}</p>
          <p>Withdraw: ${withdraw.toFixed(2)}</p>
          <p>Profit: <span class="profit">${profit > 0 ? '+' : ''}${profit.toFixed(2)}</span></p>
          <h2>Transactions</h2>
          <table>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Note</th>
            </tr>
            ${data.map(item => `
              <tr>
                <td>${item.date}</td>
                <td>${item.type ? item.type.toUpperCase() : (item.amount >= 0 ? 'WITHDRAW' : 'DEPOSIT')}</td>
                <td>${Math.abs(item.amount)}</td>
                <td>${item.note || ''}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;

    try {
      const file = await Print.printToFileAsync({ html });
      await Share.share({
        url: file.uri,
        title: `BetNotes ${title} Report`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
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
        <View style={styles.footerRow}>
          <Button mode="outlined" onPress={() => exportToPDF(section)} style={styles.exportButton}>
            Export PDF
          </Button>
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
  container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa' },
  card: { 
    marginBottom: 12, 
    borderRadius: 12, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4 
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerText: {
    fontWeight: '700',
    color: '#1a73e8',
  },
  footer: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  footerTotal: {
    borderTopWidth: 1,
    borderTopColor: '#dadce0',
    paddingTop: 8,
    marginTop: 8,
  },
  exportButton: { marginTop: 8, marginBottom: 8 },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    padding: 20,
  },
});

export default ProfitHistoryScreen;
