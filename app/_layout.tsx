import { Stack } from "expo-router";
import "../global.css";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { RecordProvider } from "@/context/RecordContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";

function RootLayoutContent() {
  const { isDark } = useTheme();

  return (
    <View style={styles.safe}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <RecordProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="history"
            options={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          />
        </Stack>
      </RecordProvider>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
});

