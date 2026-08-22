import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { User } from "lucide-react-native";
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

// Shared by the "Sign In with phone" toggle and the Sign Up tab — sign-up
// is phone-only, so both paths funnel through the same request-code /
// verify-code flow. Whether name fields are needed is only known after
// requesting the code (the phone might already belong to an account).
function PhoneOtpFlow({ onSuccess }: { onSuccess: () => void }) {
  const { requestOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestCode = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const result = await requestOtp(phone.trim());
      setIsNewUser(result.isNewUser);
      // Non-production only — the API skips Twilio and hands the code back
      // directly so the flow can be tested without a live SMS account.
      setDevOtp(result.devOtp ?? null);
      setCode(result.devOtp ?? "");
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send a code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await verifyOtp(
        phone.trim(),
        code.trim(),
        isNewUser ? { firstName: firstName.trim(), lastName: lastName.trim() } : undefined
      );
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't verify that code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "phone") {
    return (
      <View className="flex flex-col gap-4">
        <View>
          <Text className="mb-1.5 text-sm text-muted">Mobile number</Text>
          <TextInput
            placeholder="10-digit mobile number"
            placeholderTextColor={colors.muted}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            className={inputClassName}
          />
        </View>
        {error && (
          <Text className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm text-primary">
            {error}
          </Text>
        )}
        <Pressable
          onPress={handleRequestCode}
          disabled={submitting || !phone.trim()}
          className="mt-2 items-center rounded-full bg-primary py-3.5 disabled:opacity-60"
        >
          <Text className="font-sans-medium text-sm uppercase tracking-wide text-white">
            {submitting ? "Sending code…" : "Send Code"}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex flex-col gap-4">
      <Text className="text-sm text-muted">
        We sent a 6-digit code to <Text className="text-ink">{phone}</Text>.{" "}
        <Text
          className="text-primary"
          onPress={() => {
            setStep("phone");
            setError(null);
          }}
        >
          Change number
        </Text>
      </Text>
      {devOtp && (
        <Text className="rounded-xl border border-dashed border-line bg-cream px-4 py-2.5 text-sm text-muted">
          Dev mode — no SMS was sent. Your code is <Text className="text-ink">{devOtp}</Text>.
        </Text>
      )}
      {isNewUser && (
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
      )}
      <View>
        <Text className="mb-1.5 text-sm text-muted">6-digit code</Text>
        <TextInput
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={setCode}
          className={inputClassName}
        />
      </View>
      {error && (
        <Text className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm text-primary">
          {error}
        </Text>
      )}
      <Pressable
        onPress={handleVerifyCode}
        disabled={submitting || !code.trim() || (isNewUser && (!firstName.trim() || !lastName.trim()))}
        className="mt-2 items-center rounded-full bg-primary py-3.5 disabled:opacity-60"
      >
        <Text className="font-sans-medium text-sm uppercase tracking-wide text-white">
          {submitting ? "Verifying…" : isNewUser ? "Verify & Create Account" : "Verify & Sign In"}
        </Text>
      </Pressable>
    </View>
  );
}

export default function AccountScreen() {
  const { user, isLoading, login, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [signInMethod, setSignInMethod] = useState<"password" | "phone">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
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

        {tab === "signin" ? (
          signInMethod === "password" ? (
            <View className="flex flex-col gap-4">
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
              <Pressable onPress={() => setSignInMethod("phone")} className="self-end">
                <Text className="text-sm text-primary">Sign in with phone instead</Text>
              </Pressable>
              <Pressable
                onPress={handleSignIn}
                disabled={submitting || !email.trim() || !password}
                className="mt-2 items-center rounded-full bg-primary py-3.5 disabled:opacity-60"
              >
                <Text className="font-sans-medium text-sm uppercase tracking-wide text-white">
                  {submitting ? "Signing in…" : "Login"}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="flex flex-col gap-4">
              <PhoneOtpFlow key="signin" onSuccess={() => undefined} />
              <Pressable onPress={() => setSignInMethod("password")}>
                <Text className="text-center text-sm text-primary">Use email &amp; password instead</Text>
              </Pressable>
            </View>
          )
        ) : (
          <View className="flex flex-col gap-4">
            <PhoneOtpFlow key="register" onSuccess={() => undefined} />
            <Text className="text-xs leading-relaxed text-muted">
              Your personal data will be used to support your experience throughout this app, and
              for other purposes described in our privacy policy.
            </Text>
          </View>
        )}

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
