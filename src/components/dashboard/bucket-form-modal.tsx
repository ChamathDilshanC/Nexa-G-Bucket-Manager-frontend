import { useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/auth-button';
import { Fonts } from '@/constants/fonts';
import { ZentraLayout, type ThemePalette } from '@/constants/zentra-theme';
import { useThemeColors } from '@/contexts/theme-context';
import { ALLOWED_MIME_TYPES } from '@/types/bucket';

type BucketFormModalProps = {
  visible: boolean;
  title: string;
  submitLabel: string;
  name: string;
  isPublic: boolean;
  selectedMimeTypes: string[];
  loading?: boolean;
  nameEditable?: boolean;
  onChangeName: (value: string) => void;
  onChangePublic: (value: boolean) => void;
  onToggleMimeType: (mime: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function BucketFormModal({
  visible,
  title,
  submitLabel,
  name,
  isPublic,
  selectedMimeTypes,
  loading = false,
  nameEditable = true,
  onChangeName,
  onChangePublic,
  onToggleMimeType,
  onClose,
  onSubmit,
}: BucketFormModalProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close modal" />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: Math.max(insets.bottom, 16) + (Platform.OS === 'android' ? keyboardHeight : 0),
            },
          ]}>
          <View style={styles.sheet}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{title}</Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Bucket name</Text>
              <TextInput
                value={name}
                onChangeText={onChangeName}
                editable={nameEditable && !loading}
                placeholder="eg. photos"
                placeholderTextColor={colors.inputPlaceholder}
                autoCapitalize="none"
                returnKeyType="done"
                style={[styles.input, !nameEditable && styles.inputDisabled]}
              />
            </View>

            <View style={[styles.section, styles.card]}>
              <View style={styles.publicRow}>
                <View style={styles.publicCopy}>
                  <Text style={styles.cardTitle}>Public bucket</Text>
                  <Text style={styles.cardBody}>Allow public access when enabled.</Text>
                </View>
                <Switch
                  value={isPublic}
                  onValueChange={onChangePublic}
                  disabled={loading}
                  trackColor={{ false: colors.inputBorder, true: colors.accent }}
                  thumbColor={colors.title}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Allowed file types</Text>
              <View style={styles.chipRow}>
                {ALLOWED_MIME_TYPES.map((mime, index) => {
                  const selected = selectedMimeTypes.includes(mime);
                  return (
                    <Pressable
                      key={mime}
                      onPress={() => onToggleMimeType(mime)}
                      disabled={loading}
                      style={[
                        styles.chip,
                        index < ALLOWED_MIME_TYPES.length - 1 && styles.chipSpaced,
                        selected && styles.chipSelected,
                      ]}>
                      <Text style={styles.chipText}>{mime.split('/')[1]?.toUpperCase()}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.submitWrap}>
              <AuthButton label={submitLabel} onPress={onSubmit} disabled={loading} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(colors: ThemePalette) {
  return StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: ZentraLayout.horizontalPadding,
    paddingTop: 24,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderColor: colors.cardBorder,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.title,
  },
  closeText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    lineHeight: 22,
    color: colors.body,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.body,
    marginBottom: 10,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    color: colors.title,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 24,
  },
  publicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  publicCopy: {
    flex: 1,
    paddingRight: 16,
  },
  cardTitle: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    color: colors.title,
  },
  cardBody: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.body,
    marginTop: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 10,
  },
  chipSpaced: {
    marginRight: 10,
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.title,
  },
  submitWrap: {
    marginTop: 8,
    marginBottom: 8,
  },
  });
}

