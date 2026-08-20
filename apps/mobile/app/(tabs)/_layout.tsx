import { Tabs } from "expo-router";
import { Home, ShoppingBag, ShoppingCart, User } from "lucide-react-native";
import { View, Text } from "react-native";
import { colors } from "@/lib/theme";
import { useCart } from "@/context/CartContext";

function CartIcon({ color, size }: { color: string; size: number }) {
  const { itemCount } = useCart();
  return (
    <View>
      <ShoppingCart color={color} size={size} />
      {itemCount > 0 && (
        <View className="absolute -right-2 -top-1.5 h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1">
          <Text className="text-[10px] font-medium text-white">{itemCount}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.line,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: "Jost_500Medium", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="shop"
        options={{ title: "Shop", tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => <CartIcon color={String(color)} size={size} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: "Account", tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  );
}
