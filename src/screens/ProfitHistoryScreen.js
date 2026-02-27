import React, { useState, useCallback } from 'react';
import { View, SectionList, StyleSheet, Share, Platform, RefreshControl, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Text, Button, Snackbar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS, getItems, deleteItem } from '../utils/storage';
import * as Print from 'expo-print';
import { useTheme } from '../contexts/ThemeContext';

const ProfitHistoryScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [items, setItems] = useState([]);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [refreshing, setRefreshing] = useState(false);

  const showSnackbar = (message, color = theme.colors.primary) => {
    setSnackbar({ visible: true, message, color });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

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

  const handleEdit = (item) => {
    navigation.navigate('ProfitMain', { editItem: item });
  };

  const handleDelete = async (id) => {
    const updatedItems = await deleteItem(STORAGE_KEYS.PROFIT, id);
    if (updatedItems) {
      updatedItems.sort((a, b) => new Date(b.date) - new Date(a.date));
      setItems(updatedItems);
      showSnackbar(t('deleted'), theme.colors.error);
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

    const isDarkMode = theme.dark;
    const bgColor = isDarkMode ? '#121212' : '#ffffff';
    const textColor = isDarkMode ? '#e8eaed' : '#202124';
    const primaryColor = theme.colors.primary;

    const html = `
      <html>
        <head>
          <style>
            body { font-family: -apple-system, sans-serif; padding: 40px; background-color: ${bgColor}; color: ${textColor}; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid ${primaryColor}; padding-bottom: 20px; }
            h1 { color: ${primaryColor}; margin: 0; }
            .summary { background-color: ${isDarkMode ? '#1e1e1e' : '#f8f9fa'}; padding: 20px; border-radius: 10px; margin: 30px 0; display: flex; justify-content: space-around; }
            .stat { text-align: center; }
            .stat-label { font-size: 12px; color: #5f6368; text-transform: uppercase; }
            .stat-value { font-size: 20px; font-weight: bold; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 12px; border-bottom: 1px solid #dadce0; color: #5f6368; font-size: 12px; text-transform: uppercase; }
            td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
            .deposit { color: #ea4335; }
            .withdraw { color: #34a853; }
            .profit-pos { color: #34a853; }
            .profit-neg { color: #ea4335; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BetNotes Report</h1>
            <div>${title}</div>
          </div>
          
          <div class="summary">
            <div class="stat">
              <div class="stat-label">${t('deposit')}</div>
              <div class="stat-value deposit">${deposit.toFixed(2)}</div>
            </div>
            <div class="stat">
              <div class="stat-label">${t('withdraw')}</div>
              <div class="stat-value withdraw">${withdraw.toFixed(2)}</div>
            </div>
            <div class="stat">
              <div class="stat-label">${t('total_profit')}</div>
              <div class="stat-value ${profit >= 0 ? 'profit-pos' : 'profit-neg'}">
                ${profit > 0 ? '+' : ''}${profit.toFixed(2)}
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>${t('date')}</th>
                <th>Type</th>
                <th>${t('note')}</th>
                <th style="text-align: right;">${t('amount')}</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(item => `
                <tr>
                  <td>${item.date}</td>
                  <td class="${item.amount >= 0 ? 'withdraw' : 'deposit'}">
                    ${item.type ? t(item.type).toUpperCase() : (item.amount >= 0 ? t('withdraw').toUpperCase() : t('deposit').toUpperCase())}
                  </td>
                  <td style="color: #5f6368;">${item.note || '-'}</td>
                  <td style="text-align: right; font-weight: 500;">${Math.abs(item.amount).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    try {
      const file = await Print.printToFileAsync({ html });
      await Share.share({
        url: Platform.OS === 'ios' ? file.uri : 'file://' + file.uri,
        title: `BetNotes ${title} Report`,
      });
      showSnackbar(t('export_pdf') + ' ' + t('saved'), theme.colors.secondary);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const renderSectionFooter = ({ section }) => {
    const { deposit, withdraw, profit } = calculateMonthlyStats(section.data);
    
    return (
      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.footerRow}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{t('deposit')}:</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.tertiary, fontWeight: 'bold' }}>{deposit.toFixed(2)}</Text>
        </View>
        <View style={styles.footerRow}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{t('withdraw')}:</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.secondary, fontWeight: 'bold' }}>{withdraw.toFixed(2)}</Text>
        </View>
        <View style={[styles.footerRow, styles.footerTotal, { borderTopColor: theme.colors.outlineVariant }]}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>{t('total_profit')}:</Text>
          <Text variant="titleMedium" style={{ color: profit >= 0 ? theme.colors.secondary : theme.colors.tertiary, fontWeight: 'bold' }}>
            {profit > 0 ? '+' : ''}{profit.toFixed(2)}
          </Text>
        </View>
        <Button 
          mode="contained" 
          icon="file-pdf-box"
          onPress={() => exportToPDF(section)} 
          style={{ marginTop: 14, borderRadius: 10 }}
        >
          {t('export_pdf')}
        </Button>
      </View>
    );
  };

  const sections = groupItemsByMonth(items);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
        renderItem={({ item }) => (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface, marginHorizontal: 16, marginBottom: 12 }]}>
            <Card.Content>
              <View style={styles.historyItemRow}>
                <View style={styles.historyItemLeft}>
                  <Text variant="titleMedium" style={{ color: item.amount >= 0 ? theme.colors.tertiary : theme.colors.secondary, fontWeight: '700' }}>
                    {item.type ? t(item.type) : (item.amount >= 0 ? t('deposit') : t('withdraw'))}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>{item.date}</Text>
                  {item.note ? <Text variant="bodySmall" style={{ color: theme.colors.onSurface, marginTop: 4 }}>{item.note}</Text> : null}
                </View>
                <View style={styles.historyItemRight}>
                  <Text variant="titleMedium" style={{ color: item.amount >= 0 ? theme.colors.tertiary : theme.colors.secondary, fontWeight: '700' }}>
                    {Math.abs(item.amount).toFixed(2)}
                  </Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: theme.colors.primaryContainer }]}
                      onPress={() => handleEdit(item)}
                    >
                      <Text style={{ color: theme.colors.primary, fontSize: 16, fontWeight: 'bold' }}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: theme.colors.errorContainer }]}
                      onPress={() => handleDelete(item.id)}
                    >
                      <Text style={{ color: theme.colors.error, fontSize: 16, fontWeight: 'bold' }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={[styles.header, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>{title}</Text>
          </View>
        )}
        renderSectionFooter={renderSectionFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>{t('no_history')}</Text>
          </View>
        }
      />
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar(prev => ({ ...prev, visible: false }))}
        duration={2000}
        style={{ backgroundColor: snackbar.color || theme.colors.primary }}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 0 },
  historyItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  historyItemLeft: { flex: 1, marginRight: 12 },
  historyItemRight: { alignItems: 'flex-end', gap: 8 },
  cardActions: { flexDirection: 'row', gap: 6, marginTop: 8 },
  actionButton: { 
    width: 38, 
    height: 38, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  card: { 
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  header: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginBottom: 12,
    marginTop: 12,
    marginHorizontal: 16,
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
    marginTop: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 14,
    borderTopWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 4,
  },
  footerTotal: {
    borderTopWidth: 1,
    borderTopColor: '#dadce0',
    paddingTop: 10,
    marginTop: 10,
  },
  exportButton: { marginTop: 14, marginBottom: 8 },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    padding: 20,
  },
});

export default ProfitHistoryScreen;
