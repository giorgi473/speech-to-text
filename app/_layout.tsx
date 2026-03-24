import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.safe}>
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
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
});
