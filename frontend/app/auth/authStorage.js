import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = "userSession";
let stateChangeCallback = null;

export function setStateChangeCallback(callback) {
  stateChangeCallback = callback;
}

export async function saveUserSession(uid, email, token, name = '') {
  try {
    const userData = { uid, email, token, name };
    console.log("💾 Saving user session for:", name || email.split('@')[0]);
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(userData));
    if (stateChangeCallback) {
      console.log("🔔 State change callback triggered");
      stateChangeCallback(userData);
    }
  } catch (error) {
    console.error("❌ Error saving user session");
    throw error;
  }
}

export async function getUserSession() {
  try {
    const user = await SecureStore.getItemAsync(STORAGE_KEY);
    const parsedUser = user ? JSON.parse(user) : null;
    if (parsedUser) {
      console.log("🔍 Retrieved user session for:", parsedUser.name || parsedUser.email.split('@')[0]);
    }
    return parsedUser;
  } catch (error) {
    console.error("❌ Error retrieving user session");
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
