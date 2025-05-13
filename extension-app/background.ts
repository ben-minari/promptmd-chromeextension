import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.PLASMO_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.PLASMO_PUBLIC_SUPABASE_ANON_KEY as string;

// Create a singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null;

const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        storageKey: 'promptmd-auth',
        storage: {
          getItem: (key) => {
            return new Promise((resolve) => {
              chrome.storage.local.get([key], (result) => {
                resolve(result[key] || null);
              });
            });
          },
          setItem: (key, value) => {
            return new Promise((resolve) => {
              chrome.storage.local.set({ [key]: value }, resolve);
            });
          },
          removeItem: (key) => {
            return new Promise((resolve) => {
              chrome.storage.local.remove([key], resolve);
            });
          },
        },
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true
      },
    });
  }
  return supabaseInstance;
};

const supabase = getSupabaseClient();

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    chrome.action.setIcon({
      path: {
        16: 'assets/icon16.png',
        32: 'assets/icon32.png',
        48: 'assets/icon48.png',
        128: 'assets/icon128.png'
      }
    });
  } else if (event === 'SIGNED_OUT') {
    chrome.action.setIcon({
      path: {
        16: 'assets/icon16.png',
        32: 'assets/icon32.png',
        48: 'assets/icon48.png',
        128: 'assets/icon128.png'
      }
    });
  }
}); 