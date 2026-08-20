import { Text, View } from "react-native";

export function ScreenHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View className="border-b border-line bg-cream px-5 py-6">
      <Text className="font-sans-semibold text-2xl text-ink">{title}</Text>
      {subtitle && <Text className="mt-1 text-sm text-muted">{subtitle}</Text>}
    </View>
  );
}
