import { View } from "react-native";
import { Star } from "lucide-react-native";
import { colors } from "@/lib/theme";

export function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <View className="flex-row items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.round(rating);
        return (
          <Star
            key={i}
            size={size}
            color={filled ? colors.primary : colors.line}
            fill={filled ? colors.primary : colors.line}
          />
        );
      })}
    </View>
  );
}
