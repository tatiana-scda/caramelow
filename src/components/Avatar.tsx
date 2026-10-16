import { Image, StyleSheet, Text, View } from 'react-native';

import { seedAvatarById } from '@/lib/backend';
import { avatarColors, colors } from '@/theme';

interface AvatarProps {
  userId: string;
  username: string;
  displayName: string;
  size?: number;
}

function initials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

function colorFor(username: string): string {
  let sum = 0;
  for (let i = 0; i < username.length; i += 1) sum += username.charCodeAt(i);
  return avatarColors[sum % avatarColors.length]!;
}

export default function Avatar({ userId, username, displayName, size = 44 }: AvatarProps) {
  const seedImage = seedAvatarById[userId];
  const fontSize = Math.max(10, Math.round(size * 0.38));

  if (seedImage !== undefined) {
    return <Image source={seedImage} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }

  return (
    <View
      style={[
        styles.initials,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colorFor(username) },
      ]}
    >
      <Text style={[styles.initialsText, { fontSize }]}>{initials(displayName)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  initials: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: colors.background,
    fontWeight: '700',
  },
});
