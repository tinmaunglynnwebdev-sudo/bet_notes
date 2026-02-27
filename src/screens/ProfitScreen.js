import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Platform, RefreshControl } from 'react-native';
import { TextInput, Button, Card, Text, SegmentedButtons, Snackbar, FAB, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS, addItem, getItems, deleteItem, updateItem } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import FormModal from '../components/FormModal';

const ProfitScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('deposit');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [refreshing, setRefreshing] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

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

  const displaySnackbar = (message, color = theme.colors.primary) => {
    setSnackbar({ visible: true, message, color });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const handleSave = async () => {
    if (!amount || !date) return;
    const value = Math.abs(parseFloat(amount));
    const finalAmount = transactionType === 'withdraw' ? -value : value;
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
      displaySnackbar(editingId ? t('updated') : t('added'), theme.colors.secondary);
    }
  };

  const resetForm = () => {
    setAmount('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setTransactionType('deposit');
    setEditingId(null);
    setShowFormModal(false);
  };

  const handleEdit = (item) => {
    setAmount(Math.abs(item.amount).toString());
    setTransactionType(item.amount >= 0 ? 'deposit' : 'withdraw');
    setDate(item.date);
    setNote(item.note || '');
    setEditingId(item.id);
    setShowFormModal(true);
  };

  const handleDelete = async (id) => {
    const updatedItems = await deleteItem(STORAGE_KEYS.PROFIT, id);
    if (updatedItems) {
      setItems(updatedItems);
      displaySnackbar(t('deleted'), theme.colors.error);
    }
  };

  const totalProfit = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.summaryContainer, { backgroundColor: theme.colors.primaryContainer }]}>
        <Text variant="titleLarge" style={{ color: theme.colors.onPrimaryContainer }}>
          {t('total_profit')}: {totalProfit.toFixed(2)}
        </Text>
      </View>
      <View style={styles.listHeader}>
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>{t('recent_records')}</Text>
        <Button mode="text" onPress={() => navigation.navigate('ProfitHistory')}>
          {t('see_all_history')}
        </Button>
      </View>
      <FlatList
        data={items.slice(0, 5)}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
        renderItem={({ item }) => (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <LinearGradient
              colors={item.amount >= 0 
                ? [theme.colors.secondaryContainer + '20', 'transparent'] 
                : [theme.colors.tertiaryContainer + '20', 'transparent']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            />
            <Card.Content style={styles.cardContent}>
              <View style={styles.cardMain}>
                <View style={styles.cardLeft}>
                  <View style={[
                    styles.amountBadge, 
                    { 
                      backgroundColor: item.amount >= 0 ? theme.colors.tertiary : theme.colors.secondary,
                    }
                  ]}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                      {item.amount >= 0 ? '+' : '-'}{Math.abs(item.amount).toFixed(0)}
                    </Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text variant="labelLarge" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
                      {item.type ? t(item.type) : (item.amount >= 0 ? t('withdraw') : t('deposit'))}
                    </Text>
                    <View style={styles.dateRow}>
                      <Ionicons 
                        name="calendar-outline" 
                        size={12} 
                        color={theme.colors.onSurfaceVariant} 
                      />
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
                        {item.date}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: theme.colors.primaryContainer }]}
                    onPress={() => handleEdit(item)}
                  >
                    <Text style={{ color: theme.colors.primary, fontSize: 18, fontWeight: 'bold' }}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: theme.colors.errorContainer }]}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Text style={{ color: theme.colors.error, fontSize: 18, fontWeight: 'bold' }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {item.note && (
                <View style={styles.cardNote}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 16 }}>
                    {item.note.length > 60 ? item.note.substring(0, 60) + '...' : item.note}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}
      />
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar(prev => ({ ...prev, visible: false }))}
        duration={2000}
        style={{ backgroundColor: snackbar.color || theme.colors.primary }}
      >
        {snackbar.message}
      </Snackbar>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          resetForm();
          setShowFormModal(true);
        }}
      />
      
      <FormModal
        visible={showFormModal}
        onDismiss={resetForm}
      >
        <SegmentedButtons
          value={transactionType}
          onValueChange={setTransactionType}
          buttons={[
            {
              value: 'deposit',
              label: t('deposit'),
            },
            {
              value: 'withdraw',
              label: t('withdraw'),
            },
          ]}
          style={styles.segmentedButton}
        />
        <TextInput
          label={t('amount')}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
          mode="outlined"
        />
        <TouchableOpacity onPress={() => setShowDatePicker(!showDatePicker)}>
          <View pointerEvents="none">
            <TextInput
              label={t('date')}
              value={date}
              editable={false}
              right={<TextInput.Icon icon="calendar" />}
              style={styles.input}
              mode="outlined"
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
          label={t('note')}
          value={note}
          onChangeText={setNote}
          style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
          mode="outlined"
        />
        <Button mode="contained" onPress={handleSave}>
          {editingId ? t('update_record') : t('add_record')}
        </Button>
      </FormModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    elevation: 8,
  },
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
  input: { marginBottom: 14 },
  summaryContainer: { 
    alignItems: 'center', 
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  card: { 
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  cardContent: { 
    padding: 16,
    paddingTop: 20,
  },
  cardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  amountBadge: { 
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardInfo: {
    flex: 1,
  },
  cardActions: { 
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  dateRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 6,
  },
  cardNote: { 
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
});

export default ProfitScreen;
