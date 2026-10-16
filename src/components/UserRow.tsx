import { Pressable, StyleSheet, Text, View } from 'react-native';

import Avatar from '@/components/Avatar';
import FollowButton from '@/components/FollowButton';
import { colors, spacing, typography } from '@/theme';
import type { PublicUser } from '@/lib/types';

interface UserRowProps {
  user: PublicUser;
  following: boolean;
  busy?: boolean;
  onToggleFollow: () => void;
  onPress?: () => void;
}

export default function UserRow({ user, following, busy, onToggleFollow, onPress }: UserRowProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      <Avatar userId={user.id} username={user.username} displayName={user.displayName} size={44} />
      <View style={styles.names}>
        <Text style={styles.displayName}>{user.displayName}</Text>
        <Text style={styles.username}>@{user.username}</Text>
      </View>
      <FollowButton following={following} busy={busy} onPress={onToggleFollow} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  names: {
    flex: 1,
    marginLeft: spacing.md,
  },
  displayName: {
    color: colors.text,
    fontSize: typography.body - 1,
    fontWeight: '600',
  },
  username: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
