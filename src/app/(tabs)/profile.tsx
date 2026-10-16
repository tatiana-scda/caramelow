import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import Avatar from '@/components/Avatar';
import EmptyState from '@/components/EmptyState';
import StatBlock from '@/components/StatBlock';
import { useAuth } from '@/context/AuthContext';
import { getUserPosts, getUserStats } from '@/lib/backend';
import { colors, spacing, typography } from '@/theme';
import type { Post, UserStats } from '@/lib/types';

function imageSource(image: string | number): { uri: string } | number {
  return typeof image === 'number' ? image : { uri: image };
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    setStats(await getUserStats(user.id));
    setPosts(await getUserPosts(user.id));
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!user) return null;

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      numColumns={3}
      style={styles.screen}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => (
        <View style={styles.tile}>
          <Image source={imageSource(item.image)} style={styles.tileImage} accessibilityLabel={item.caption || 'Post'} />
        </View>
      )}
      ListHeaderComponent={
        <View>
          <View style={styles.headerRow}>
            <Avatar userId={user.id} username={user.username} displayName={user.displayName} size={84} />
            <View style={styles.statsRow}>
              <StatBlock value={stats?.posts ?? 0} label="posts" />
              <StatBlock value={stats?.followers ?? 0} label="followers" />
              <StatBlock value={stats?.following ?? 0} label="following" />
            </View>
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.displayName}>{user.displayName}</Text>
            <Text style={styles.username}>@{user.username}</Text>
          </View>
          <Pressable style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.7 }]} onPress={signOut}>
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
          <Text style={styles.gridLabel}>Posts</Text>
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          title="No posts yet"
          subtitle="Share your first picture with the + button on the feed."
          style={styles.empty}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  nameBlock: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  displayName: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  username: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  signOut: {
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  signOutText: {
    color: colors.text,
    fontSize: typography.body - 2,
    fontWeight: '600',
  },
  gridLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
  },
  tile: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: 1,
  },
  tileImage: {
    flex: 1,
    backgroundColor: colors.primarySoft,
  },
  empty: {
    marginTop: spacing.xxl,
  },
});
