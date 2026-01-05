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
import image from "../../assets/image.png";
import image2 from "../../assets/image2.png";
import { api } from "../../services/api";



const ListingCard = ({
  listing,
  onPress,
}: {
  listing: any;
  onPress: () => void;
}) => {
  const img = listing?.images?.[0] ? { uri: listing.images[0] } : image2;
  const discountPercent =
    listing?.discountedPrice > 0 && listing?.regularPrice
      ? Math.round(
          ((listing.regularPrice - listing.discountedPrice) /
            listing.regularPrice) *
            100
        )
      : null;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.cardImageContainer}>
        {listing?.offer && (
          <View style={styles.offerBadge}>
            <Text style={styles.offerBadgeText}>
              {discountPercent ? `${discountPercent}% OFF` : "Special Offer"}
            </Text>
          </View>
        )}
        <Image source={img} style={styles.cardImage} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {listing.name}
        </Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          {listing.location || listing.address || listing.type}
        </Text>
        <Text style={styles.cardPrice}>
          $
          {listing.discountedPrice > 0
            ? listing.discountedPrice
            : listing.regularPrice}
        </Text>
        <Text style={styles.cardType}>{listing.type}</Text>
        {/* Feature icons */}
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
  );
};

export default function HomeScreen() {
  const [offerListings, setOfferListings] = useState<any[]>([]);
  const [saleListings, setSaleListings] = useState<any[]>([]);
  const [rentListings, setRentListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const offerRes = await api.get("/houses?offer=true");
        const saleRes = await api.get("/houses?type=sale");
        const rentRes = await api.get("/houses?type=rent");
        setOfferListings(offerRes?.data || []);
        setSaleListings(saleRes?.data || []);
        setRentListings(rentRes?.data || []);
      } catch (err) {
        // Optionally show an error message
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading listings...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.appHeader}>
        <Image source={image} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appName}>
          <Text style={{ color: "#757575ff", fontWeight: "bold" }}>Samsar</Text>
          <Text style={{ color: "#b82114ff", fontWeight: "bold" }}>ProMax</Text>
        </Text>
      </View>
      <Text style={styles.title}>
        Find your next perfect home
      </Text>
      <Text style={styles.subtitle}>
        Browse handpicked listings, save favorites and contact owners.
      </Text>

      {/* Offers */}
      {offerListings.length > 0 && (
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 24,
              marginBottom: 8,
            }}
          >
            <Ionicons
              name="pricetag"
              size={22}
              color="#DB4437"
              style={{ marginRight: 10, marginBottom: -2 }}
            />
            <Text
              style={[
                styles.sectionHeader,
                {
                  color: "#DB4437",
                  fontWeight: "bold",
                  fontSize: 22,
                },
              ]}
            >
              Special Offers
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {offerListings.map((listing) => (
              <ListingCard
                key={listing._id}
                listing={listing}
                onPress={() => router.push(`/listing/${listing._id}` as any)}
              />
            ))}
          </ScrollView>
        </>
      )}

      {/* Sale Listings */}
      {saleListings.length > 0 && (
        <>
          <Text
            style={[
              styles.sectionHeader,
              { color: "#111", fontWeight: "bold", fontSize: 22 },
            ]}
          >
            Homes for Sale
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {saleListings.slice(0, 6).map((listing) => (
              <ListingCard
                key={listing._id}
                listing={listing}
                onPress={() => router.push(`/listing/${listing._id}` as any)}
              />
            ))}
          </ScrollView>
        </>
      )}

      {/* Rent Listings */}
      {rentListings.length > 0 && (
        <>
          <Text
            style={[
              styles.sectionHeader,
              { color: "#111", fontWeight: "bold", fontSize: 22 },
            ]}
          >
            Rentals
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {rentListings.slice(0, 6).map((listing) => (
              <ListingCard
                key={listing._id}
                listing={listing}
                onPress={() => router.push(`/listing/${listing._id}` as any)}
              />
            ))}
          </ScrollView>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 8,
    color: "#007AFF",
  },
  horizontalScroll: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginRight: 12,
    width: 220,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  cardImageContainer: {
    position: "relative",
    width: "100%",
    height: 120,
    backgroundColor: "#EEE",
  },
  cardImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  offerBadge: {
    position: "absolute",
    left: 8,
    top: 8,
    backgroundColor: "#DB4437",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 10,
  },
  offerBadgeText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 2,
  },
  cardType: {
    fontSize: 12,
    color: "#888",
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  iconItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconText: {
    fontSize: 12,
    color: "#222",
    marginLeft: 4,
  },

  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  appName: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#222",
    letterSpacing: 1,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
});
