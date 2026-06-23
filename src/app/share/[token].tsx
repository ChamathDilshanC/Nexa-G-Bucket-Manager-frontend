import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import { EmptyState, ErrorBanner, LoadingState } from '@/components/dashboard/empty-state';
import { FileRow } from '@/components/dashboard/file-row';
import { AppScreen, ScreenHeader } from '@/components/dashboard/screen-header';
import { SectionTitle } from '@/components/dashboard/section-title';
import { ShareQrPanel } from '@/components/share/share-qr-panel';
import { AppIcon, AppIcons } from '@/components/ui/app-icon';
import { Fonts } from '@/constants/fonts';
import { ZentraLayout } from '@/constants/zentra-theme';
import { useThemeColors } from '@/contexts/theme-context';
import { buildShareUrl } from '@/lib/share-url';
import { getSharedDownloadUrl, listSharedFiles, resolveShareToken } from '@/services/shares';
import { ApiError } from '@/services/api';
import type { ShareResolve } from '@/types/share';
import type { StorageFile } from '@/types/bucket';
import { SHARE_ROLE_LABELS } from '@/types/share';

export default function SharedBucketScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token: string }>();
  const token = params.token;

  const [meta, setMeta] = useState<ShareResolve | null>(null);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const colors = useThemeColors();

  const loadSharedBucket = useCallback(
    async (isRefresh = false) => {
      if (!token) return;

      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const [resolved, fileList] = await Promise.all([
          resolveShareToken(token),
          listSharedFiles(token),
        ]);
        setMeta(resolved);
        setFiles(fileList);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'This share link is invalid or expired.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useFocusEffect(
    useCallback(() => {
      void loadSharedBucket();
    }, [loadSharedBucket]),
  );

  async function handleDownload(file: StorageFile) {
    if (!token) return;

    try {
      const signed = await getSharedDownloadUrl(token, file.name);
      const opened = await Linking.canOpenURL(signed.url);
      if (!opened) {
        throw new Error('Cannot open download link on this device.');
      }
      await Linking.openURL(signed.url);
    } catch (err) {
      Alert.alert('Download failed', err instanceof Error ? err.message : 'Could not download file.');
    }
  }

  const shareUrl = token ? buildShareUrl(token) : '';

  return (
    <AppScreen
      header={
        <ScreenHeader
          title={meta?.display_name ?? 'Shared bucket'}
          subtitle={
            meta
              ? `${SHARE_ROLE_LABELS[meta.role]} access · ${files.length} file${files.length === 1 ? '' : 's'}`
              : 'Loading shared bucket...'
          }
          onBack={() => router.back()}
          rightAction={
            shareUrl ? (
              <Pressable
                onPress={() => setShowQr((current) => !current)}
                className="flex-row items-center gap-1 rounded-full border border-app-border bg-app-card-muted px-3 py-2">
                <AppIcon name={AppIcons.qrCode} size={16} color={colors.title} />
                <Text style={{ fontFamily: Fonts.semibold, fontSize: 13, color: colors.title }}>
                  QR
                </Text>
              </Pressable>
            ) : null
          }
        />
      }>
      <View style={{ flex: 1, paddingHorizontal: ZentraLayout.horizontalPadding }}>
        {error ? <ErrorBanner message={error} /> : null}
        {showQr && shareUrl ? (
          <View
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              borderRadius: 16,
              marginBottom: 16,
              paddingVertical: 8,
            }}>
            <ShareQrPanel url={shareUrl} />
          </View>
        ) : null}

        {loading ? (
          <LoadingState />
        ) : (
          <FlatList
            data={files}
            keyExtractor={(item) => item.name}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadSharedBucket(true)}
                tintColor={colors.accent}
              />
            }
            contentContainerStyle={{ paddingBottom: 32, flexGrow: files.length ? 0 : 1 }}
            ListHeaderComponent={
              files.length ? (
                <SectionTitle title="Files" subtitle="Tap a file to download" />
              ) : null
            }
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            ListEmptyComponent={
              <EmptyState
                title="No files in this bucket"
                description="The owner has not uploaded any files yet."
                icon={AppIcons.folder}
              />
            }
            renderItem={({ item }) => (
              <FileRow
                bucketName={meta?.bucket_name ?? 'shared'}
                file={item}
                onPress={() => void handleDownload(item)}
              />
            )}
          />
        )}
      </View>
    </AppScreen>
  );
}
