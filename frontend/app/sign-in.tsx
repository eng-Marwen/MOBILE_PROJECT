import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import OAuth from "@/components/OAuth";
import images from "@/constants/images";
import { login } from "@/lib/api";
import { useGlobalContext } from "@/lib/global-provider";

const SignIn = () => {
  const { refetch } = useGlobalContext();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(form.email, form.password);
      Alert.alert("Success", "Logged in successfully");
      await refetch();
      router.replace("/(root)/(tabs)");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={images.onboarding}
          style={styles.image}
          resizeMode="contain"
        />

        <View style={styles.content}>
          <Text style={styles.welcomeText}>WELCOME TO REAL SCOUT</Text>

          <Text style={styles.titleText}>
            Lets Get You Closer To {"\n"}
            <Text style={styles.highlightText}>Your Ideal Home</Text>
          </Text>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.labelText}>Email</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.labelText}>Password</Text>
              <TextInput
                style={styles.input}
                value={form.password}
                onChangeText={(text) => setForm({ ...form, password: text })}
                placeholder="Your password"
                secureTextEntry
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSignIn}
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign-In Button */}
          <OAuth />

          {/* Forgot Password Link */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
          </TouchableOpacity>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Sign Up Link */}
          <View style={styles.signUpSection}>
            <Text style={styles.signUpText}>Dont have an account yet?</Text>
            <TouchableOpacity
              onPress={() => router.push("/sign-up")}
              style={styles.signUpButton}
            >
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40, // Add this to ensure bottom content is visible
  },
  image: {
    width: "100%",
    height: "10%", // Reduced from 45% to give more space below
  },
  content: {
    paddingHorizontal: 40,
    flex: 1,
    paddingBottom: 30, // Add bottom padding
  },
  welcomeText: {
    fontSize: 14,
    textAlign: "center",
    textTransform: "uppercase",
    color: "#666",
    marginBottom: 10,
    letterSpacing: 1,
  },
  titleText: {
    fontSize: 26, // Reduced from 28
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginTop: 8,
  },
  highlightText: {
    color: "#0061FF",
  },
  formContainer: {
    marginTop: 16, // Reduced from 20
  },
  inputGroup: {
    marginBottom: 12, // Reduced from 16
  },
  labelText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f7f7f7",
    borderRadius: 25,
    paddingVertical: 12, // Reduced from 14
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#0061FF",
    borderRadius: 25,
    paddingVertical: 14, // Reduced from 16
    marginTop: 16, // Reduced from 20
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20, // Reduced from 24
    marginBottom: 12, // Reduced from 16
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    color: "#666",
    fontSize: 14,
    paddingHorizontal: 12,
  },
  forgotPassword: {
    alignItems: "center",
    marginTop: 16, // Reduced from 20
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#0061FF",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  separator: {
    marginTop: 20, // Reduced from 30
    marginBottom: 16, // Reduced from 20
  },
  signUpSection: {
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    padding: 20,
    borderRadius: 12,
    marginBottom: 30, // Increased from 20 to ensure visibility
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  signUpText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 12,
  },
  signUpButton: {
    backgroundColor: "#0061FF",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  signUpButtonText: {
    fontSize: 15,
    color: "white",
    fontWeight: "700",
  },
});

export default SignIn;
