import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import { BucketCard } from '@/components/dashboard/bucket-card';
import { BucketFormModal } from '@/components/dashboard/bucket-form-modal';
import { EmptyState, ErrorBanner, LoadingState } from '@/components/dashboard/empty-state';
import { AppScreen, ScreenHeader } from '@/components/dashboard/screen-header';
import { SectionTitle } from '@/components/dashboard/section-title';
import { ShareSheetModal } from '@/components/share/share-sheet-modal';
import { AppIcons } from '@/components/ui/app-icon';
import { useGlassTabBarInset } from '@/components/navigation/glass-tab-bar';
import { useAuth } from '@/contexts/auth-context';
import { Fonts } from '@/constants/fonts';
import { ZentraLayout } from '@/constants/zentra-theme';
import { useThemeColors } from '@/contexts/theme-context';
import {
  getCachedBuckets,
  invalidateBucketsCache,
  setCachedBuckets,
} from '@/lib/data-cache';
import { createBucket, deleteBucket, listBuckets, updateBucket } from '@/services/buckets';
import { listFiles } from '@/services/files';
import { ApiError } from '@/services/api';
import { ALLOWED_MIME_TYPES, type Bucket } from '@/types/bucket';

type BucketWithCount = Bucket & { fileCount?: number };

function toBucketWithCount(bucket: Bucket, fileCount?: number): BucketWithCount {
  return {
    ...bucket,
    fileCount: fileCount ?? bucket.file_count ?? undefined,
  };
}

async function resolveFileCounts(buckets: Bucket[]) {
  const needsCounts = buckets.some((bucket) => bucket.file_count == null);
  if (!needsCounts) {
    return buckets.map((bucket) => toBucketWithCount(bucket));
  }

  return Promise.all(
    buckets.map(async (bucket) => {
      if (bucket.file_count != null) {
        return toBucketWithCount(bucket);
      }

      try {
        const files = await listFiles(bucket.name);
        return toBucketWithCount(bucket, files.length);
      } catch {
        return toBucketWithCount(bucket, 0);
      }
    }),
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [buckets, setBuckets] = useState<BucketWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createVisible, setCreateVisible] = useState(false);
  const [editBucket, setEditBucket] = useState<Bucket | null>(null);
  const [formName, setFormName] = useState('');
  const [formPublic, setFormPublic] = useState(false);
  const [formMimeTypes, setFormMimeTypes] = useState<string[]>([...ALLOWED_MIME_TYPES]);
  const [submitting, setSubmitting] = useState(false);
  const [shareBucket, setShareBucket] = useState<Bucket | null>(null);
  const tabBarInset = useGlassTabBarInset();
  const colors = useThemeColors();

  const loadBuckets = useCallback(async (isRefresh = false) => {
    if (!isAuthenticated || isLoading) return;

    const cached = !isRefresh ? getCachedBuckets() : null;
    if (cached?.length) {
      setBuckets(cached as BucketWithCount[]);
      setLoading(false);
    }

    try {
      if (isRefresh) setRefreshing(true);
      else if (!cached?.length) setLoading(true);
      setError(null);

      const data = await listBuckets();
      const withCounts = await resolveFileCounts(data);
      setBuckets(withCounts);
      setCachedBuckets(withCounts);
    } catch (err) {
      if (!cached?.length) {
        setError(err instanceof ApiError ? err.message : 'Failed to load buckets.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, isLoading]);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated || isLoading) return;
      void loadBuckets();
    }, [isAuthenticated, isLoading, loadBuckets]),
  );

  function openCreateModal() {
    setFormName('');
    setFormPublic(false);
    setFormMimeTypes([...ALLOWED_MIME_TYPES]);
    setCreateVisible(true);
  }

  function openEditModal(bucket: Bucket) {
    setEditBucket(bucket);
    setFormName(bucket.display_name);
    setFormPublic(bucket.public);
    setFormMimeTypes(bucket.allowed_mime_types ?? [...ALLOWED_MIME_TYPES]);
  }

  function toggleMimeType(mime: string) {
    setFormMimeTypes((current) =>
      current.includes(mime) ? current.filter((item) => item !== mime) : [...current, mime],
    );
  }

  async function handleCreateBucket() {
    const trimmed = formName.trim();
    if (trimmed.length < 3) {
      Alert.alert('Invalid name', 'Bucket name must be at least 3 characters.');
      return;
    }

    try {
      setSubmitting(true);
      await createBucket({
        name: trimmed,
        public: formPublic,
        allowed_mime_types: formMimeTypes.length ? formMimeTypes : null,
      });
      invalidateBucketsCache();
      setCreateVisible(false);
      await loadBuckets(true);
    } catch (err) {
      Alert.alert('Create failed', err instanceof ApiError ? err.message : 'Could not create bucket.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateBucket() {
    if (!editBucket) return;

    try {
      setSubmitting(true);
      await updateBucket(editBucket.name, {
        public: formPublic,
        allowed_mime_types: formMimeTypes.length ? formMimeTypes : null,
      });
      invalidateBucketsCache();
      setEditBucket(null);
      await loadBuckets(true);
    } catch (err) {
      Alert.alert('Update failed', err instanceof ApiError ? err.message : 'Could not update bucket.');
    } finally {
      setSubmitting(false);
    }
  }

  function confirmDeleteBucket(bucket: Bucket) {
    Alert.alert(
      'Delete bucket',
      `Delete "${bucket.display_name}"? This removes all files inside.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await deleteBucket(bucket.name, true);
                invalidateBucketsCache();
                await loadBuckets(true);
              } catch (err) {
                Alert.alert(
                  'Delete failed',
                  err instanceof ApiError ? err.message : 'Could not delete bucket.',
                );
              }
            })();
          },
        },
      ],
    );
  }

  function showBucketActions(bucket: Bucket) {
    const options = ['Open files', 'Share', 'Edit settings', 'Delete bucket', 'Cancel'];
    const destructiveButtonIndex = 3;
    const cancelButtonIndex = 4;

    const onSelect = (index: number) => {
      if (index === 0) {
        router.push({
          pathname: '/bucket/[name]',
          params: { name: bucket.name, displayName: bucket.display_name },
        });
      } else if (index === 1) {
        setShareBucket(bucket);
      } else if (index === 2) {
        openEditModal(bucket);
      } else if (index === 3) {
        confirmDeleteBucket(bucket);
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, destructiveButtonIndex, cancelButtonIndex, title: bucket.display_name },
        onSelect,
      );
      return;
    }

    Alert.alert(bucket.display_name, 'Choose an action', [
      { text: 'Open files', onPress: () => onSelect(0) },
      { text: 'Share', onPress: () => onSelect(1) },
      { text: 'Edit settings', onPress: () => onSelect(2) },
      { text: 'Delete bucket', style: 'destructive', onPress: () => onSelect(3) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  const header = (
    <ScreenHeader
      title="Dashboard"
      subtitle={user?.email ? `Signed in as ${user.email}` : 'Manage your cloud buckets'}
      rightAction={
        <Pressable
          onPress={openCreateModal}
          style={{
            backgroundColor: colors.accent,
            borderRadius: 999,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}>
          <Text style={{ fontFamily: Fonts.semibold, fontSize: 14, color: '#FFFFFF' }}>+ New</Text>
        </Pressable>
      }
    />
  );

  return (
    <AppScreen header={header}>
      <View style={{ flex: 1, paddingHorizontal: ZentraLayout.horizontalPadding }}>
        {error ? <ErrorBanner message={error} /> : null}

        {loading ? (
          <LoadingState />
        ) : (
          <FlatList
            data={buckets}
            keyExtractor={(item) => item.name}
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadBuckets(true)}
                tintColor={colors.accent}
              />
            }
            contentContainerStyle={{ paddingBottom: tabBarInset, flexGrow: buckets.length ? 0 : 1 }}
            ListHeaderComponent={
              buckets.length ? (
                <SectionTitle
                  title="Buckets"
                  subtitle={`${buckets.length} bucket${buckets.length === 1 ? '' : 's'} in your account`}
                />
              ) : null
            }
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            ListEmptyComponent={
              <EmptyState
                title="No buckets yet"
                description="Create your first bucket to start uploading and organizing files."
                icon={AppIcons.cloud}
              />
            }
            renderItem={({ item }) => (
              <BucketCard
                bucket={item}
                fileCount={item.fileCount}
                onPress={() =>
                  router.push({
                    pathname: '/bucket/[name]',
                    params: { name: item.name, displayName: item.display_name },
                  })
                }
                onShare={() => setShareBucket(item)}
                onLongPress={() => showBucketActions(item)}
              />
            )}
          />
        )}
      </View>

      <BucketFormModal
        visible={createVisible}
        title="Create bucket"
        submitLabel={submitting ? 'Creating...' : 'Create bucket'}
        name={formName}
        isPublic={formPublic}
        selectedMimeTypes={formMimeTypes}
        loading={submitting}
        onChangeName={setFormName}
        onChangePublic={setFormPublic}
        onToggleMimeType={toggleMimeType}
        onClose={() => setCreateVisible(false)}
        onSubmit={handleCreateBucket}
      />

      <BucketFormModal
        visible={Boolean(editBucket)}
        title="Edit bucket"
        submitLabel={submitting ? 'Saving...' : 'Save changes'}
        name={formName}
        isPublic={formPublic}
        selectedMimeTypes={formMimeTypes}
        loading={submitting}
        nameEditable={false}
        onChangeName={setFormName}
        onChangePublic={setFormPublic}
        onToggleMimeType={toggleMimeType}
        onClose={() => setEditBucket(null)}
        onSubmit={handleUpdateBucket}
      />

      {shareBucket ? (
        <ShareSheetModal
          visible
          bucketName={shareBucket.name}
          displayName={shareBucket.display_name}
          ownerEmail={user?.email}
          onClose={() => setShareBucket(null)}
        />
      ) : null}
    </AppScreen>
  );
}
