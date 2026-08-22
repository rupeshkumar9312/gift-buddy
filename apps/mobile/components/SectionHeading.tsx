import { Text, View } from "react-native";

export function SectionHeading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <View className="items-center">
      {eyebrow && <Text className="font-script text-2xl text-primary">{eyebrow}</Text>}
      <Text className="mt-1 text-center font-sans-medium text-2xl text-ink">{title}</Text>
    </View>
  );
}
