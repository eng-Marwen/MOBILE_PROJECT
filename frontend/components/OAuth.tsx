import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity } from "react-native";

import icons from "@/constants/icons";
import { googleAuth } from "@/lib/api";
import { useGlobalContext } from "@/lib/global-provider";
import { router } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

const OAuth = () => {
  const { refetch } = useGlobalContext();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:
      "888464910716-sktec2bvshrcfb3hms38a07fvihhfks3.apps.googleusercontent.com",
    // Remove expoClientId, use only webClientId
  });

  const handleGoogleAuth = useCallback(
    async (token: string | undefined) => {
      if (!token) return;

      try {
        // Fetch user info from Google
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/userinfo/v2/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const userInfo = await userInfoResponse.json();

        console.log("📱 Google User Info:", userInfo);

        // Send to your backend
        await googleAuth({
          username:
            userInfo.name?.toLowerCase().replace(/\s+/g, "") ||
            userInfo.email.split("@")[0],
          email: userInfo.email,
          avatar: userInfo.picture || "",
        });

        Alert.alert("Success", "Signed in with Google!");
        await refetch();
        router.replace("/(root)/(tabs)");
      } catch (error: any) {
        console.error("❌ Google Auth Error:", error);
        Alert.alert(
          "Error",
          error.response?.data?.message || "Google sign-in failed"
        );
      }
    },
    [refetch]
  );

  React.useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      handleGoogleAuth(authentication?.accessToken);
    }
  }, [response, handleGoogleAuth]);

  const handlePress = () => {
    promptAsync();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.googleButton}
      disabled={!request}
    >
      <Image source={icons.google} style={styles.googleIcon} />
      <Text style={styles.googleButtonText}>Continue with Google</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DB4437",
    borderRadius: 25,
    paddingVertical: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleIcon: {
    width: 24,
    height: 24,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});

export default OAuth;
