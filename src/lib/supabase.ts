import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { config } from '@/lib/config';
import { getSecureItem, removeSecureItem, setSecureItem } from '@/lib/secure-storage';

const storage = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return getSecureItem(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return setSecureItem(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return Promise.resolve();
    }
    return removeSecureItem(key);
  },
};

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey || 'missing-anon-key', {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
