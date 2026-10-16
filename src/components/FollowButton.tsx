import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, spacing } from '@/theme';

interface FollowButtonProps {
  following: boolean;
  onPress: () => void;
  busy?: boolean;
}

export default function FollowButton({ following, onPress, busy = false }: FollowButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => [styles.base, following ? styles.following : styles.notFollowing, pressed && styles.pressed]}
    >
      {busy ? (
        <ActivityIndicator size="small" color={following ? colors.text : colors.background} />
      ) : (
        <Text style={[styles.label, following ? styles.followingLabel : styles.notFollowingLabel]}>
          {following ? 'Following' : 'Follow'}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 92,
  },
  notFollowing: {
    backgroundColor: colors.primary,
  },
  following: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.75,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  notFollowingLabel: {
    color: colors.background,
  },
  followingLabel: {
    color: colors.text,
  },
});
