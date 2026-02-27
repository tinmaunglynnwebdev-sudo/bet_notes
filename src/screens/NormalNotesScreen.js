import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Platform, RefreshControl, FlatList } from 'react-native';
import { TextInput, Button, Card, Text, Searchbar, IconButton, Snackbar, FAB } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS, addItem, getItems, deleteItem, updateItem } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import FormModal from '../components/FormModal';

const PASTEL_COLORS_LIGHT = [
  '#FFF8E1', // Amber
  '#E3F2FD', // Blue
  '#F1F8E9', // Green
  '#FCE4EC', // Pink
  '#F3E5F5', // Purple
  '#E0F7FA', // Cyan
];

const PASTEL_COLORS_DARK = [
  '#3e2723', // Dark Brown
  '#1a237e', // Dark Blue
  '#1b5e20', // Dark Green
  '#880e4f', // Dark Pink
  '#4a148c', // Dark Purple
  '#006064', // Dark Cyan
];

const NormalNotesScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [refreshing, setRefreshing] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  useEffect(() => {
    loadItems();
    // Force reload
  }, []);

  const loadItems = async () => {
    const data = await getItems(STORAGE_KEYS.NORMAL_NOTES);
    if (data) {
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setItems(data);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || new Date(date);
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setDate(currentDate.toISOString().split('T')[0]);
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
    if (!date || !notes) return;
    const itemData = { date, notes };

    let updatedItems;
    if (editingId) {
      updatedItems = await updateItem(STORAGE_KEYS.NORMAL_NOTES, { ...itemData, id: editingId });
    } else {
      updatedItems = await addItem(STORAGE_KEYS.NORMAL_NOTES, itemData);
    }

    if (updatedItems) {
      updatedItems.sort((a, b) => new Date(b.date) - new Date(a.date));
      setItems(updatedItems);
      resetForm();
      showSnackbar(editingId ? t('updated') : t('added'), theme.colors.secondary);
    }
  };

  const resetForm = () => {
    setNotes('');
    setDate(new Date().toISOString().split('T')[0]);
    setEditingId(null);
    setShowFormModal(false);
  };

  const handleEdit = (item) => {
    setDate(item.date);
    setNotes(item.notes);
    setEditingId(item.id);
    setShowFormModal(true);
  };

  const handleDelete = async (id) => {
    const updatedItems = await deleteItem(STORAGE_KEYS.NORMAL_NOTES, id);
    if (updatedItems) {
      updatedItems.sort((a, b) => new Date(b.date) - new Date(a.date));
      setItems(updatedItems);
      showSnackbar(t('deleted'), theme.colors.error);
    }
  };

  const filteredItems = items.filter(item => 
    (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.date && item.date.includes(searchQuery))
  );

  const getColorForItem = (id) => {
    // Generate a consistent index based on the char codes of the ID
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = theme.dark ? PASTEL_COLORS_DARK : PASTEL_COLORS_LIGHT;
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const renderNoteCard = (item) => (
    <Card key={item.id} style={[styles.card, { backgroundColor: getColorForItem(item.id) }]}>
      <Card.Content style={styles.cardContentWrapper}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTop}>
            <View style={styles.dateContainer}>
              <Text variant="labelSmall" style={[styles.dateText, { color: theme.dark ? '#ccc' : '#666' }]}>📅 {item.date}</Text>
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
        <Text variant="bodyMedium" style={[styles.noteText, { color: theme.colors.onSurface }]} numberOfLines={5}>{item.notes}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder={t('search_notes')}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        <View style={styles.masonryContainer}>
          <View style={styles.column}>
            {filteredItems.filter((_, i) => i % 2 === 0).map(renderNoteCard)}
          </View>
          <View style={styles.column}>
            {filteredItems.filter((_, i) => i % 2 !== 0).map(renderNoteCard)}
          </View>
        </View>
      </ScrollView>
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
              value={date}
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
            value={new Date(date)}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}
        <TextInput
          label={t('note')}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
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
  searchBar: { 
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    elevation: 8,
  },
  input: { marginBottom: 14 },
  
  scrollContent: { paddingHorizontal: 12, paddingBottom: 100, paddingTop: 8 },
  masonryContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { flex: 1, marginHorizontal: 4 },
  
  card: { 
    borderRadius: 18,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4
  },
  cardContentWrapper: { padding: 0 },
  cardTop: { padding: 0, flex: 1 },
  cardActions: { flexDirection: 'row', gap: 8, marginLeft: 8 },
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
  dateContainer: { backgroundColor: 'rgba(0, 0, 0, 0.08)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, alignSelf: 'flex-start' },
  dateText: { color: '#666666', fontSize: 11, fontWeight: '600', opacity: 0.8 },
  noteText: { fontSize: 15, lineHeight: 24, fontWeight: '500', paddingHorizontal: 16, paddingVertical: 8, paddingBottom: 12 },
});

export default NormalNotesScreen;