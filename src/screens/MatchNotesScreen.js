import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Platform, RefreshControl } from 'react-native';
import { TextInput, Button, Card, Text, Snackbar, FAB, IconButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS, addItem, getItems, deleteItem, updateItem } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import FormModal from '../components/FormModal';

const MatchNotesScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [matchInfo, setMatchInfo] = useState('');
  const [handicap, setHandicap] = useState('');
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [refreshing, setRefreshing] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

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

  const showSnackbar = (message, color = theme.colors.primary) => {
    setSnackbar({ visible: true, message, color });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
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
      showSnackbar(editingId ? t('updated') : t('added'), theme.colors.secondary);
    }
  };

  const resetForm = () => {
    setMatchInfo('');
    setHandicap('');
    setMatchDate(new Date().toISOString().split('T')[0]);
    setEditingId(null);
    setShowFormModal(false);
  };

  const handleEdit = (item) => {
    setMatchDate(item.matchDate);
    setMatchInfo(item.matchInfo);
    setHandicap(item.handicap || '');
    setEditingId(item.id);
    setShowFormModal(true);
  };

  const handleDelete = async (id) => {
    const updatedItems = await deleteItem(STORAGE_KEYS.MATCH_NOTES, id);
    if (updatedItems) {
      setItems(updatedItems);
      showSnackbar(t('deleted'), theme.colors.error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
        renderItem={({ item }) => (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cardContentWrapper}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTop}>
                  <View style={styles.cardIcon}>
                    <Text style={styles.iconText}>🏈</Text>
                  </View>
                  <View style={styles.cardTextContent}>
                    <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '700', marginBottom: 6 }}>
                      {item.matchInfo.length > 28 ? item.matchInfo.substring(0, 28) + '...' : item.matchInfo}
                    </Text>
                    <View style={styles.infoRow}>
                      <Text style={{ fontSize: 11 }}>📅</Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 6, fontWeight: '500' }}>{item.matchDate}</Text>
                    </View>
                    {item.handicap && (
                      <View style={[styles.badgeSmall, { backgroundColor: theme.colors.primaryContainer, marginTop: 8 }]}>
                        <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 10 }}>♿ {item.handicap}</Text>
                      </View>
                    )}
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
        <TouchableOpacity onPress={() => setShowDatePicker(!showDatePicker)}>
          <View pointerEvents="none">
            <TextInput
              label={t('date')}
              value={matchDate}
              editable={false}
              right={<TextInput.Icon icon="calendar" />}
              style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
              mode="outlined"
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
          label={t('match_info')}
          value={matchInfo}
          onChangeText={setMatchInfo}
          style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
          mode="outlined"
        />
        <TextInput
          label={t('handicap')}
          value={handicap}
          onChangeText={setHandicap}
          style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
          mode="outlined"
        />
        <Button mode="contained" onPress={handleSave}>
          {editingId ? t('update') : t('add')}
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
  input: { marginBottom: 14 },
  card: { 
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardContentWrapper: { padding: 0 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 12 },
  cardTop: { padding: 4, flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  cardActions: { flexDirection: 'row', gap: 8 },
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
  cardActions: { flexDirection: 'row', marginLeft: 8 },
  cardIcon: { marginRight: 12, fontSize: 26 },
  cardTextContent: { flex: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  badgeSmall: { marginTop: 8, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, alignSelf: 'flex-start' },
  iconText: { fontSize: 26 },
});

export default MatchNotesScreen;
