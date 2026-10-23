import { getSupabase } from './supabase';

export const supabase = getSupabase();

export type TableKey = 'profiles' | 'posts' | 'follows';


export const storageKeys = {
  users: 'caramelow.users',
  posts: 'caramelow.posts',
  follows: 'caramelow.follows',
  session: 'caramelow.session',
  seeded: 'caramelow.seeded',
} as const;

export async function readTable<T>(key: TableKey): Promise<T[]> {
  const { data } = await supabase.from(key).select('*');
  return (data as T[]) || [];
}

export async function writeTable<T>(key: TableKey, rows: T[]): Promise<void> {
  const { error } = await supabase.from(key).upsert(rows);
  if (error) throw error;
}
