import * as Clipboard from 'expo-clipboard';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EmptyState, ErrorBanner, LoadingState } from '@/components/dashboard/empty-state';
import { AppScreen, ScreenHeader } from '@/components/dashboard/screen-header';
import { SectionTitle } from '@/components/dashboard/section-title';
import { ShareSheetModal } from '@/components/share/share-sheet-modal';
import { AppIcons } from '@/components/ui/app-icon';
import { useGlassTabBarInset } from '@/components/navigation/glass-tab-bar';
import { useAuth } from '@/contexts/auth-context';
import { Fonts } from '@/constants/fonts';
import { ZentraLayout, type ThemePalette } from '@/constants/zentra-theme';
import { useTheme, useThemeColors } from '@/contexts/theme-context';
import { buildShareUrl } from '@/lib/share-url';
import { listMyShares } from '@/services/shares';
import { ApiError } from '@/services/api';
import type { ShareLink } from '@/types/share';
import { SHARE_ROLE_LABELS } from '@/types/share';

type ShareLinkCardProps = {
  item: ShareLink;
  colors: ThemePalette;
  cardStyles: ReturnType<typeof createCardStyles>;
  onManage: () => void;
  onCopy: () => void;
  onPreview: () => void;
};

function ShareLinkCard({ item, colors, cardStyles, onManage, onCopy, onPreview }: ShareLinkCardProps) {
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.cardHeader}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={cardStyles.cardTitle} numberOfLines={1}>
            {item.display_name ?? item.bucket_name}
          </Text>
          <Text style={cardStyles.cardMeta}>
            {item.anyone_with_link ? 'Anyone with the link' : 'Restricted'} ·{' '}
            {SHARE_ROLE_LABELS[item.role]}
          </Text>
        </View>
        <View
          style={[
            cardStyles.statusPill,
            item.anyone_with_link ? cardStyles.statusActive : cardStyles.statusRestricted,
          ]}>
          <Text style={cardStyles.statusText}>{item.anyone_with_link ? 'Active' : 'Off'}</Text>
        </View>
      </View>

      <View style={cardStyles.actionsRow}>
        <View style={[cardStyles.actionSlot, cardStyles.actionSlotSpaced]}>
          <View
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              backgroundColor: colors.surface,
              overflow: 'hidden',
            }}>
            <Pressable onPress={onManage} style={cardStyles.actionPressable}>
              <Text style={{ fontFamily: Fonts.medium, fontSize: 11, color: colors.title, textAlign: 'center' }}>
                Manage
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[cardStyles.actionSlot, cardStyles.actionSlotSpaced]}>
          <View
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              backgroundColor: colors.surface,
              overflow: 'hidden',
            }}>
            <Pressable onPress={onCopy} style={cardStyles.actionPressable}>
              <Text style={{ fontFamily: Fonts.medium, fontSize: 11, color: colors.title, textAlign: 'center' }}>
                Copy
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={cardStyles.actionSlot}>
          <View
            style={{
              borderRadius: 12,
              backgroundColor: colors.accent,
              overflow: 'hidden',
            }}>
            <Pressable onPress={onPreview} style={cardStyles.actionPressable}>
              <Text style={{ fontFamily: Fonts.semibold, fontSize: 11, color: '#FFFFFF', textAlign: 'center' }}>
                Preview
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function createCardStyles(colors: ThemePalette) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderRadius: 16,
      padding: 14,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    cardTitle: {
      fontFamily: Fonts.semibold,
      fontSize: 16,
      lineHeight: 22,
      color: colors.title,
    },
    cardMeta: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      lineHeight: 18,
      color: colors.body,
      marginTop: 4,
    },
    statusPill: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    statusActive: {
      backgroundColor: 'rgba(34, 197, 94, 0.16)',
    },
    statusRestricted: {
      backgroundColor: 'rgba(107, 114, 128, 0.16)',
    },
    statusText: {
      fontFamily: Fonts.semibold,
      fontSize: 11,
      color: colors.title,
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      marginTop: 14,
    },
    actionSlot: {
      flex: 1,
    },
    actionSlotSpaced: {
      marginRight: 6,
    },
    actionPressable: {
      paddingVertical: 10,
      paddingHorizontal: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

export default function SharedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const tabBarInset = useGlassTabBarInset();
  const [shares, setShares] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<ShareLink | null>(null);
  const colors = useThemeColors();
  const { resolvedColorScheme } = useTheme();
  const cardStyles = useMemo(() => createCardStyles(colors), [colors]);

  const loadShares = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await listMyShares();
      setShares(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load shared links.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadShares();
    }, [loadShares]),
  );

  async function handleCopy(share: ShareLink) {
    await Clipboard.setStringAsync(buildShareUrl(share.token));
    Alert.alert('Copied', 'Share link copied to clipboard.');
  }

  return (
    <AppScreen
      header={
        <ScreenHeader
          title="Shared"
          subtitle="Buckets you've shared with link access"
        />
      }>
      <View style={{ flex: 1, paddingHorizontal: ZentraLayout.horizontalPadding }}>
        {error ? <ErrorBanner message={error} /> : null}

        {loading ? (
          <LoadingState />
        ) : (
          <FlatList
            data={shares}
            keyExtractor={(item) => item.id}
            extraData={resolvedColorScheme}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadShares(true)}
                tintColor={colors.accent}
              />
            }
            contentContainerStyle={{ paddingBottom: tabBarInset, flexGrow: shares.length ? 0 : 1 }}
            ListHeaderComponent={
              shares.length ? (
                <SectionTitle
                  title="Active links"
                  subtitle={`${shares.length} share link${shares.length === 1 ? '' : 's'}`}
                />
              ) : null
            }
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            ListEmptyComponent={
              <EmptyState
                title="No shared links yet"
                description="Open a bucket and tap Share to create a link you can send to others."
                icon={AppIcons.link}
              />
            }
            renderItem={({ item }) => (
              <ShareLinkCard
                item={item}
                colors={colors}
                cardStyles={cardStyles}
                onManage={() => setShareTarget(item)}
                onCopy={() => void handleCopy(item)}
                onPreview={() =>
                  router.push({
                    pathname: '/share/[token]',
                    params: { token: item.token },
                  })
                }
              />
            )}
          />
        )}
      </View>

      {shareTarget ? (
        <ShareSheetModal
          visible
          bucketName={shareTarget.bucket_name}
          displayName={shareTarget.display_name ?? shareTarget.bucket_name}
          ownerEmail={user?.email}
          onClose={() => {
            setShareTarget(null);
            void loadShares(true);
          }}
        />
      ) : null}
    </AppScreen>
  );
}

