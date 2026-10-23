import * as Linking from 'expo-linking';
import { decode } from 'base64-arraybuffer';

import { BackendError, getSupabase, type PostRow, type ProfileRow } from './supabase';
import type { FeedPost, Post, PublicUser, UserStats } from './types';

export { BackendError };

const MEDIA_BUCKET = 'post-media';
const SIGNED_URL_SECONDS = 60 * 60;

function throwIfError(error: { message: string } | null): void {
  if (error) throw new BackendError(error.message);
}

function toPublicUser(row: ProfileRow): PublicUser {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function toPost(row: PostRow, image: string): Post {
  return {
    id: row.id,
    authorId: row.author_id,
    image,
    caption: row.caption,
    createdAt: new Date(row.created_at).getTime(),
  };
}

async function profileForId(id: string): Promise<PublicUser> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id, username, display_name, created_at')
    .eq('id', id)
    .single();
  throwIfError(error);
  return toPublicUser(data);
}

async function signedUrlsFor(paths: string[]): Promise<Map<string, string>> {
  const uniquePaths = [...new Set(paths)];
  if (uniquePaths.length === 0) return new Map();

  const { data, error } = await getSupabase()
    .storage.from(MEDIA_BUCKET)
    .createSignedUrls(uniquePaths, SIGNED_URL_SECONDS);
  throwIfError(error);

  const urls = new Map<string, string>();
  for (const item of data) {
    if (item.path && item.signedUrl) urls.set(item.path, item.signedUrl);
  }
  if (urls.size !== uniquePaths.length) {
    throw new BackendError('One or more post photos could not be loaded.');
  }
  return urls;
}

async function postsWithSignedImages(rows: PostRow[]): Promise<Post[]> {
  const visibleRows = rows.filter((row): row is PostRow & { media_path: string } => row.media_path !== null);
  const urls = await signedUrlsFor(visibleRows.map((row) => row.media_path));
  return visibleRows.map((row) => toPost(row, urls.get(row.media_path)!));
}

export async function signUp(
  email: string,
  username: string,
  displayName: string,
  password: string,
): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedDisplayName = displayName.trim();

  if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
    throw new BackendError('Username must be 3-20 characters: letters, numbers, underscore.');
  }
  if (normalizedDisplayName.length < 2 || normalizedDisplayName.length > 50) {
    throw new BackendError('Display name must be 2-50 characters.');
  }
  if (password.length < 8) {
    throw new BackendError('Password must be at least 8 characters.');
  }
  if (!normalizedEmail.includes('@')) {
    throw new BackendError('Enter a valid email address.');
  }

  const { data, error } = await getSupabase().auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: { username: normalizedUsername, display_name: normalizedDisplayName },
      emailRedirectTo: Linking.createURL('auth/callback'),
    },
  });
  throwIfError(error);

  if (data.session) {
    await profileForId(data.user.id);
    return true;
  }
  return false;
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await getSupabase().auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  throwIfError(error);
}

export async function signOut(): Promise<void> {
  const { error } = await getSupabase().auth.signOut();
  throwIfError(error);
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const { data, error } = await getSupabase().auth.getSession();
  throwIfError(error);
  if (!data.session) return null;
  return profileForId(data.session.user.id);
}

export async function getProfile(userId: string): Promise<PublicUser> {
  return profileForId(userId);
}

export async function exchangeAuthCode(code: string): Promise<void> {
  const { error } = await getSupabase().auth.exchangeCodeForSession(code);
  throwIfError(error);
}

export async function listUsers(): Promise<PublicUser[]> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id, username, display_name, created_at')
    .order('display_name', { ascending: true });
  throwIfError(error);
  return data.map(toPublicUser);
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id, username, display_name, created_at')
    .eq('id', id)
    .maybeSingle();
  throwIfError(error);
  return data ? toPublicUser(data) : null;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = getSupabase();
  const [posts, followers, following] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', userId).not('media_path', 'is', null),
    supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('following_id', { count: 'exact', head: true }).eq('follower_id', userId),
  ]);
  throwIfError(posts.error);
  throwIfError(followers.error);
  throwIfError(following.error);
  return {
    posts: posts.count ?? 0,
    followers: followers.count ?? 0,
    following: following.count ?? 0,
  };
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from('follows')
    .select('follower_id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();
  throwIfError(error);
  return data !== null;
}

export async function follow(followerId: string, followingId: string): Promise<void> {
  if (followerId === followingId) throw new BackendError('You cannot follow yourself.');
  const { error } = await getSupabase()
    .from('follows')
    .upsert({ follower_id: followerId, following_id: followingId }, {
      onConflict: 'follower_id,following_id',
      ignoreDuplicates: true,
    });
  throwIfError(error);
}

export async function unfollow(followerId: string, followingId: string): Promise<void> {
  const { error } = await getSupabase()
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);
  throwIfError(error);
}

export async function createPost(authorId: string, image: string, caption: string): Promise<Post> {
  const match = /^data:(image\/(?:jpeg|png));base64,(.+)$/.exec(image);
  if (!match) throw new BackendError('Choose a valid JPEG or PNG photo.');

  const supabase = getSupabase();
  const { data: inserted, error: insertError } = await supabase
    .from('posts')
    .insert({ author_id: authorId, caption: caption.trim() })
    .select('id, author_id, media_path, caption, created_at')
    .single();
  throwIfError(insertError);

  const extension = match[1] === 'image/png' ? 'png' : 'jpg';
  const contentType = match[1];
  const path = `${authorId}/${inserted.id}.${extension}`;
  let uploaded = false;

  try {
    const { error: uploadError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, decode(match[2]), { contentType, upsert: false });
    throwIfError(uploadError);
    uploaded = true;

    const { data: updated, error: updateError } = await supabase
      .from('posts')
      .update({ media_path: path })
      .eq('id', inserted.id)
      .select('id, author_id, media_path, caption, created_at')
      .single();
    throwIfError(updateError);

    const urls = await signedUrlsFor([path]);
    return toPost(updated, urls.get(path)!);
  } catch (error) {
    const cleanupErrors: string[] = [];
    if (uploaded) {
      const { error: storageError } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
      if (storageError) cleanupErrors.push(storageError.message);
    }
    const { error: postError } = await supabase.from('posts').delete().eq('id', inserted.id);
    if (postError) cleanupErrors.push(postError.message);
    if (cleanupErrors.length > 0) {
      throw new BackendError(`Could not publish the post and cleanup also failed: ${cleanupErrors.join('; ')}`);
    }
    throw error;
  }
}

export async function getUserPosts(userId: string): Promise<Post[]> {
  const { data, error } = await getSupabase()
    .from('posts')
    .select('id, author_id, media_path, caption, created_at')
    .eq('author_id', userId)
    .not('media_path', 'is', null)
    .order('created_at', { ascending: false });
  throwIfError(error);
  return postsWithSignedImages(data);
}

export async function getFeed(currentUserId: string): Promise<FeedPost[]> {
  const supabase = getSupabase();
  const { data: follows, error: followsError } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', currentUserId);
  throwIfError(followsError);

  const authorIds = [...new Set([currentUserId, ...follows.map((row) => row.following_id)])];
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, author_id, media_path, caption, created_at')
    .in('author_id', authorIds)
    .not('media_path', 'is', null)
    .order('created_at', { ascending: false });
  throwIfError(postsError);

  if (posts.length === 0) return [];
  const authorIdsWithPosts = [...new Set(posts.map((post) => post.author_id))];
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, display_name, created_at')
    .in('id', authorIdsWithPosts);
  throwIfError(profilesError);

  const urls = await signedUrlsFor(posts.flatMap((post) => post.media_path ? [post.media_path] : []));
  const authorsById = new Map(profiles.map((profile) => [profile.id, toPublicUser(profile)]));

  return posts.flatMap((post) => {
    if (!post.media_path || !urls.has(post.media_path)) return [];
    const author = authorsById.get(post.author_id);
    return author ? [{ post: toPost(post, urls.get(post.media_path)!), author }] : [];
  });
}
