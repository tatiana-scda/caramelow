import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import EmptyState from '@/components/EmptyState';
import UserRow from '@/components/UserRow';
import { useAuth } from '@/context/AuthContext';
import { follow, isFollowing, listUsers, unfollow } from '@/lib/backend';
import type { PublicUser } from '@/lib/types';

export default function SearchScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const all = await listUsers();
    setUsers(all.filter((u) => u.id !== user.id));
    const entries = await Promise.all(
      all.map(async (u) => [u.id, await isFollowing(user.id, u.id)] as const),
    );
    setFollowingMap(Object.fromEntries(entries));
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function toggleFollow(targetId: string) {
    if (!user || busyId) return;
    setBusyId(targetId);
    const wasFollowing = followingMap[targetId] ?? false;
    if (wasFollowing) {
      await unfollow(user.id, targetId);
    } else {
      await follow(user.id, targetId);
    }
    setFollowingMap((prev) => ({ ...prev, [targetId]: !wasFollowing }));
    setBusyId(null);
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserRow
            user={item}
            following={followingMap[item.id] ?? false}
            busy={busyId === item.id}
            onToggleFollow={() => toggleFollow(item.id)}
            onPress={() => router.push(`/user/${item.id}`)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<EmptyState title="No one here yet" subtitle="Sign up another account on this device to try following." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'transparent',
  },
});
