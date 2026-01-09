import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'manager';
  username: string;
}

// Auth state change listener
export const onAdminAuthStateChanged = (callback: (user: AdminUser | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Get admin profile from Firestore
      const adminProfile = await getAdminProfile(firebaseUser.uid);
      if (adminProfile) {
        callback(adminProfile);
      } else {
        // User exists but no admin profile - sign them out
        await signOut(auth);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

// Get admin profile from Firestore
export const getAdminProfile = async (uid: string): Promise<AdminUser | null> => {
  try {
    const docRef = doc(db, 'admins', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: uid,
        email: data.email,
        role: data.role || 'admin',
        username: data.username || data.email.split('@')[0],
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting admin profile:', error);
    return null;
  }
};

// Create admin profile in Firestore (for initial setup)
export const createAdminProfile = async (uid: string, data: Omit<AdminUser, 'id'>): Promise<void> => {
  try {
    await setDoc(doc(db, 'admins', uid), {
      ...data,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating admin profile:', error);
    throw error;
  }
};

// Firebase Auth API
export const firebaseAuthApi = {
  login: async (email: string, password: string): Promise<{ 
    success: boolean; 
    data?: { user: AdminUser }; 
    error?: string 
  }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const adminProfile = await getAdminProfile(userCredential.user.uid);
      
      if (!adminProfile) {
        await signOut(auth);
        return { success: false, error: 'You do not have admin access' };
      }
      
      return { success: true, data: { user: adminProfile } };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Login failed';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'User not found';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Invalid password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          break;
        default:
          errorMessage = error.message || 'Login failed';
      }
      
      return { success: false, error: errorMessage };
    }
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  getCurrentUser: (): FirebaseUser | null => {
    return auth.currentUser;
  },

  isAuthenticated: (): boolean => {
    return !!auth.currentUser;
  },
};
