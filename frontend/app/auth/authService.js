import { createUserWithEmailAndPassword, signInWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential, updatePassword as firebaseUpdatePassword } from "firebase/auth";
import { firebaseAuth } from "./firebaseConfig";

export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const updatePassword = async (currentPassword, newPassword) => {
  try {
    const user = firebaseAuth.currentUser;
    console.log("🔍 Current user check:", user?.email || "No user found");
    
    if (!user) {
      throw new Error("No authenticated user found. Please log in again.");
    }
    
    // First, reauthenticate the user with their current password
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);
    
    // Then update to the new password using the imported function
    await firebaseUpdatePassword(user, newPassword);
    
    console.log("🔑 Password updated successfully");
  } catch (error) {
    console.error("❌ Error updating password:", error.message);
    throw new Error(
      error.code === 'auth/wrong-password' 
        ? 'Current password is incorrect' 
        : error.message || 'Failed to update password'
    );
  }
};
