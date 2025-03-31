import { createUserWithEmailAndPassword, signInWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential, updatePassword as firebaseUpdatePassword } from "firebase/auth";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firebaseAuth, db } from "./firebaseConfig";

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
    console.log("🔑 Attempting sign in for:", email);
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    console.log("✅ Sign in successful");
    
    if (!userCredential?.user) {
      console.error("❌ No user data in credential");
      throw new Error("No user data received from authentication");
    }
    
    return {
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        accessToken: await userCredential.user.getIdToken(),
      }
    };
  } catch (error) {
    console.error("❌ Sign in error:", error.message);
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

export const updateUserProfile = async (uid, userData) => {
  try {
    console.log("📝 Attempting to save to Firestore");
    const userRef = doc(db, 'users', uid);
    const dataToSave = {
      ...userData,
      updatedAt: new Date().toISOString()
    };
    
    // Remove sensitive data from logs
    const logSafeData = {
      ...dataToSave,
      email: userData.email ? '[REDACTED]' : undefined,
      token: undefined,
      uid: undefined
    };
    
    await setDoc(userRef, dataToSave, { merge: true });
    console.log("✅ Successfully saved to Firestore:", logSafeData);
    
    // Verify the save by immediately reading it back
    const savedDoc = await getDoc(userRef);
    const logSafeVerification = {
      ...savedDoc.data(),
      email: '[REDACTED]',
      token: undefined,
      uid: undefined
    };
    console.log("🔍 Verification - Data in Firestore:", logSafeVerification);
    
  } catch (error) {
    console.error("❌ Firestore save error:", error.message);
    throw error;
  }
};

export const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log("🔥 Firestore: Retrieved user profile:", {
        ...data,
        email: '[REDACTED]',
        token: undefined,
        uid: undefined
      });
      return data;
    }
    return null;
  } catch (error) {
    console.error("❌ Firestore: Error fetching user profile:", error.message);
    throw error;
  }
};

/**
 * Creates a new user profile in Firestore.
 * @param {string} uid - The user's unique ID.
 * @param {object} profileData - The user profile data.
 * @returns {Promise<void>}
 */
export const createUserProfile = async (uid, profileData) => {
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      ...profileData,
      createdAt: profileData.createdAt || new Date().toISOString(),
      updatedAt: profileData.updatedAt || new Date().toISOString(),
    });

    console.log("✅ Firestore: User profile created successfully for", uid);
  } catch (error) {
    console.error("❌ Firestore: Error creating user profile:", error.message);
    throw error;
  }
};