import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  PROFIT: 'PROFIT_DATA',
  MATCH_NOTES: 'MATCH_NOTES',
  NORMAL_NOTES: 'NORMAL_NOTES',
};

export const getItems = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading value', e);
    return [];
  }
};

export const addItem = async (key, item) => {
  try {
    const currentItems = await getItems(key);
    const newItem = { ...item, id: Date.now().toString() };
    const newItems = [newItem, ...currentItems];
    await AsyncStorage.setItem(key, JSON.stringify(newItems));
    return newItems;
  } catch (e) {
    console.error('Error saving value', e);
    return null;
  }
};

export const updateItem = async (key, updatedItem) => {
  try {
    const currentItems = await getItems(key);
    const newItems = currentItems.map((item) => 
      item.id === updatedItem.id ? updatedItem : item
    );
    await AsyncStorage.setItem(key, JSON.stringify(newItems));
    return newItems;
  } catch (e) {
    console.error('Error updating value', e);
    return null;
  }
};

export const deleteItem = async (key, id) => {
  try {
    const currentItems = await getItems(key);
    const newItems = currentItems.filter((item) => item.id !== id);
    await AsyncStorage.setItem(key, JSON.stringify(newItems));
    return newItems;
  } catch (e) {
    console.error('Error deleting value', e);
    return null;
  }
};
