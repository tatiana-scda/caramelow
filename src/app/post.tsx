import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { createPost } from '@/lib/backend';
import { colors, spacing, typography } from '@/theme';

export default function PostScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pickImage() {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Permission to access your photos was denied.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });
    if (!result.canceled && result.assets[0]?.base64) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  }

  async function share() {
    if (!user || !image || busy) return;
    setBusy(true);
    try {
      await createPost(user.id, image, caption);
      router.back();
    } catch {
      setError('Could not save the post. Try again.');
      setBusy(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Pressable style={({ pressed }) => [styles.imagePicker, pressed && { opacity: 0.85 }]} onPress={pickImage}>
        {image !== null ? (
          <Image source={{ uri: image }} style={styles.preview} />
        ) : (
          <Text style={styles.imagePickerText}>Tap to choose a photo</Text>
        )}
      </Pressable>

      <TextInput
        style={styles.caption}
        placeholder="Write a caption..."
        placeholderTextColor={colors.textMuted}
        multiline
        value={caption}
        onChangeText={setCaption}
      />

      {error !== null && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={({ pressed }) => [styles.share, (!image || busy) && styles.shareDisabled, pressed && { opacity: 0.8 }]}
        onPress={share}
        disabled={!image || busy}
      >
        {busy ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.shareText}>Share</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  imagePicker: {
    aspectRatio: 1,
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagePickerText: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  caption: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    minHeight: 88,
    padding: spacing.md,
    marginTop: spacing.md,
    textAlignVertical: 'top',
    color: colors.text,
    fontSize: typography.body,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.sm,
  },
  share: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  shareDisabled: {
    opacity: 0.45,
  },
  shareText: {
    color: colors.background,
    fontSize: typography.body,
    fontWeight: '700',
  },
});
