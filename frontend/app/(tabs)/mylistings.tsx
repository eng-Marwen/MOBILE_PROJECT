import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import image2 from "../../assets/image2.png";
import { api } from "../../services/api";
import { useAppSelector } from "../../store/hooks";

export default function MyListingsScreen() {
  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      if (!user?._id) return;
      setLoading(true);
      try {
        const response = await api.get(`/houses/${user._id}`);
        setListings(response?.data || []);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user?._id) return;
    try {
      await api.delete(`/houses/${id}/${user._id}`);
      setListings((prev) => prev.filter((listing) => listing._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user?._id) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Sign in to view your listings</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Listings</Text>
      {loading && <ActivityIndicator size="large" color="#007AFF" />}
      {!loading && listings.length === 0 && (
        <Text style={styles.subtitle}>No listings found.</Text>
      )}
      {listings.map((listing) => (
        <TouchableOpacity
          key={listing._id}
          style={styles.card}
          onPress={() => router.push(`/listing/${listing._id}`)}
          activeOpacity={0.85}
        >
          <Image
            source={listing.images?.[0] ? { uri: listing.images[0] } : image2}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{listing.name}</Text>
            <Text style={styles.cardSubtitle}>{listing.address}</Text>
            <Text style={styles.cardPrice}>
              $
              {listing.discountedPrice > 0
                ? listing.discountedPrice
                : listing.regularPrice}
            </Text>
            <Text style={styles.cardType}>{listing.type}</Text>
            {/* Feature icons row */}
            <View style={styles.iconRow}>
              <View style={styles.iconItem}>
                <Ionicons
                  name="bed-outline"
                  size={18}
                  color={listing.bedrooms > 0 ? "#27ae60" : "#e74c3c"}
                />
                <Text
                  style={[
                    styles.iconText,
                    { color: listing.bedrooms > 0 ? "#27ae60" : "#e74c3c" },
                  ]}
                >
                  {listing.bedrooms}
                </Text>
              </View>
              <View style={styles.iconItem}>
                <MaterialCommunityIcons
                  name="shower"
                  size={18}
                  color={listing.bathrooms > 0 ? "#27ae60" : "#e74c3c"}
                />
                <Text
                  style={[
                    styles.iconText,
                    { color: listing.bathrooms > 0 ? "#27ae60" : "#e74c3c" },
                  ]}
                >
                  {listing.bathrooms}
                </Text>
              </View>
              <View style={styles.iconItem}>
                <Ionicons
                  name="car-outline"
                  size={18}
                  color={listing.parking ? "#27ae60" : "#e74c3c"}
                />
                <Text
                  style={[
                    styles.iconText,
                    { color: listing.parking ? "#27ae60" : "#e74c3c" },
                  ]}
                >
                  {listing.parking ? "✓" : "✗"}
                </Text>
              </View>
              <View style={styles.iconItem}>
                <MaterialCommunityIcons
                  name="sofa"
                  size={18}
                  color={listing.furnished ? "#27ae60" : "#e74c3c"}
                />
                <Text
                  style={[
                    styles.iconText,
                    { color: listing.furnished ? "#27ae60" : "#e74c3c" },
                  ]}
                >
                  {listing.furnished ? "✓" : "✗"}
                </Text>
              </View>
            </View>
            {/* Actions row */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push(`/listing/${listing._id}?edit=true`)}
              >
                <Ionicons name="create-outline" size={18} color="#FFF" />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(listing._id)}
              >
                <Ionicons name="trash-outline" size={18} color="#FFF" />
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F5F5F5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 16, color: "#222" },
  subtitle: { fontSize: 16, color: "#888", marginBottom: 12 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 22,
    marginBottom: 22,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    minHeight: 140,
  },
  cardImage: {
    width: 120,
    height: 120,
    borderRadius: 18,
    margin: 10,
    backgroundColor: "#EEE",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  cardContent: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  cardTitle: { fontSize: 20, fontWeight: "bold", color: "#222" },
  cardSubtitle: { fontSize: 15, color: "#666", marginBottom: 6 },
  cardPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 2,
  },
  cardType: { fontSize: 13, color: "#888" },
  iconRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 16,
  },
  iconItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconText: {
    fontSize: 14,
    marginLeft: 4,
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "space-between",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 2,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e74c3c",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 2,
  },
  actionText: {
    color: "#FFF",
    fontSize: 14,
    marginLeft: 4,
  },
});
