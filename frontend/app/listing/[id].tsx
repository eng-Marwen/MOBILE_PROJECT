import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { API_URL } from "../../config/env";
const placeholder =
  "https://images.unsplash.com/photo-1505691723518-36a1fb0a5c5a?w=1200&q=60&auto=format&fit=crop";

export default function ListingDetailsScreen() {
  const { id, edit } = useLocalSearchParams();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(edit === "true");
  const [formData, setFormData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [owner, setOwner] = useState<any>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/houses/house/${id}`);
        const data = response?.data?.data || null;
        setListing(data);
        if (data?.address) {
          const location = await getCoordinatesFromAddress(data.address);
          if (location) {
            setCoords({
              latitude: location.lat,
              longitude: location.lng,
            });
          }
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch listing data"
        );
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchListing();
  }, [id]);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/houseOwner/${id}`);
        setOwner(response?.data?.data || null);
      } catch (err) {
        console.error("Error fetching owner info:", err);
        setOwner(null);
      }
    };
    if (id) fetchOwner();
  }, [id]);

  useEffect(() => {
    if (listing && editMode) {
      setFormData(listing);
    }
  }, [listing, editMode]);

  const getCoordinatesFromAddress = async (address: string) => {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      address
    )}&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.features && data.features.length > 0) {
      const coords = data.features[0].geometry.coordinates;
      return {
        lat: coords[1],
        lng: coords[0],
      };
    }
    return null;
  };

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await axios.patch(`${API_URL}/houses/${id}`, formData);
      setEditMode(false);
      Alert.alert("Success", "Changes saved successfully!", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/mylistings"),
        },
      ]);
    } catch (err) {
      console.error("Error updating listing:", err);
      Alert.alert("Error", "Could not update listing.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading listing...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>❌ Error</Text>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.center}>
        <Text>Listing not found</Text>
      </View>
    );
  }

  if (editMode && formData) {
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16 }}>
          Edit Listing
        </Text>
        <TextInput
          style={inputStyle}
          value={formData.name}
          onChangeText={(v) => handleChange("name", v)}
          placeholder="Name"
        />
        <TextInput
          style={inputStyle}
          value={formData.description}
          onChangeText={(v) => handleChange("description", v)}
          placeholder="Description"
          multiline
        />
        <TextInput
          style={inputStyle}
          value={formData.address}
          onChangeText={(v) => handleChange("address", v)}
          placeholder="Address"
        />
        {/* Type selection */}
        <View style={{ flexDirection: "row", marginBottom: 12 }}>
          <TouchableOpacity
            style={[
              inputStyle,
              {
                flex: 1,
                backgroundColor:
                  formData.type === "sale" ? "#007AFF22" : "#FFF",
                borderColor: formData.type === "sale" ? "#007AFF" : "#E5E5EA",
                marginRight: 8,
              },
            ]}
            onPress={() => handleChange("type", "sale")}
          >
            <Ionicons name="cash-outline" size={20} color="#27ae60" />
            <Text style={{ marginLeft: 6 }}>Sell</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              inputStyle,
              {
                flex: 1,
                backgroundColor:
                  formData.type === "rent" ? "#007AFF22" : "#FFF",
                borderColor: formData.type === "rent" ? "#007AFF" : "#E5E5EA",
              },
            ]}
            onPress={() => handleChange("type", "rent")}
          >
            <Ionicons name="home-outline" size={20} color="#007AFF" />
            <Text style={{ marginLeft: 6 }}>Rent</Text>
          </TouchableOpacity>
        </View>
        {/* Feature switches */}
        <View style={{ marginBottom: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons
              name="car-outline"
              size={22}
              color={formData.parking ? "#27ae60" : "#888"}
            />
            <Text style={{ marginLeft: 6, marginRight: 6 }}>Parking</Text>
            <Switch
              value={formData.parking}
              onValueChange={(v) => handleChange("parking", v)}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <MaterialCommunityIcons
              name="sofa"
              size={22}
              color={formData.furnished ? "#27ae60" : "#888"}
            />
            <Text style={{ marginLeft: 6, marginRight: 6 }}>Furnished</Text>
            <Switch
              value={formData.furnished}
              onValueChange={(v) => handleChange("furnished", v)}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons
              name="pricetag-outline"
              size={22}
              color={formData.offer ? "#27ae60" : "#888"}
            />
            <Text style={{ marginLeft: 6, marginRight: 6 }}>Offer</Text>
            <Switch
              value={formData.offer}
              onValueChange={(v) => handleChange("offer", v)}
            />
          </View>
        </View>
        {/* Bedrooms & Bathrooms */}
        <View style={{ flexDirection: "row", marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Ionicons name="bed-outline" size={20} color="#007AFF" />
            <TextInput
              style={[inputStyle, { width: 80, marginLeft: 8 }]}
              placeholder="Bedrooms"
              value={formData.bedrooms?.toString()}
              onChangeText={(v) => handleChange("bedrooms", parseInt(v) || 1)}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <MaterialCommunityIcons name="shower" size={20} color="#007AFF" />
            <TextInput
              style={[inputStyle, { width: 80, marginLeft: 8 }]}
              placeholder="Bathrooms"
              value={formData.bathrooms?.toString()}
              onChangeText={(v) => handleChange("bathrooms", parseInt(v) || 1)}
              keyboardType="numeric"
            />
          </View>
        </View>
        {/* Price & Area */}
        <View style={{ flexDirection: "row", marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Ionicons name="cash-outline" size={20} color="#007AFF" />
            <TextInput
              style={[inputStyle, { width: 100, marginLeft: 8 }]}
              placeholder="Regular Price"
              value={formData.regularPrice?.toString()}
              onChangeText={(v) =>
                handleChange("regularPrice", parseInt(v) || 50)
              }
              keyboardType="numeric"
            />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Ionicons name="pricetag-outline" size={20} color="#DB4437" />
            <TextInput
              style={[inputStyle, { width: 100, marginLeft: 8 }]}
              placeholder="Discounted Price"
              value={formData.discountedPrice?.toString()}
              onChangeText={(v) =>
                handleChange("discountedPrice", parseInt(v) || 0)
              }
              keyboardType="numeric"
            />
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <MaterialCommunityIcons
            name="ruler-square"
            size={20}
            color="#007AFF"
          />
          <TextInput
            style={[inputStyle, { width: 100, marginLeft: 8 }]}
            placeholder="Area (m²)"
            value={formData.area?.toString()}
            onChangeText={(v) => handleChange("area", v)}
            keyboardType="numeric"
          />
        </View>
        {/* Save Button */}
        <TouchableOpacity
          style={{
            backgroundColor: "#007AFF",
            padding: 14,
            borderRadius: 10,
            alignItems: "center",
            marginTop: 16,
          }}
          onPress={handleSave}
        >
          <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 16 }}>
            Save Changes
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Gallery */}
      <ScrollView horizontal style={{ marginBottom: 16 }}>
        {(listing.images?.length ? listing.images : [placeholder]).map(
          (img: string, idx: number) => (
            <View
              key={idx}
              style={{
                borderRadius: 16,
                marginRight: 14,
                backgroundColor: "#EEE",
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 8,
                // elevation: 3, // <-- Remove from here
              }}
            >
              <Image
                source={{ uri: img }}
                style={{
                  width: 320,
                  height: 200,
                  borderRadius: 16,
                }}
                resizeMode="cover"
              />
            </View>
          )
        )}
      </ScrollView>

      {/* Details */}
      <Text style={styles.title}>{listing.name}</Text>
      <Text style={styles.address}>
        <Ionicons name="location-outline" size={16} color="#007AFF" />{" "}
        {listing.address}
      </Text>
      <View style={styles.row}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{listing.type?.toUpperCase()}</Text>
        </View>
        {listing.offer && (
          <View style={styles.offerBadge}>
            <Ionicons name="pricetag" size={16} color="#FFF" />
            <Text style={styles.offerBadgeText}>Special Offer</Text>
          </View>
        )}
      </View>
      <View style={styles.priceRow}>
        {listing.offer && listing.discountedPrice > 0 ? (
          <>
            <Text style={styles.oldPrice}>
              ${listing.regularPrice}
              {listing.type === "rent" ? " /month" : ""}
            </Text>
            <Text style={styles.price}>
              ${listing.discountedPrice}
              {listing.type === "rent" ? " /month" : ""}
            </Text>
          </>
        ) : (
          <Text style={styles.price}>
            $
            {listing.discountedPrice > 0
              ? listing.discountedPrice
              : listing.regularPrice}
            {listing.type === "rent" ? " /month" : ""}
          </Text>
        )}
      </View>
      <Text style={styles.date}>
        Posted:{" "}
        {listing.createdAt
          ? new Date(listing.createdAt).toLocaleDateString()
          : ""}
      </Text>

      {/* Features */}
      <View style={styles.features}>
        <View style={styles.featureRow}>
          <Ionicons
            name="bed-outline"
            size={20}
            color={listing.bedrooms > 0 ? "#27ae60" : "#e74c3c"}
          />
          <Text
            style={[
              styles.featureText,
              { color: listing.bedrooms > 0 ? "#27ae60" : "#e74c3c" },
            ]}
          >
            Bedrooms: {listing.bedrooms}
          </Text>
        </View>
        <View style={styles.featureRow}>
          <MaterialCommunityIcons
            name="shower"
            size={20}
            color={listing.bathrooms > 0 ? "#27ae60" : "#e74c3c"}
          />
          <Text
            style={[
              styles.featureText,
              { color: listing.bathrooms > 0 ? "#27ae60" : "#e74c3c" },
            ]}
          >
            Bathrooms: {listing.bathrooms}
          </Text>
        </View>
        <View style={styles.featureRow}>
          <Ionicons
            name="car-outline"
            size={20}
            color={listing.parking ? "#27ae60" : "#e74c3c"}
          />
          <Text
            style={[
              styles.featureText,
              { color: listing.parking ? "#27ae60" : "#e74c3c" },
            ]}
          >
            Parking: {listing.parking ? "Yes" : "No"}
          </Text>
        </View>
        <View style={styles.featureRow}>
          <MaterialCommunityIcons
            name="sofa"
            size={20}
            color={listing.furnished ? "#27ae60" : "#e74c3c"}
          />
          <Text
            style={[
              styles.featureText,
              { color: listing.furnished ? "#27ae60" : "#e74c3c" },
            ]}
          >
            Furnished: {listing.furnished ? "Yes" : "No"}
          </Text>
        </View>
        {listing.area && (
          <View style={styles.featureRow}>
            <MaterialCommunityIcons
              name="ruler-square"
              size={20}
              color="#007AFF"
            />
            <Text style={styles.featureText}>Area: {listing.area} m²</Text>
          </View>
        )}
      </View>

      {/* Description */}
      <Text style={styles.sectionHeader}>Description</Text>
      <Text style={styles.description}>
        {listing.description || "No description provided."}
      </Text>

      {/* Map */}
      {coords && (
        <View
          style={{
            height: 200,
            marginBottom: 16,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: coords.latitude,
                longitude: coords.longitude,
              }}
              title={listing.name}
              description={listing.address}
            />
          </MapView>
        </View>
      )}

      {/* Owner Info */}
      {owner && (
        <View
          style={{
            backgroundColor: "#FFF",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 8,
              color: "#007AFF",
            }}
          >
            Contact Owner
          </Text>
          <Text style={{ fontSize: 15, color: "#333", marginBottom: 4 }}>
            <Ionicons name="person-outline" size={18} color="#007AFF" />{" "}
            {owner.name}
          </Text>
          <Text style={{ fontSize: 15, color: "#333", marginBottom: 4 }}>
            <Ionicons name="mail-outline" size={18} color="#007AFF" />{" "}
            {owner.email}
          </Text>
          {owner.phone && (
            <Text style={{ fontSize: 15, color: "#333", marginBottom: 4 }}>
              <Ionicons name="call-outline" size={18} color="#007AFF" />{" "}
              {owner.phone}
            </Text>
          )}
          {/* You can add a button to send email or call if you want */}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F5F5F5" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  image: { width: 300, height: 180, borderRadius: 12, marginRight: 12 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 4, color: "#222" },
  address: { fontSize: 16, color: "#666", marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  type: { fontSize: 14, fontWeight: "bold", color: "#007AFF", marginRight: 8 },
  offer: { fontSize: 14, fontWeight: "bold", color: "#DB4437", marginRight: 8 },
  priceRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  oldPrice: {
    fontSize: 18,
    color: "#888",
    textDecorationLine: "line-through",
    marginRight: 8,
  },
  price: { fontSize: 26, fontWeight: "bold", color: "#007AFF" },
  date: { fontSize: 12, color: "#888", marginBottom: 12 },
  features: { marginBottom: 12, marginTop: 8 },
  featureRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  featureText: { marginLeft: 8, fontSize: 16, fontWeight: "bold" },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#007AFF",
    marginTop: 12,
  },
  description: { fontSize: 16, color: "#333", marginBottom: 16 },
  badge: {
    backgroundColor: "#007AFF22",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  badgeText: {
    color: "#007AFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  offerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DB4437",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  offerBadgeText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 13,
    marginLeft: 4,
  },
});

// Add a simple input style
const inputStyle = {
  backgroundColor: "#FFF",
  padding: 12,
  borderRadius: 10,
  marginBottom: 12,
  fontSize: 16,
  borderWidth: 1,
  borderColor: "#E5E5EA",
};
