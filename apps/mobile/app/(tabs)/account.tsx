import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { User } from "lucide-react-native";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/lib/theme";

const inputClassName = "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink";

// Plain StyleSheet, not NativeWind className, for the tab labels — a
// conditional className reliably failed to color native Text here even
// with two complete literal strings per branch, so this bypasses
// className resolution entirely (see the matching note in shop.tsx).
const tabStyles = StyleSheet.create({
  pill: { flex: 1, alignItems: "center", borderRadius: 999, paddingVertical: 10 },
  pillActive: { backgroundColor: colors.primary },
  label: { fontSize: 14, fontFamily: "Jost_500Medium", textTransform: "uppercase", letterSpacing: 0.5 },
  labelActive: { color: colors.white },
  labelInactive: { color: colors.muted },
});

export default function AccountScreen() {
  const { user, isLoading, login, register, isGoogleSignInReady, promptGoogleSignIn, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async () => {
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await register({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleSubmitting(true);
    try {
      await promptGoogleSignIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't sign in with Google.");
    } finally {
      setGoogleSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <ScreenHeader title="My Account" />
        <ActivityIndicator color={colors.primary} className="mt-10" />
      </SafeAreaView>
    );
  }

  if (user) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <ScreenHeader title="My Account" />
        <View className="flex-1 items-center px-6 py-10">
          <View className="w-full max-w-md items-center rounded-2xl border border-line bg-white p-8">
            <Text className="text-sm text-muted">Signed in as</Text>
            <Text className="mt-1 text-lg font-sans-medium text-ink">
              {user.firstName} {user.lastName}
            </Text>
            <Text className="text-sm text-muted">{user.email ?? user.phone}</Text>
            <View className="mt-6 w-full flex-col gap-3">
              <Pressable
                onPress={() => router.push("/orders")}
                className="items-center rounded-full bg-primary px-8 py-3"
              >
                <Text className="font-sans-medium text-sm uppercase tracking-wide text-white">
                  Order History
                </Text>
              </Pressable>
              <Pressable
                onPress={() => logout()}
                className="items-center rounded-full border border-ink px-8 py-3"
              >
                <Text className="font-sans-medium text-sm uppercase tracking-wide text-ink">Sign Out</Text>
              </Pressable>
            </View>
          </View>
          <Pressable onPress={() => router.push("/track-order")} className="mt-6">
            <Text className="text-sm text-primary">Track a guest order instead</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScreenHeader title="My Account" />
      <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        <View className="mb-8 flex-row rounded-full bg-cream p-1">
          <Pressable
            onPress={() => {
              setTab("signin");
              setError(null);
            }}
            style={[tabStyles.pill, tab === "signin" && tabStyles.pillActive]}
          >
            <Text style={[tabStyles.label, tab === "signin" ? tabStyles.labelActive : tabStyles.labelInactive]}>
              Sign In
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setTab("register");
              setError(null);
            }}
            style={[tabStyles.pill, tab === "register" && tabStyles.pillActive]}
          >
            <Text style={[tabStyles.label, tab === "register" ? tabStyles.labelActive : tabStyles.labelInactive]}>
              Sign Up
            </Text>
          </Pressable>
        </View>

        {error && (
          <Text className="mb-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm text-primary">
            {error}
          </Text>
        )}

        <View className="flex flex-col gap-4">
          <GoogleSigninButton
            style={{ width: "100%", height: 48, alignSelf: "center" }}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Light}
            onPress={handleGoogleSignIn}
            disabled={!isGoogleSignInReady || googleSubmitting}
          />
          <Text className="text-center text-xs uppercase tracking-wide text-muted">or</Text>

          {tab === "signin" ? (
            <>
              <View>
                <Text className="mb-1.5 text-sm text-muted">Email</Text>
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  className={inputClassName}
                />
              </View>
              <View>
                <Text className="mb-1.5 text-sm text-muted">Password</Text>
                <TextInput
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  className={inputClassName}
                />
              </View>
              <Pressable
                onPress={handleSignIn}
                disabled={submitting || !email.trim() || !password}
                className="mt-2 items-center rounded-full bg-primary py-3.5 disabled:opacity-60"
              >
                <Text className="font-sans-medium text-sm uppercase tracking-wide text-white">
                  {submitting ? "Signing in…" : "Login"}
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="mb-1.5 text-sm text-muted">First name</Text>
                  <TextInput value={firstName} onChangeText={setFirstName} className={inputClassName} />
                </View>
                <View className="flex-1">
                  <Text className="mb-1.5 text-sm text-muted">Last name</Text>
                  <TextInput value={lastName} onChangeText={setLastName} className={inputClassName} />
                </View>
              </View>
              <View>
                <Text className="mb-1.5 text-sm text-muted">Email</Text>
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  className={inputClassName}
                />
              </View>
              <View>
                <Text className="mb-1.5 text-sm text-muted">Password</Text>
                <TextInput
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  className={inputClassName}
                />
              </View>
              <View>
                <Text className="mb-1.5 text-sm text-muted">Confirm password</Text>
                <TextInput
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  className={inputClassName}
                />
              </View>
              <Pressable
                onPress={handleRegister}
                disabled={
                  submitting ||
                  !firstName.trim() ||
                  !lastName.trim() ||
                  !email.trim() ||
                  password.length < 8 ||
                  !confirmPassword
                }
                className="mt-2 items-center rounded-full bg-primary py-3.5 disabled:opacity-60"
              >
                <Text className="font-sans-medium text-sm uppercase tracking-wide text-white">
                  {submitting ? "Creating account…" : "Create Account"}
                </Text>
              </Pressable>
              <Text className="text-xs leading-relaxed text-muted">
                Your personal data will be used to support your experience throughout this app, and
                for other purposes described in our privacy policy.
              </Text>
            </>
          )}
        </View>

        <Pressable onPress={() => router.push("/track-order")} className="mt-8 items-center">
          <View className="flex-row items-center gap-2">
            <User size={14} color={colors.muted} />
            <Text className="text-sm text-muted">Track a guest order instead</Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
