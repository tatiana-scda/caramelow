import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  users: 'caramelow.users',
  posts: 'caramelow.posts',
  follows: 'caramelow.follows',
  session: 'caramelow.session',
  seeded: 'caramelow.seeded',
} as const;

export type TableKey = 'users' | 'posts' | 'follows';

export const storageKeys = KEYS;

export async function readTable<T>(key: TableKey): Promise<T[]> {
  const raw = await AsyncStorage.getItem(KEYS[key]);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export async function writeTable<T>(key: TableKey, rows: T[]): Promise<void> {
  await AsyncStorage.setItem(KEYS[key], JSON.stringify(rows));
}

export async function readValue(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

export async function writeValue(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}

export async function removeValue(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
