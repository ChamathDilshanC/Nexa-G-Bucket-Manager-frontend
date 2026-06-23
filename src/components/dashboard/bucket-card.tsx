import { Pressable, Text, View } from 'react-native';

import { AppIcon, AppIcons } from '@/components/ui/app-icon';
import { Fonts } from '@/constants/fonts';
import { useThemeColors } from '@/contexts/theme-context';
import type { Bucket } from '@/types/bucket';
import { formatDate } from '@/utils/format';

type BucketCardProps = {
  bucket: Bucket;
  fileCount?: number;
  onPress: () => void;
  onShare?: () => void;
  onLongPress?: () => void;
};

export function BucketCard({ bucket, fileCount, onPress, onShare, onLongPress }: BucketCardProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => ({
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
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
              color: colors.title,
            }}>
            {bucket.display_name}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.regular,
              fontSize: 12,
              lineHeight: 18,
              color: colors.muted,
              marginTop: 2,
            }}>
            {bucket.public ? 'Public bucket' : 'Private bucket'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {onShare ? (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                onShare();
              }}
              hitSlop={8}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <AppIcon name={AppIcons.share} size={16} color={colors.accent} />
            </Pressable>
          ) : null}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 10,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}>
            <Text
              style={{
                fontFamily: Fonts.semibold,
                fontSize: 11,
                lineHeight: 16,
                color: colors.accent,
              }}>
              {fileCount ?? '—'} file{fileCount === 1 ? '' : 's'}
            </Text>
          </View>
        </View>
      </View>

      <Text
        style={{
          fontFamily: Fonts.regular,
          fontSize: 11,
          lineHeight: 16,
          color: colors.body,
          marginTop: 10,
        }}>
        Created {formatDate(bucket.created_at)}
      </Text>
    </Pressable>
  );
}
