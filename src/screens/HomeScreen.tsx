import { Image, Platform, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

const logo = require('../../assets/logo.png');

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <Text style={styles.title}>Welcome to Caramelow</Text>
      <Text style={styles.subtitle}>
        Your TypeScript + React Native starter is set up and running.
      </Text>
      <Text style={styles.platform}>Platform: {Platform.OS}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  logo: {
    width: 128,
    height: 128,
    borderRadius: 28,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  platform: {
    color: colors.textMuted,
    fontSize: typography.caption,
    marginTop: spacing.xl,
  },
});
