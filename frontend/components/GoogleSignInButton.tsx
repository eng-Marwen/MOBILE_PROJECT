import { Ionicons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { authService } from "../services/authService";
import { setUser } from "../store/authSlice";
import { useAppDispatch } from "../store/hooks";

WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client ID - Only use Web Client ID with Expo proxy
const GOOGLE_WEB_CLIENT_ID =
  "888464910716-rgu1ua9rdojpg86tmopkmuuo5483mtk0.apps.googleusercontent.com";

export default function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Use Expo's auth proxy
  const redirectUri = "https://auth.expo.io/@anonymous/front";

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri: redirectUri,
  });

  useEffect(() => {
    console.log("Platform:", Platform.OS);
    console.log("Request ready:", !!request);
    if (request) {
      console.log("Redirect URI:", request.redirectUri);
      console.log("Client ID:", request.clientId);
    }
  }, [request]);

  useEffect(() => {
    console.log("Response type:", response?.type);

    if (response?.type === "success") {
      console.log("OAuth success - ID token received");
      const idToken = response.params.id_token;
      handleGoogleSignIn(idToken);
    } else if (response?.type === "error") {
      console.error("OAuth error:", response.error);
      console.error("OAuth params:", response.params);
      Alert.alert(
        "Authentication Error",
        response.error?.message || "Failed to authenticate"
      );
    } else if (response?.type === "dismiss" || response?.type === "cancel") {
      console.log("User cancelled authentication");
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken?: string) => {
    if (!idToken) {
      console.log("No ID token provided");
      return;
    }

    setLoading(true);
    try {
      console.log("Decoding ID token to get user info...");

      // Decode the ID token to get user info
      const base64Url = idToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const userInfo = JSON.parse(jsonPayload);
      console.log("User info received:", userInfo.email);

      // Send to your backend
      const googleData = {
        username: userInfo.name || userInfo.email.split("@")[0],
        email: userInfo.email,
        avatar: userInfo.picture || "",
      };

      console.log("Sending to backend...");
      const authResponse = await authService.googleAuth(googleData);

      if (authResponse.data) {
        console.log("Backend auth successful");
        dispatch(setUser(authResponse.data));
        Alert.alert("Success", "Signed in with Google successfully!");
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      console.error("Google sign in error:", error);
      Alert.alert("Error", error.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={async () => {
        console.log("Google sign in button pressed");
        console.log("Request exists:", !!request);
        if (request) {
          try {
            const result = await promptAsync();
            console.log("Prompt result:", result.type);
          } catch (error) {
            console.error("Prompt error:", error);
          }
        } else {
          console.log("Request not ready yet");
        }
      }}
      disabled={!request || loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <>
          <Ionicons name="logo-google" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Continue with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#DB4437",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
