import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api";

console.log("🔧 API URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    console.log("📤 API Request:", config.method?.toUpperCase(), config.url);
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.error("❌ API Error:", error.message);
    console.error("📍 URL:", error.config?.url);
    console.error("📊 Status:", error.response?.status);

    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/signin", { email, password }); // Changed to /signin
  if (response.data.token) {
    await AsyncStorage.setItem("token", response.data.token);
    await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
  }
  return response.data;
};

// Update the register function
export const register = async (
  name: string,
  email: string,
  password: string
) => {
  // Backend expects username, so we'll use the name as username or generate from email
  const username =
    name.toLowerCase().replace(/\s+/g, "") || email.split("@")[0];

  const response = await api.post("/auth/signup", {
    username, // Add username
    name, // Keep name
    email,
    password,
  });

  if (response.data.token) {
    await AsyncStorage.setItem("token", response.data.token);
    const user = response.data.user || response.data.data;
    if (user) {
      await AsyncStorage.setItem("user", JSON.stringify(user));
    }
  }
  return response.data;
};

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } finally {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
  }
};

export const getCurrentUser = async () => {
  try {
    const userStr = await AsyncStorage.getItem("user");
    if (!userStr) return null;

    // Verify token is still valid using check-auth
    const response = await api.get("/auth/check-auth");
    return response.data.user;
  } catch (error) {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    return null;
  }
};

// Property APIs
export const getLatestProperties = async () => {
  const response = await api.get("/houses");
  console.log("📦 Latest Properties Response:", response.data);

  // Handle different response formats
  const houses =
    Array.isArray(response.data) ||
    response.data.houses ||
    response.data.data ||
    [];

  return houses.slice(0, 5);
};

export const getProperties = async ({
  filter,
  query,
  limit,
}: {
  filter?: string;
  query?: string;
  limit?: number;
}) => {
  const params: any = {};
  if (filter && filter !== "All") params.type = filter;
  if (query) params.search = query;
  if (limit) params.limit = limit;

  const response = await api.get("/houses", { params });
  console.log("📦 Properties Response:", response.data);

  // Handle different response formats
  const houses =
    Array.isArray(response.data) ||
    response.data.houses ||
    response.data.data ||
    [];

  return houses;
};

export const getPropertyById = async ({ id }: { id: string }) => {
  const response = await api.get(`/houses/house/${id}`);
  console.log("📦 Property By ID Response:", response.data);

  // Handle different response formats
  return response.data.house || response.data.data || response.data;
};

// Update profile
export const updateProfile = async (data: {
  name?: string;
  avatar?: string;
  address?: string;
  phone?: string;
}) => {
  const response = await api.patch("/auth/update-profile", data);
  if (response.data.user || response.data.data) {
    const updatedUser = response.data.user || response.data.data;
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
  }
  return response.data;
};

// Delete account
export const deleteAccount = async () => {
  await api.delete("/auth/delete");
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("user");
};

// Get user's houses
export const getUserHouses = async (userId: string) => {
  const response = await api.get(`/houses/${userId}`);
  return response.data.data || response.data;
};

// Delete house
export const deleteHouse = async (houseId: string) => {
  const response = await api.delete(`/houses/${houseId}`);
  return response.data;
};

// Google Auth
export const googleAuth = async (userData: {
  username: string;
  email: string;
  avatar: string;
}) => {
  const response = await api.post("/auth/google", userData);
  if (response.data.token) {
    await AsyncStorage.setItem("token", response.data.token);
    const user = response.data.user || response.data.data;
    if (user) {
      await AsyncStorage.setItem("user", JSON.stringify(user));
    }
  }
  return response.data;
};

export default api;
