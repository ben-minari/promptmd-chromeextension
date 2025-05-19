import { Storage } from "@plasmohq/storage"

// Create a storage instance
const storage = new Storage()

// Keys for storing data
const AUTH_TOKEN_KEY = "auth_token"
const CURRENT_USER_KEY = "current_user"
const USER_ACCOUNTS_KEY = "user_accounts"

// Store auth token safely
export const storeAuthToken = async (userId: string, token: string) => {
  await storage.set(`auth_token_${userId}`, token)
}

// Get stored auth token
export const getStoredAuthToken = async (userId: string) => {
  return await storage.get(`auth_token_${userId}`)
}

// Get current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  return await storage.get(CURRENT_USER_KEY)
}

// Remove auth token on logout
export const removeAuthToken = async (userId: string) => {
  await storage.remove(`auth_token_${userId}`)
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