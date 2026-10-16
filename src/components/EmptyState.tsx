import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, spacing, typography } from '@/theme';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  style?: ViewStyle;
}

export default function EmptyState({ title, subtitle, style }: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  title: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.body - 2,
    textAlign: 'center',
    lineHeight: 20,
  },
});
