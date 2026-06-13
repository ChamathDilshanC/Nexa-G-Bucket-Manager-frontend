import { Pressable, Text, View } from 'react-native';

import { Fonts } from '@/constants/fonts';
import { ZentraColors } from '@/constants/zentra-theme';
import type { Bucket } from '@/types/bucket';
import { formatDate } from '@/utils/format';

type BucketCardProps = {
  bucket: Bucket;
  fileCount?: number;
  onPress: () => void;
  onLongPress?: () => void;
};

export function BucketCard({ bucket, fileCount, onPress, onLongPress }: BucketCardProps) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => ({
        backgroundColor: ZentraColors.card,
        borderWidth: 1,
        borderColor: ZentraColors.cardBorder,
        borderRadius: 16,
        padding: 14,
        marginBottom: 0,
        opacity: pressed ? 0.9 : 1,
      })}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: Fonts.semibold,
              fontSize: 16,
              lineHeight: 22,
              color: ZentraColors.title,
            }}>
            {bucket.display_name}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.regular,
              fontSize: 12,
              lineHeight: 18,
              color: ZentraColors.muted,
              marginTop: 2,
            }}>
            {bucket.public ? 'Public bucket' : 'Private bucket'}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: ZentraColors.surface,
            borderRadius: 10,
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}>
          <Text
            style={{
              fontFamily: Fonts.semibold,
              fontSize: 11,
              lineHeight: 16,
              color: ZentraColors.accent,
            }}>
            {fileCount ?? '—'} file{fileCount === 1 ? '' : 's'}
          </Text>
        </View>
      </View>

      <Text
        style={{
          fontFamily: Fonts.regular,
          fontSize: 11,
          lineHeight: 16,
          color: ZentraColors.body,
          marginTop: 10,
        }}>
        Created {formatDate(bucket.created_at)}
      </Text>
    </Pressable>
  );
}
