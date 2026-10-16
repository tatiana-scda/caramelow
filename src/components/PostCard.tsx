import { Image, StyleSheet, Text, View } from 'react-native';

import Avatar from '@/components/Avatar';
import { colors, spacing, typography } from '@/theme';
import { timeAgo } from '@/lib/util';
import type { FeedPost } from '@/lib/types';

interface PostCardProps {
  item: FeedPost;
}

function imageSource(image: string | number): { uri: string } | number {
  return typeof image === 'number' ? image : { uri: image };
}

export default function PostCard({ item }: PostCardProps) {
  const { post, author } = item;
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar userId={author.id} username={author.username} displayName={author.displayName} size={36} />
        <View style={styles.headerText}>
          <Text style={styles.displayName}>{author.displayName}</Text>
          <Text style={styles.usernameTime}>
            @{author.username} · {timeAgo(post.createdAt)}
          </Text>
        </View>
      </View>
      <Image
        source={imageSource(post.image)}
        style={styles.image}
        accessibilityLabel={post.caption || 'Post image'}
      />
      {post.caption.length > 0 && (
        <View style={styles.captionRow}>
          <Text style={styles.captionAuthor}>{author.displayName}</Text>
          <Text style={styles.caption}>{post.caption}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerText: {
    marginLeft: spacing.sm,
  },
  displayName: {
    color: colors.text,
    fontSize: typography.body - 2,
    fontWeight: '600',
  },
  usernameTime: {
    color: colors.textMuted,
    fontSize: 12,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.primarySoft,
  },
  captionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    alignItems: 'flex-start',
  },
  captionAuthor: {
    color: colors.text,
    fontSize: typography.body - 2,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  caption: {
    color: colors.text,
    fontSize: typography.body - 2,
    flex: 1,
  },
});
