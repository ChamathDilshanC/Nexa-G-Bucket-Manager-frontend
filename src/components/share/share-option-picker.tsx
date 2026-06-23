import { Modal, Pressable, Text, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { useThemeColors } from '@/contexts/theme-context';

export type PickerOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
  icon?: AppIconName;
};

type ShareOptionPickerProps<T extends string> = {
  visible: boolean;
  title: string;
  options: PickerOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
};

export function ShareOptionPicker<T extends string>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: ShareOptionPickerProps<T>) {
  const colors = useThemeColors();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/45 p-4 dark:bg-black/60" onPress={onClose}>
        <View
          className="overflow-hidden rounded-2xl bg-app-card px-1 pb-3 pt-4 shadow-lg"
          onStartShouldSetResponder={() => true}>
          <Text className="mb-2 px-4 font-inter-semibold text-base text-app-title">{title}</Text>

          {options.map((option, index) => {
            const isSelected = option.value === selected;

            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
                className={[
                  'min-h-[56px] w-full flex-row items-center justify-between rounded-xl px-4 py-3 active:opacity-90',
                  isSelected ? 'bg-app-accent-soft' : 'bg-app-card',
                  index < options.length - 1 ? 'border-b border-app-border' : '',
                ].join(' ')}>
                <View className="min-w-0 flex-1 flex-row items-center gap-3 pr-3">
                  {option.icon ? (
                    <View className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-app-surface">
                      <AppIcon
                        name={option.icon}
                        size={18}
                        color={isSelected ? colors.accent : colors.muted}
                      />
                    </View>
                  ) : null}

                  <View className="min-w-0 flex-1">
                    <Text
                      className={[
                        'font-inter-medium text-base text-app-title',
                        isSelected ? 'font-inter-semibold text-app-accent' : '',
                      ].join(' ')}
                      numberOfLines={1}>
                      {option.label}
                    </Text>
                    {option.description ? (
                      <Text className="mt-0.5 font-inter text-sm leading-5 text-app-body" numberOfLines={2}>
                        {option.description}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View className="h-6 w-6 shrink-0 items-center justify-center">
                  {isSelected ? <AppIcon name="checkmark" size={20} color={colors.accent} /> : null}
                </View>
              </Pressable>
            );
          })}

          <Pressable
            onPress={onClose}
            className="mx-1 mt-2 min-h-[48px] items-center justify-center rounded-xl bg-app-surface px-4 py-3 active:opacity-90">
            <Text className="font-inter-semibold text-base text-app-body">Cancel</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

type ShareDropdownTriggerProps = {
  label: string;
  disabled?: boolean;
  onPress: () => void;
};

export function ShareDropdownTrigger({ label, disabled = false, onPress }: ShareDropdownTriggerProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      className={[
        'min-h-[44px] shrink-0 flex-row items-center justify-center gap-1 rounded-lg border border-app-border-strong bg-app-card px-3 py-2 active:opacity-90',
        disabled ? 'bg-app-surface opacity-45' : '',
      ].join(' ')}>
      <Text
        className={[
          'shrink-0 font-inter-semibold text-sm text-app-title',
          disabled ? 'text-app-muted' : '',
        ].join(' ')}
        numberOfLines={1}>
        {label}
      </Text>
      <AppIcon name="chevron-down" size={14} color={disabled ? colors.muted : colors.body} />
    </Pressable>
  );
}
