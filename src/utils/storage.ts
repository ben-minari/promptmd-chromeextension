import { Storage } from "@plasmohq/storage"

// Create a storage instance
const storage = new Storage()

// Keys for storing data
const AUTH_TOKEN_KEY = "auth_token"
const CURRENT_USER_KEY = "current_user"
const USER_ACCOUNTS_KEY = "user_accounts"
const TOKEN_EXPIRY_KEY = "token_expiry"

// Store auth token safely with expiration
export const storeAuthToken = async (userId: string, token: string) => {
  const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour from now
  await storage.set(`${AUTH_TOKEN_KEY}_${userId}`, token);
  await storage.set(`${TOKEN_EXPIRY_KEY}_${userId}`, expiresAt);
}

// Get stored auth token if not expired
export const getStoredAuthToken = async (userId: string): Promise<string | null> => {
  const token = await storage.get(`${AUTH_TOKEN_KEY}_${userId}`);
  const expiresAt = await storage.get(`${TOKEN_EXPIRY_KEY}_${userId}`);
  
  if (token && expiresAt && expiresAt > Date.now()) {
    return token;
  }
  
  // If token is expired or doesn't exist, clean up
  await removeAuthToken(userId);
  return null;
}

// Get current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  return await storage.get(CURRENT_USER_KEY)
}

// Remove auth token on logout
export const removeAuthToken = async (userId: string) => {
  await storage.remove(`${AUTH_TOKEN_KEY}_${userId}`);
  await storage.remove(`${TOKEN_EXPIRY_KEY}_${userId}`);
}

// Store multiple account information
export const storeAccountInfo = async (accounts: Array<{ id: string; email: string }>) => {
  await storage.set(USER_ACCOUNTS_KEY, accounts)
}

// Get stored accounts
export const getStoredAccounts = async (): Promise<Array<{ id: string; email: string }>> => {
  return await storage.get(USER_ACCOUNTS_KEY) || []
}

export default storage 