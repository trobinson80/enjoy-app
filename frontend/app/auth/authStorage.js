import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = "userSession";
let stateChangeCallback = null;

export function setStateChangeCallback(callback) {
  stateChangeCallback = callback;
}

export async function saveUserSession(uid, email, token) {
  try {
    const userData = { uid, email, token };
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(userData));
    console.log("�� Saved user session for:", email);
    if (stateChangeCallback) {
      stateChangeCallback(userData);
    }
  } catch (error) {
    console.error("❌ Error saving user session:", error);
  }
}

export async function getUserSession() {
  try {
    const user = await SecureStore.getItemAsync(STORAGE_KEY);
    const parsedUser = user ? JSON.parse(user) : null;
    console.log("🔍 Retrieved user session for:", parsedUser?.email || 'none');
    if (stateChangeCallback) {
      stateChangeCallback(parsedUser);
    }
    return parsedUser;
  } catch (error) {
    console.error("❌ Error retrieving user session:", error);
    return null;
  }
}

export async function clearUserSession() {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    console.log("🗑️ Cleared user session");
    if (stateChangeCallback) {
      stateChangeCallback(null);
    }
  } catch (error) {
    console.error("❌ Error clearing user session:", error);
  }
}
