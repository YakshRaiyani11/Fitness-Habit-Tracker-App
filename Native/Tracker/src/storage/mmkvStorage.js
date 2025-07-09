import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

// Set a value
export const setItem = (key, value) => {
  storage.set(key, JSON.stringify(value));
};

// Get a value
export const getItem = (key) => {
  const stored = storage.getString(key);
  return stored ? JSON.parse(stored) : null;
};

// Delete a value
export const removeItem = (key) => {
  storage.delete(key);
};
