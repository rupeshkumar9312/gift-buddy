import "@/global.css";
import { useCallback, useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  Jost_300Light,
  Jost_400Regular,
  Jost_500Medium,
  Jost_600SemiBold,
  Jost_700Bold,
} from "@expo-google-fonts/jost";
import { Sacramento_400Regular } from "@expo-google-fonts/sacramento";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { colors } from "@/lib/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Jost_300Light,
    Jost_400Regular,
    Jost_500Medium,
    Jost_600SemiBold,
    Jost_700Bold,
    Sacramento_400Regular,
  });

  const onLayout = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    onLayout();
  }, [onLayout]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
              <Stack
                screenOptions={{
                  headerShown: true,
                  headerTitle: "",
                  headerTintColor: colors.ink,
                  headerStyle: { backgroundColor: colors.background },
                  headerShadowVisible: false,
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="product/[slug]" />
                <Stack.Screen name="occasions/[slug]" />
                <Stack.Screen name="checkout/index" options={{ headerTitle: "Checkout" }} />
                <Stack.Screen
                  name="checkout/success/[orderNumber]"
                  options={{ headerTitle: "Order Confirmed" }}
                />
                <Stack.Screen name="orders/index" options={{ headerTitle: "Order History" }} />
                <Stack.Screen name="orders/[orderNumber]" options={{ headerTitle: "Order Details" }} />
                <Stack.Screen name="track-order" options={{ headerTitle: "Track Order" }} />
              </Stack>
            </View>
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
