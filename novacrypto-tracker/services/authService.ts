import { UserProfile, Asset, Transaction } from '../types';

interface StoredUser {
  profile: UserProfile;
  passwordHash: string; // Storing plain text for demo purposes, in real app use hash
  assets: Asset[];
  transactions: Transaction[];
}

const STORAGE_KEY = 'novacrypto_users';
const CURRENT_USER_KEY = 'novacrypto_current_user';

const getUsers = (): Record<string, StoredUser> => {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

const saveUsers = (users: Record<string, StoredUser>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

// Helper to generate random 16 digit number (Legacy fallback)
const generateAccountNumber = (): string => {
  return '4' + Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join('');
};

// Helper to generate random 10 digit mobile (Legacy fallback)
const generateMobile = (): string => {
  return '9' + Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
};

export const registerUser = (
    name: string, 
    email: string, 
    password: string, 
    mobile: string, 
    accountNumber: string, 
    ifsc: string
): UserProfile => {
  const users = getUsers();
  if (users[email]) {
    throw new Error('User already exists');
  }

  const newUser: UserProfile = {
    id: `user-${Date.now()}`,
    name,
    email,
    joinedAt: Date.now(),
    avatar: undefined,
    fiatBalance: 0,
    accountNumber: accountNumber, 
    mobile: mobile,
    ifsc: ifsc
  };

  users[email] = {
    profile: newUser,
    passwordHash: password,
    assets: [],
    transactions: []
  };

  saveUsers(users);
  return newUser;
};

export const loginUser = (email: string, password: string): { profile: UserProfile; assets: Asset[]; transactions: Transaction[] } => {
  const users = getUsers();
  const user = users[email];

  if (!user || user.passwordHash !== password) {
    throw new Error('Invalid email or password');
  }

  let updated = false;

  // Backwards compatibility for users created before fiatBalance existed
  if (user.profile.fiatBalance === undefined) {
      user.profile.fiatBalance = 0;
      updated = true;
  }

  // Backwards compatibility for banking details
  if (!user.profile.accountNumber) {
      user.profile.accountNumber = generateAccountNumber();
      user.profile.mobile = generateMobile();
      user.profile.ifsc = 'NOVA0001234';
      updated = true;
  }

  if (updated) {
      saveUsers(users);
  }

  return {
    profile: user.profile,
    assets: user.assets || [],
    transactions: user.transactions || []
  };
};

export const saveUserData = (email: string, assets: Asset[], transactions: Transaction[], fiatBalance?: number) => {
  const users = getUsers();
  if (users[email]) {
    users[email].assets = assets;
    users[email].transactions = transactions;
    if (fiatBalance !== undefined) {
        users[email].profile.fiatBalance = fiatBalance;
    }
    saveUsers(users);
  }
};

export const updateUserProfile = (currentEmail: string, updates: Partial<UserProfile>): UserProfile => {
  const users = getUsers();
  const userData = users[currentEmail];
  
  if (!userData) throw new Error("User not found");

  const newEmail = updates.email || currentEmail;
  
  // Check if new email exists (if changing email)
  if (newEmail !== currentEmail && users[newEmail]) {
    throw new Error("Email already in use");
  }

  const updatedProfile = { ...userData.profile, ...updates };
  
  if (newEmail !== currentEmail) {
    // Migrate data to new key
    users[newEmail] = {
      ...userData,
      profile: updatedProfile
    };
    delete users[currentEmail];
    
    // Update active session key if it matches
    if (typeof window !== 'undefined' && localStorage.getItem(CURRENT_USER_KEY) === currentEmail) {
        localStorage.setItem(CURRENT_USER_KEY, newEmail);
    }
  } else {
    users[currentEmail].profile = updatedProfile;
  }

  saveUsers(users);
  return updatedProfile;
};

// --- Session Persistence ---

export const persistSession = (email: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CURRENT_USER_KEY, email);
  }
};

export const clearSession = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const restoreSession = (): { profile: UserProfile; assets: Asset[]; transactions: Transaction[] } | null => {
  if (typeof window === 'undefined') return null;
  const email = localStorage.getItem(CURRENT_USER_KEY);
  if (!email) return null;

  const users = getUsers();
  const user = users[email];

  if (!user) return null;

  // Backwards compatibility check
  if (user.profile.fiatBalance === undefined) {
      user.profile.fiatBalance = 0;
  }
  if (!user.profile.accountNumber) {
      // Just in case restore happens on a stale record, fix it in memory
      user.profile.accountNumber = generateAccountNumber();
      user.profile.mobile = generateMobile();
      user.profile.ifsc = 'NOVA0001234';
  }

  return {
    profile: user.profile,
    assets: user.assets || [],
    transactions: user.transactions || []
  };
};