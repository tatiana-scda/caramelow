import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import EmptyState from '@/components/EmptyState';
import PostCard from '@/components/PostCard';
import { useAuth } from '@/context/AuthContext';
import { getFeed } from '@/lib/backend';
import type { FeedPost } from '@/lib/types';

export default function FeedScreen() {
  const { user } = useAuth();
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const items = await getFeed(user.id);
    setFeed(items);
    setRefreshing(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={feed}
        keyExtractor={(item) => item.post.id}
        renderItem={({ item }) => <PostCard item={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            style={styles.empty}
            title="No posts yet"
            subtitle="Follow people in Search, or share your first picture with the + button."
          />
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
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
  },
  empty: {
    marginTop: '40%',
  },
});
