import { Image } from 'expo-image';
import { memo, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Fonts } from '@/constants/fonts';
import { ZentraColors } from '@/constants/zentra-theme';
import {
  getCachedPreviewUrl,
  resolvePreviewUrl,
} from '@/lib/preview-cache';
import type { StorageFile } from '@/types/bucket';
import { formatBytes, getFileName, getMimeLabel, isImageFile } from '@/utils/format';

type FileRowProps = {
  bucketName: string;
  file: StorageFile;
  onPress: () => void;
};

function getFileEmoji(contentType: string | null, name: string) {
  if (contentType?.startsWith('image/')) return '🖼️';
  if (contentType === 'application/pdf') return '📄';
  if (name.endsWith('.pdf')) return '📄';
  return '📁';
}

function FileRowComponent({ bucketName, file, onPress }: FileRowProps) {
  const showImagePreview = isImageFile(file.content_type, file.name);
  const [previewUrl, setPreviewUrl] = useState<string | null>(() =>
    showImagePreview ? getCachedPreviewUrl(bucketName, file.name) : null,
  );
  const [previewLoading, setPreviewLoading] = useState(
    showImagePreview && !getCachedPreviewUrl(bucketName, file.name),
  );

  useEffect(() => {
    if (!showImagePreview) return;

    const cached = getCachedPreviewUrl(bucketName, file.name);
    if (cached) {
      setPreviewUrl(cached);
      setPreviewLoading(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        setPreviewLoading(true);
        const url = await resolvePreviewUrl(bucketName, file.name);
        if (!cancelled) {
          setPreviewUrl(url);
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bucketName, file.name, showImagePreview]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ZentraColors.card,
        borderWidth: 1,
        borderColor: ZentraColors.cardBorder,
        borderRadius: 14,
        padding: 12,
        opacity: pressed ? 0.9 : 1,
      })}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          backgroundColor: ZentraColors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
          overflow: 'hidden',
        }}>
        {showImagePreview && previewUrl ? (
          <Image
            source={{ uri: previewUrl }}
            style={{ width: 56, height: 56 }}
            contentFit="cover"
            transition={200}
            recyclingKey={previewUrl}
          />
        ) : showImagePreview && previewLoading ? (
          <ActivityIndicator size="small" color={ZentraColors.accent} />
        ) : (
          <Text style={{ fontSize: 22 }}>{getFileEmoji(file.content_type, file.name)}</Text>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: Fonts.semibold,
            fontSize: 14,
            lineHeight: 20,
            color: ZentraColors.title,
          }}>
          {getFileName(file.name)}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.regular,
            fontSize: 12,
            lineHeight: 18,
            color: ZentraColors.body,
            marginTop: 2,
          }}>
          {getMimeLabel(file.content_type)} · {formatBytes(file.size)}
        </Text>
      </View>

      <Text style={{ color: ZentraColors.muted, fontSize: 18 }}>›</Text>
    </Pressable>
  );
}

export const FileRow = memo(FileRowComponent);
