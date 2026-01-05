import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../services/api";

const initialFilters = {
  searchTerm: "",
  type: "all",
  offer: false,
  parking: false,
  furnished: false,
  sortOrder: "createdAt",
  order: "desc",
};

const placeholder =
  "https://images.unsplash.com/photo-1505691723518-36a1fb0a5c5a?w=1200&q=60&auto=format&fit=crop";

export default function ExploreScreen() {
  const [filters, setFilters] = useState(initialFilters);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = [];
        if (filters.searchTerm) params.push(`search=${filters.searchTerm}`);
        if (filters.type && filters.type !== "all")
          params.push(`type=${filters.type}`);
        if (filters.offer) params.push(`offer=true`);
        if (filters.parking) params.push(`parking=true`);
        if (filters.furnished) params.push(`furnished=true`);
        if (filters.sortOrder) params.push(`sort=${filters.sortOrder}`);
        if (filters.order) params.push(`order=${filters.order}`);
        const query = params.length ? `?${params.join("&")}` : "";
        const response = await api.get(`/houses${query}`);
        setListings(response?.data || []);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [filters]);

  const handleChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Explore Listings</Text>
      <Text style={styles.subtitle}>Discover new houses</Text>

      {/* Search and Filters */}
      <View style={styles.filters}>
        <TextInput
          style={styles.input}
          placeholder="Search by name, address..."
          value={filters.searchTerm}
          onChangeText={(v) => handleChange("searchTerm", v)}
        />

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.chip, filters.type === "all" && styles.chipActive]}
            onPress={() => handleChange("type", "all")}
          >
            <Text>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, filters.type === "rent" && styles.chipActive]}
            onPress={() => handleChange("type", "rent")}
          >
            <Text>Rent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, filters.type === "sale" && styles.chipActive]}
            onPress={() => handleChange("type", "sale")}
          >
            <Text>Sale</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.chip, filters.parking && styles.chipActive]}
            onPress={() => handleChange("parking", !filters.parking)}
          >
            <Ionicons name="car-outline" size={18} color="#007AFF" />
            <Text style={{ marginLeft: 4 }}>Parking</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, filters.furnished && styles.chipActive]}
            onPress={() => handleChange("furnished", !filters.furnished)}
          >
            <Ionicons name="bed-outline" size={18} color="#007AFF" />
            <Text style={{ marginLeft: 4 }}>Furnished</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, filters.offer && styles.chipActive]}
            onPress={() => handleChange("offer", !filters.offer)}
          >
            <Ionicons name="pricetag-outline" size={18} color="#007AFF" />
            <Text style={{ marginLeft: 4 }}>Offer</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results */}
      <Text style={styles.resultsTitle}>
        {loading
          ? "Searching..."
          : `${listings.length} result${listings.length !== 1 ? "s" : ""}`}
      </Text>
      {loading && (
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={{ marginTop: 24 }}
        />
      )}
      {!loading && listings.length === 0 && (
        <Text style={styles.noResults}>No results found</Text>
      )}
      <View style={styles.listingsGrid}>
        {listings.map((listing) => (
          <TouchableOpacity
            key={listing._id}
            style={styles.card}
            onPress={() => router.push(`/listing/${listing._id}`)}
            activeOpacity={0.85}
          >
            <View style={styles.cardImageContainer}>
              <Image
                source={{ uri: listing.images?.[0] || placeholder }}
                style={styles.cardImage}
              />
              {listing.offer && (
                <View style={styles.offerBadge}>
                  <Text style={styles.offerBadgeText}>Offer</Text>
                </View>
              )}
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {listing.name}
              </Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>
                {listing.address}
              </Text>
              <Text style={styles.cardPrice}>
                $
                {listing.discountedPrice > 0
                  ? listing.discountedPrice
                  : listing.regularPrice}
              </Text>
              <Text style={styles.cardType}>{listing.type}</Text>
              {/* Icons row */}
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
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F5F5F5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 16 },
  filters: { marginBottom: 16 },
  input: {
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    marginBottom: 8,
    fontSize: 16,
  },
  filterRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: "#007AFF22",
    borderColor: "#007AFF",
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#007AFF",
  },
  noResults: {
    fontSize: 16,
    color: "#888",
    marginTop: 24,
    textAlign: "center",
  },
  listingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 18,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
    overflow: "hidden",
  },
  cardImageContainer: {
    width: "100%",
    height: 180,
    backgroundColor: "#EEE",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  offerBadge: {
    position: "absolute",
    left: 12,
    top: 12,
    backgroundColor: "#DB4437",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 10,
  },
  offerBadgeText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 6,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 2,
  },
  cardType: {
    fontSize: 13,
    color: "#888",
  },
  iconRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 16,
  },
  iconItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  iconText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
});
