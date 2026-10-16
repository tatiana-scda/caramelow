import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';

import Avatar from '@/components/Avatar';
import EmptyState from '@/components/EmptyState';
import FollowButton from '@/components/FollowButton';
import StatBlock from '@/components/StatBlock';
import { useAuth } from '@/context/AuthContext';
import { follow, getUserById, getUserPosts, getUserStats, isFollowing, unfollow } from '@/lib/backend';
import { colors, spacing, typography } from '@/theme';
import type { Post, PublicUser, UserStats } from '@/lib/types';

function imageSource(image: string | number): { uri: string } | number {
  return typeof image === 'number' ? image : { uri: image };
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  const isSelf = user !== null && user.id === id;

  const load = useCallback(async () => {
    if (!user || !id) return;
    const [target, targetStats, targetPosts, isFollow] = await Promise.all([
      getUserById(id),
      getUserStats(id),
      getUserPosts(id),
      isFollowing(user.id, id),
    ]);
    setProfile(target);
    setStats(targetStats);
    setPosts(targetPosts);
    setFollowing(isFollow);
  }, [user, id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!id || !user) return null;

  async function toggleFollow() {
    if (busy) return;
    setBusy(true);
    if (following) {
      await unfollow(user!.id, id);
    } else {
      await follow(user!.id, id);
    }
    setFollowing(!following);
    setBusy(false);
    load();
  }

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
          <Stack.Screen options={{ title: profile?.displayName ?? 'Profile' }} />
          {profile === null ? null : (
            <>
              <View style={styles.headerRow}>
                <Avatar userId={profile.id} username={profile.username} displayName={profile.displayName} size={84} />
                <View style={styles.statsRow}>
                  <StatBlock value={stats?.posts ?? 0} label="posts" />
                  <StatBlock value={stats?.followers ?? 0} label="followers" />
                  <StatBlock value={stats?.following ?? 0} label="following" />
                </View>
              </View>
              <View style={styles.nameBlock}>
                <Text style={styles.displayName}>{profile.displayName}</Text>
                <Text style={styles.username}>@{profile.username}</Text>
              </View>
              {!isSelf && (
                <View style={styles.followWrap}>
                  <FollowButton following={following} busy={busy} onPress={toggleFollow} />
                </View>
              )}
              <Text style={styles.gridLabel}>Posts</Text>
            </>
          )}
        </View>
      }
      ListEmptyComponent={
        profile === null ? undefined : (
          <EmptyState title="No posts yet" subtitle={`@${profile.username} hasn't posted anything yet.`} style={styles.empty} />
        )
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
  followWrap: {
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
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
