import { Property } from "@/types";
import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";
import {
  Account,
  Avatars,
  Client,
  Databases,
  OAuthProvider,
  Query,
  Storage,
} from "react-native-appwrite";

console.log("🔧 Environment check:", {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
});

export const config = {
  platform: "com.marwen.realetate",
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  galleriesCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID,
  reviewsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID,
  agentsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID,
  propertiesCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID,
};

export const client = new Client();
client
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform!);

export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export async function login() {
  try {
    console.log("📱 Config:", {
      endpoint: config.endpoint,
      projectId: config.projectId,
      platform: config.platform,
    });

    const redirectUri = Linking.createURL("/");
    console.log("🔗 Redirect URI:", redirectUri);

    const response = await account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUri
    );
    console.log("🌐 OAuth2 Token Response:", response);

    if (!response) {
      console.error("❌ Create OAuth2 token failed - no response");
      throw new Error("Create OAuth2 token failed");
    }

    console.log("🌐 Opening browser with URL:", response.toString());
    const browserResult = await openAuthSessionAsync(
      response.toString(),
      redirectUri
    );
    console.log("🌐 Browser result:", browserResult);

    if (browserResult.type !== "success") {
      console.error("❌ Browser auth failed:", browserResult.type);
      throw new Error("Create OAuth2 token failed");
    }

    const url = new URL(browserResult.url);
    const secret = url.searchParams.get("secret")?.toString();
    const userId = url.searchParams.get("userId")?.toString();

    console.log("🔑 Extracted params:", {
      userId,
      secret: secret ? "exists" : "missing",
    });

    if (!secret || !userId) {
      console.error("❌ Missing secret or userId");
      throw new Error("Create OAuth2 token failed");
    }

    console.log("🔐 Creating session...");
    const session = await account.createSession(userId, secret);
    console.log("✅ Session created:", session);

    if (!session) {
      console.error("❌ Failed to create session");
      throw new Error("Failed to create session");
    }

    return true;
  } catch (error) {
    console.error("💥 Login error:", error);
    return false;
  }
}

export async function logout() {
  try {
    const result = await account.deleteSession("current");
    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const result = await account.get();
    if (result.$id) {
      // Create avatar URL with project parameter
      const avatarUrl = `${config.endpoint}/avatars/initials?name=${encodeURIComponent(result.name)}&width=176&height=176&project=${config.projectId}`;

      console.log("🔍 Generated avatar URL:", avatarUrl);

      return {
        ...result,
        avatar: avatarUrl,
      };
    }

    return null;
  } catch (error: any) {
    if (error.code === 401 || error.message?.includes("guests")) {
      console.log("No user logged in");
      return null;
    }
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function getLatestProperties(): Promise<Property[]> {
  try {
    const result = await databases.listDocuments(
      config.databaseId!,
      config.propertiesCollectionId!,
      [Query.orderDesc("$createdAt"), Query.limit(5)]
    );

    return result.documents as unknown as Property[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getProperties({
  filter,
  query,
  limit,
}: {
  filter: string;
  query: string;
  limit?: number;
}): Promise<Property[]> {
  try {
    const buildQuery = [Query.orderDesc("$createdAt")];

    if (filter && filter !== "All")
      buildQuery.push(Query.equal("type", filter));

    if (query)
      buildQuery.push(
        Query.or([
          Query.search("name", query),
          Query.search("address", query),
          Query.search("type", query),
        ])
      );

    if (limit) buildQuery.push(Query.limit(limit));

    const result = await databases.listDocuments(
      config.databaseId!,
      config.propertiesCollectionId!,
      buildQuery
    );

    return result.documents as unknown as Property[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getPropertyById({
  id,
}: {
  id: string;
}): Promise<Property | null> {
  try {
    const result = await databases.getDocument(
      config.databaseId!,
      config.propertiesCollectionId!,
      id
    );
    return result as unknown as Property;
  } catch (error) {
    console.error(error);
    return null;
  }
}
