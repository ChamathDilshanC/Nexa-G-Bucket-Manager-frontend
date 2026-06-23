import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  FlatList,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import { EmptyState, ErrorBanner, LoadingState } from '@/components/dashboard/empty-state';
import { FileRow } from '@/components/dashboard/file-row';
import { AppScreen, ScreenHeader } from '@/components/dashboard/screen-header';
import { ShareSheetModal } from '@/components/share/share-sheet-modal';
import { AppIcons } from '@/components/ui/app-icon';
import { SectionTitle } from '@/components/dashboard/section-title';
import { Fonts } from '@/constants/fonts';
import { ZentraLayout } from '@/constants/zentra-theme';
import { useThemeColors } from '@/contexts/theme-context';
import { useAuth } from '@/contexts/auth-context';
import {
  getCachedFiles,
  invalidateBucketsCache,
  invalidateFilesCache,
  setCachedFiles,
} from '@/lib/data-cache';
import { invalidatePreviewCache, prefetchImagePreviews } from '@/lib/preview-cache';
import {
  deleteFile,
  getDownloadUrl,
  getUploadUrl,
  listFiles,
  uploadFileToSignedUrl,
} from '@/services/files';
import { ApiError } from '@/services/api';
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES, type StorageFile } from '@/types/bucket';

export default function BucketDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ name: string; displayName?: string }>();
  const bucketName = params.name;
  const displayName = params.displayName ?? bucketName;

  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [shareVisible, setShareVisible] = useState(false);
  const colors = useThemeColors();

  const loadFiles = useCallback(
    async (isRefresh = false) => {
      if (!bucketName) return;

      const cached = !isRefresh ? getCachedFiles(bucketName) : null;
      if (cached) {
        setFiles(cached);
        setLoading(false);
      }

      try {
        if (isRefresh) setRefreshing(true);
        else if (!cached) setLoading(true);
        setError(null);
        const data = await listFiles(bucketName);
        setFiles(data);
        setCachedFiles(bucketName, data);
        void prefetchImagePreviews(bucketName, data).then(() => {
          setPreviewVersion((current) => current + 1);
        });
      } catch (err) {
        if (!cached) {
          setError(err instanceof ApiError ? err.message : 'Failed to load files.');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [bucketName],
  );

  useFocusEffect(
    useCallback(() => {
      void loadFiles();
    }, [loadFiles]),
  );

  async function handleUpload() {
    if (!bucketName) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: ALLOWED_MIME_TYPES as unknown as string[],
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      const mimeType = asset.mimeType ?? 'application/octet-stream';
      const size = asset.size ?? 0;

      if (!ALLOWED_MIME_TYPES.includes(mimeType as (typeof ALLOWED_MIME_TYPES)[number])) {
        Alert.alert('Unsupported file', 'Only JPEG, PNG, and PDF files are allowed.');
        return;
      }

      if (size > MAX_UPLOAD_SIZE_BYTES) {
        Alert.alert('File too large', 'Maximum upload size is 50 MB.');
        return;
      }

      setUploading(true);
      const safeName = asset.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const objectPath = `${Date.now()}-${safeName}`;

      const signed = await getUploadUrl({
        bucket: bucketName,
        path: objectPath,
        content_type: mimeType,
        file_size_bytes: size || undefined,
      });

      await uploadFileToSignedUrl(signed.url, signed.token, asset.uri, mimeType);
      invalidateFilesCache(bucketName);
      invalidatePreviewCache(bucketName);
      invalidateBucketsCache();
      await loadFiles(true);
      Alert.alert('Upload complete', `${asset.name} uploaded successfully.`);
    } catch (err) {
      Alert.alert('Upload failed', err instanceof Error ? err.message : 'Could not upload file.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(file: StorageFile) {
    if (!bucketName) return;

    try {
      const signed = await getDownloadUrl(bucketName, file.name);
      const opened = await Linking.canOpenURL(signed.url);

      if (!opened) {
        throw new Error('Cannot open download link on this device.');
      }

      await Linking.openURL(signed.url);
    } catch (err) {
      Alert.alert('Download failed', err instanceof Error ? err.message : 'Could not download file.');
    }
  }

  function confirmDelete(file: StorageFile) {
    Alert.alert('Delete file', `Delete "${file.name.split('/').pop()}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteFile(bucketName, file.name);
              invalidateFilesCache(bucketName);
              invalidatePreviewCache(bucketName);
              invalidateBucketsCache();
              await loadFiles(true);
            } catch (err) {
              Alert.alert(
                'Delete failed',
                err instanceof ApiError ? err.message : 'Could not delete file.',
              );
            }
          })();
        },
      },
    ]);
  }

  function showFileActions(file: StorageFile) {
    const options = ['Download', 'Delete', 'Cancel'];
    const destructiveButtonIndex = 1;
    const cancelButtonIndex = 2;

    const onSelect = (index: number) => {
      if (index === 0) void handleDownload(file);
      if (index === 1) confirmDelete(file);
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, destructiveButtonIndex, cancelButtonIndex, title: file.name.split('/').pop() ?? file.name },
        onSelect,
      );
      return;
    }

    Alert.alert(file.name.split('/').pop() ?? 'File', 'Choose an action', [
      { text: 'Download', onPress: () => onSelect(0) },
      { text: 'Delete', style: 'destructive', onPress: () => onSelect(1) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <AppScreen
      header={
        <ScreenHeader
          title={displayName}
          subtitle={`${files.length} file${files.length === 1 ? '' : 's'} in this bucket`}
          onBack={() => router.back()}
          rightAction={
            <Pressable
              onPress={() => setShareVisible(true)}
              style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                borderRadius: 999,
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}>
              <Text style={{ fontFamily: Fonts.semibold, fontSize: 14, color: colors.title }}>
                Share
              </Text>
            </Pressable>
          }
        />
      }>
      <View style={{ flex: 1, paddingHorizontal: ZentraLayout.horizontalPadding }}>
        {error ? <ErrorBanner message={error} /> : null}

        {loading ? (
          <LoadingState />
        ) : (
          <FlatList
            data={files}
            keyExtractor={(item) => item.name}
            extraData={previewVersion}
            initialNumToRender={8}
            maxToRenderPerBatch={6}
            windowSize={7}
            removeClippedSubviews
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadFiles(true)}
                tintColor={colors.accent}
              />
            }
            contentContainerStyle={{ paddingBottom: 100, flexGrow: files.length ? 0 : 1 }}
            ListHeaderComponent={
              files.length ? (
                <SectionTitle
                  title="Files"
                  subtitle={`${files.length} file${files.length === 1 ? '' : 's'} in this bucket`}
                />
              ) : null
            }
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            ListEmptyComponent={
              <EmptyState
                title="No files yet"
                description="Upload JPEG, PNG, or PDF files to this bucket."
                icon={AppIcons.folder}
              />
            }
            renderItem={({ item }) => (
              <FileRow bucketName={bucketName} file={item} onPress={() => showFileActions(item)} />
            )}
          />
        )}
      </View>

      <Pressable
        onPress={handleUpload}
        disabled={uploading}
        style={{
          position: 'absolute',
          right: 24,
          bottom: 32,
          backgroundColor: colors.accent,
          borderRadius: 999,
          paddingHorizontal: 20,
          paddingVertical: 14,
          opacity: uploading ? 0.7 : 1,
        }}>
        <Text style={{ fontFamily: Fonts.semibold, fontSize: 15, color: '#FFFFFF' }}>
          {uploading ? 'Uploading...' : '+ Upload'}
        </Text>
      </Pressable>

      {bucketName ? (
        <ShareSheetModal
          visible={shareVisible}
          bucketName={bucketName}
          displayName={displayName}
          ownerEmail={user?.email}
          onClose={() => setShareVisible(false)}
        />
      ) : null}
    </AppScreen>
  );
}
