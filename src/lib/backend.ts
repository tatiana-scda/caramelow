import { readTable, readValue, removeValue, storageKeys, writeTable, writeValue } from './db';
import { hashPassword, makeId } from './util';
import type { Follow, Post, PublicUser, User, UserStats, FeedPost } from './types';

/**
 * Local mock backend. Everything lives in AsyncStorage on this device only:
 * accounts, follows and posts are NOT shared with other phones. The API shape
 * below mirrors what a real backend (e.g. Supabase) would expose, so the UI
 * does not need to change when it is swapped in.
 */

const AVATAR_AVA = require('../../assets/seed/ava-avatar.jpg');
const AVATAR_LEO = require('../../assets/seed/leo-avatar.jpg');
const POST_AVA_1 = require('../../assets/seed/ava-1.jpg');
const POST_AVA_2 = require('../../assets/seed/ava-2.jpg');
const POST_LEO_1 = require('../../assets/seed/leo-1.jpg');
const POST_LEO_2 = require('../../assets/seed/leo-2.jpg');

export const seedAvatarById: Record<string, number> = {
  seed_ava: AVATAR_AVA,
  seed_leo: AVATAR_LEO,
};

export class BackendError extends Error {}

function toPublic(user: User): PublicUser {
  return { id: user.id, username: user.username, displayName: user.displayName, createdAt: user.createdAt };
}

async function findUserByUsername(username: string): Promise<User | undefined> {
  const users = await readTable<User>('users');
  return users.find((u) => u.username === username.toLowerCase());
}

export async function ensureSeeded(): Promise<void> {
  if (await readValue(storageKeys.seeded)) return;
  const existing = await readTable<User>('users');
  if (existing.some((u) => u.id === 'seed_ava')) {
    await writeValue(storageKeys.seeded, '1');
    return;
  }

  const now = Date.now();
  const users: User[] = [
    {
      id: 'seed_ava',
      username: 'ava',
      displayName: 'Ava Reyes',
      passwordHash: hashPassword('demo1234'),
      createdAt: now - 90 * 24 * 3600 * 1000,
    },
    {
      id: 'seed_leo',
      username: 'leo',
      displayName: 'Leo Park',
      passwordHash: hashPassword('demo1234'),
      createdAt: now - 60 * 24 * 3600 * 1000,
    },
  ];

  const posts: Post[] = [
    { id: makeId('post'), authorId: 'seed_ava', image: POST_AVA_1, caption: 'Golden hour on the coast. No filter needed.', createdAt: now - 3 * 3600 * 1000 },
    { id: makeId('post'), authorId: 'seed_ava', image: POST_AVA_2, caption: 'Coffee experiments — batch 12. Getting closer.', createdAt: now - 26 * 3600 * 1000 },
    { id: makeId('post'), authorId: 'seed_leo', image: POST_LEO_1, caption: 'Sketching ideas for the weekend.', createdAt: now - 8 * 3600 * 1000 },
    { id: makeId('post'), authorId: 'seed_leo', image: POST_LEO_2, caption: 'Found this little place downtown.', createdAt: now - 2 * 24 * 3600 * 1000 },
  ];

  const follows: Follow[] = [
    { followerId: 'seed_ava', followingId: 'seed_leo', createdAt: now - 40 * 24 * 3600 * 1000 },
    { followerId: 'seed_leo', followingId: 'seed_ava', createdAt: now - 30 * 24 * 3600 * 1000 },
  ];

  await writeTable('users', users);
  await writeTable('posts', posts);
  await writeTable('follows', follows);
  await writeValue(storageKeys.seeded, '1');
}

// ---- auth ----

export async function signUp(username: string, displayName: string, password: string): Promise<PublicUser> {
  const normalized = username.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(normalized)) {
    throw new BackendError('Username must be 3-20 characters: letters, numbers, underscore.');
  }
  if (displayName.trim().length < 2) {
    throw new BackendError('Display name is too short.');
  }
  if (password.length < 6) {
    throw new BackendError('Password must be at least 6 characters.');
  }
  if (await findUserByUsername(normalized)) {
    throw new BackendError('That username is taken.');
  }
  const users = await readTable<User>('users');
  const user: User = {
    id: makeId('user'),
    username: normalized,
    displayName: displayName.trim(),
    passwordHash: hashPassword(password),
    createdAt: Date.now(),
  };
  await writeTable('users', [...users, user]);
  await writeValue(storageKeys.session, user.id);
  return toPublic(user);
}

export async function signIn(username: string, password: string): Promise<PublicUser> {
  const user = await findUserByUsername(username.trim());
  if (!user || user.passwordHash !== hashPassword(password)) {
    throw new BackendError('Wrong username or password.');
  }
  await writeValue(storageKeys.session, user.id);
  return toPublic(user);
}

export async function signOut(): Promise<void> {
  await removeValue(storageKeys.session);
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const sessionId = await readValue(storageKeys.session);
  if (!sessionId) return null;
  const users = await readTable<User>('users');
  const user = users.find((u) => u.id === sessionId);
  return user ? toPublic(user) : null;
}

// ---- users ----

export async function listUsers(): Promise<PublicUser[]> {
  const users = await readTable<User>('users');
  return users.map(toPublic).sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  const users = await readTable<User>('users');
  const user = users.find((u) => u.id === id);
  return user ? toPublic(user) : null;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const [posts, follows] = await Promise.all([readTable<Post>('posts'), readTable<Follow>('follows')]);
  return {
    posts: posts.filter((p) => p.authorId === userId).length,
    followers: follows.filter((f) => f.followingId === userId).length,
    following: follows.filter((f) => f.followerId === userId).length,
  };
}

// ---- follows ----

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const follows = await readTable<Follow>('follows');
  return follows.some((f) => f.followerId === followerId && f.followingId === followingId);
}

export async function follow(followerId: string, followingId: string): Promise<void> {
  if (followerId === followingId) throw new BackendError('You cannot follow yourself.');
  const follows = await readTable<Follow>('follows');
  if (follows.some((f) => f.followerId === followerId && f.followingId === followingId)) return;
  await writeTable('follows', [...follows, { followerId, followingId, createdAt: Date.now() }]);
}

export async function unfollow(followerId: string, followingId: string): Promise<void> {
  const follows = await readTable<Follow>('follows');
  await writeTable(
    'follows',
    follows.filter((f) => !(f.followerId === followerId && f.followingId === followingId)),
  );
}

// ---- posts ----

export async function createPost(authorId: string, image: string, caption: string): Promise<Post> {
  const post: Post = {
    id: makeId('post'),
    authorId,
    image,
    caption: caption.trim(),
    createdAt: Date.now(),
  };
  const posts = await readTable<Post>('posts');
  await writeTable('posts', [post, ...posts]);
  return post;
}

export async function getUserPosts(userId: string): Promise<Post[]> {
  const posts = await readTable<Post>('posts');
  return posts.filter((p) => p.authorId === userId).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getFeed(currentUserId: string): Promise<FeedPost[]> {
  const [posts, users, follows] = await Promise.all([
    readTable<Post>('posts'),
    readTable<User>('users'),
    readTable<Follow>('follows'),
  ]);
  const followingIds = new Set(
    follows.filter((f) => f.followerId === currentUserId).map((f) => f.followingId),
  );
  followingIds.add(currentUserId);
  const authorsById = new Map(users.map((u) => [u.id, toPublic(u)]));
  return posts
    .filter((p) => followingIds.has(p.authorId))
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((post) => ({ post, author: authorsById.get(post.authorId) }))
    .filter((entry): entry is FeedPost => entry.author !== undefined);
}
