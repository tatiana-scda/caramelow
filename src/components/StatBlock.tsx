import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

interface StatBlockProps {
  value: number;
  label: string;
}

export default function StatBlock({ value, label }: StatBlockProps) {
  return (
    <View style={styles.block}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  value: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
