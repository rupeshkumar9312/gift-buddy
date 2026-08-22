import { Text, View } from "react-native";
import { Gift } from "lucide-react-native";
import { colors } from "@/lib/theme";

export function Logo({ showTagline = true }: { showTagline?: boolean }) {
  return (
    <View className="flex-row items-center gap-2.5">
      <View className="h-9 w-9 items-center justify-center rounded-full bg-primary">
        <Gift size={18} strokeWidth={2.25} color={colors.white} />
      </View>
      <View>
        <Text className="font-sans-semibold text-[22px] leading-none text-ink">
          Gift<Text className="text-primary">Buddy</Text>
        </Text>
        {showTagline && (
          <Text className="mt-1 font-sans-medium text-[9px] uppercase tracking-[2px] text-muted">
            Your Gifting Partner
          </Text>
        )}
      </View>
    </View>
  );
}
