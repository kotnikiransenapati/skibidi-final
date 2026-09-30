import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

export type UserRole = 'customer' | 'farmer' | 'admin' | 'support';

export interface RoleAccount {
  role: UserRole;
  name: string;
  email: string;
  title: string;
  badge: string;
  avatar: string;
  location: string;
  escrowBalance?: number;
}

export const ROLE_ACCOUNTS: Record<UserRole, RoleAccount> = {
  customer: {
    role: 'customer',
    name: 'Priya Sharma',
    email: 'priya.sharma@farmdirect.internal',
    title: 'Verified Conscious Buyer',
    badge: 'Customer Account',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    location: 'Bandra West, Mumbai',
    escrowBalance: 2450,
  },
  farmer: {
    role: 'farmer',
    name: 'Ramesh Patel',
    email: 'ramesh.patel@nashikfarms.org',
    title: 'Lead Smallholder & Coop Secretary',
    badge: 'Farmer Account',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    location: 'Nashik Agro Cluster #4, MH',
    escrowBalance: 48900,
  },
  admin: {
    role: 'admin',
    name: 'Dr. Rajesh Kulkarni',
    email: 'admin.governance@farmdirect.internal',
    title: 'Chief Platform Governance Officer',
    badge: 'Admin Account',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
    location: 'Central Command, Mumbai',
    escrowBalance: 1250000,
  },
  support: {
    role: 'support',
    name: 'Ananya Deshmukh',
    email: 'arbitration@farmdirect.internal',
    title: 'Escrow Dispute & Cold-Chain Arbiter',
    badge: 'Support Desk Account',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    location: 'Resolution Operations, Mumbai',
    escrowBalance: 0,
  },
};

export interface UserProfile {
  id?: number;
  uid: string;
  email: string;
  name?: string;
  photoUrl?: string;
  address?: string;
  escrowBalance?: number;
  role?: UserRole;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  currentRole: UserRole;
  activeAccount: RoleAccount;
  roleToast: string | null;
  token: string | null;
  isLoading: boolean;
  switchRole: (newRole: UserRole, silent?: boolean) => void;
  dismissToast: () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  currentRole: 'customer',
  activeAccount: ROLE_ACCOUNTS.customer,
  roleToast: null,
  token: null,
  isLoading: true,
  switchRole: () => {},
  dismissToast: () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [roleToast, setRoleToast] = useState<string | null>(null);

  const activeAccount = ROLE_ACCOUNTS[currentRole];

  // Role switching helper for hackathon panel evaluation
  const switchRole = (newRole: UserRole, silent: boolean = false) => {
    setCurrentRole(newRole);
    const target = ROLE_ACCOUNTS[newRole];

    if (!silent) {
      setRoleToast(
        `Switched to ${target.badge}: ${target.name} (${target.title})`
      );
      setTimeout(() => {
        setRoleToast(null);
      }, 4000);
    }

    // Update userProfile representation
    setUserProfile((prev) => ({
      uid: prev?.uid || `hackathon-${newRole}`,
      email: target.email,
      name: target.name,
      photoUrl: target.avatar,
      address: target.location,
      escrowBalance: target.escrowBalance,
      role: newRole,
    }));
  };

  const dismissToast = () => setRoleToast(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          setToken(idToken);

          // Synchronize user to PostgreSQL database
          const res = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              name: currentUser.displayName,
              photoUrl: currentUser.photoURL,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setUserProfile(data.user);
          }
        } catch (err) {
          console.error('Error synchronizing auth user to database:', err);
        }
      } else {
        // Fallback default profile to customer
        setUserProfile({
          uid: 'demo-customer-priya',
          email: activeAccount.email,
          name: activeAccount.name,
          photoUrl: activeAccount.avatar,
          address: activeAccount.location,
          escrowBalance: activeAccount.escrowBalance,
          role: 'customer',
        });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      console.error('Failed to sign in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      switchRole('customer', true);
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        currentRole,
        activeAccount,
        roleToast,
        token,
        isLoading,
        switchRole,
        dismissToast,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
