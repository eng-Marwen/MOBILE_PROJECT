import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  deleteAccount,
  deleteHouse,
  getUserHouses,
  logout,
  updateProfile,
} from "@/lib/api";
import { useGlobalContext } from "@/lib/global-provider";

import { settings } from "@/constants/data";
import icons from "@/constants/icons";

interface SettingsItemProp {
  icon: any;
  title: string;
  onPress?: () => void;
  textStyle?: string;
  showArrow?: boolean;
}

const SettingsItem = ({
  icon,
  title,
  onPress,
  textStyle,
  showArrow = true,
}: SettingsItemProp) => (
  <TouchableOpacity onPress={onPress} style={styles.settingsItem}>
    <View style={styles.settingsItemLeft}>
      <Image source={icon} style={styles.settingsIcon} />
      <Text style={[styles.settingsText, textStyle && { color: textStyle }]}>
        {title}
      </Text>
    </View>
    {showArrow && <Image source={icons.rightArrow} style={styles.arrowIcon} />}
  </TouchableOpacity>
);

const Profile = () => {
  const { user, refetch } = useGlobalContext();
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    address: "",
    phone: "",
  });
  const [avatarUri, setAvatarUri] = useState(user?.avatar || "");
  const [userListings, setUserListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [showListings, setShowListings] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        address: user.address || "",
        phone: user.phone || "",
      });
      setAvatarUri(user.avatar || "");
    }
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant camera roll permissions");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleUpdateProfile = async () => {
    setUploading(true);
    try {
      // In a real app, you'd upload the image to Cloudinary first
      // For now, we'll use the URI directly
      await updateProfile({
        name: formData.name,
        avatar: avatarUri,
        address: formData.address,
        phone: formData.phone,
      });

      Alert.alert("Success", "Profile updated successfully");
      await refetch();
      setShowEditModal(false);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Update failed");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            await refetch();
            router.replace("/sign-in");
          } catch (error) {
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount();
              await refetch();
              router.replace("/sign-in");
            } catch (error) {
              Alert.alert("Error", "Failed to delete account");
            }
          },
        },
      ]
    );
  };

  const handleShowListings = async () => {
    if (!user?._id) return;

    setLoadingListings(true);
    try {
      const listings = await getUserHouses(user._id);
      setUserListings(listings);
      setShowListings(true);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to load listings"
      );
    } finally {
      setLoadingListings(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    Alert.alert("Delete Listing", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteHouse(listingId);
            setUserListings((prev) =>
              prev.filter((l: any) => l._id !== listingId)
            );
            Alert.alert("Success", "Listing deleted");
          } catch (error) {
            Alert.alert("Error", "Failed to delete listing");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Image source={icons.bell} style={styles.bellIcon} />
        </View>

        <View style={styles.profileSection}>
          <View style={styles.profileContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarPlaceholderText}>
                  {user?.name?.charAt(0)?.toUpperCase() || "?"}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setShowEditModal(true)}
            >
              <Image source={icons.edit} style={styles.editIcon} />
            </TouchableOpacity>

            <Text style={styles.userName}>{user?.name || "User"}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userListings.length}</Text>
                <Text style={styles.statLabel}>Listings</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>—</Text>
                <Text style={styles.statLabel}>Favorites</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>—</Text>
                <Text style={styles.statLabel}>Views</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            onPress={() => setShowEditModal(true)}
            style={styles.editProfileButton}
          >
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShowListings}
            style={styles.listingsButton}
          >
            <Text style={styles.listingsButtonText}>
              {loadingListings ? "Loading..." : "Show My Listings"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <SettingsItem icon={icons.calendar} title="My Bookings" />
          <SettingsItem icon={icons.wallet} title="Payments" />
        </View>

        <View style={styles.sectionBordered}>
          {settings.slice(2).map((item, index) => (
            <SettingsItem key={index} {...item} />
          ))}
        </View>

        <View style={styles.sectionBordered}>
          <SettingsItem
            icon={icons.logout}
            title="Logout"
            textStyle="#FF3B30"
            showArrow={false}
            onPress={handleLogout}
          />
          <SettingsItem
            icon={icons.shield}
            title="Delete Account"
            textStyle="#FF3B30"
            showArrow={false}
            onPress={handleDeleteAccount}
          />
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                onPress={pickImage}
                style={styles.avatarPickerContainer}
              >
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={styles.avatarPicker}
                  />
                ) : (
                  <View style={[styles.avatarPicker, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarPlaceholderText}>
                      {formData.name?.charAt(0)?.toUpperCase() || "?"}
                    </Text>
                  </View>
                )}
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Name"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Address (optional)"
                value={formData.address}
                onChangeText={(text) =>
                  setFormData({ ...formData, address: text })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Phone (optional)"
                value={formData.phone}
                keyboardType="phone-pad"
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleUpdateProfile}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Listings Modal */}
      <Modal
        visible={showListings}
        animationType="slide"
        onRequestClose={() => setShowListings(false)}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.listingsHeader}>
            <TouchableOpacity onPress={() => setShowListings(false)}>
              <Image source={icons.backArrow} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.listingsTitle}>
              My Listings ({userListings.length})
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.listingsScroll}>
            {userListings.length === 0 ? (
              <View style={styles.emptyListings}>
                <Text style={styles.emptyText}>No listings yet</Text>
                <TouchableOpacity style={styles.createButton}>
                  <Text style={styles.createButtonText}>
                    Create your first listing
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              userListings.map((listing: any) => (
                <View key={listing._id} style={styles.listingCard}>
                  <Image
                    source={{ uri: listing.images?.[0] }}
                    style={styles.listingImage}
                  />
                  <View style={styles.listingInfo}>
                    <View style={styles.listingHeader}>
                      <Text style={styles.listingName} numberOfLines={1}>
                        {listing.name}
                      </Text>
                      <View
                        style={[
                          styles.badge,
                          listing.type === "rent"
                            ? styles.rentBadge
                            : styles.saleBadge,
                        ]}
                      >
                        <Text style={styles.badgeText}>
                          {listing.type === "rent" ? "Rent" : "Sale"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.listingAddress} numberOfLines={1}>
                      📍 {listing.address}
                    </Text>
                    <Text style={styles.listingDetails}>
                      🛏 {listing.bedrooms} • 🚿 {listing.bathrooms}
                      {listing.area && ` • 📐 ${listing.area} m²`}
                    </Text>
                    <View style={styles.listingActions}>
                      <TouchableOpacity
                        style={styles.editListingButton}
                        onPress={() =>
                          router.push(`/properties/${listing._id}`)
                        }
                      >
                        <Text style={styles.editListingButtonText}>View</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteListingButton}
                        onPress={() => handleDeleteListing(listing._id)}
                      >
                        <Text style={styles.deleteListingButtonText}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContent: {
    paddingBottom: 128,
    paddingHorizontal: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  bellIcon: {
    width: 20,
    height: 20,
  },
  profileSection: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  profileContainer: {
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    marginTop: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E5E7EB",
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0061FF",
  },
  avatarPlaceholderText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
  },
  editButton: {
    position: "absolute",
    bottom: 44,
    right: 8,
  },
  editIcon: {
    width: 36,
    height: 36,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 20,
    gap: 32,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0061FF",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  editProfileButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  editProfileButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  listingsButton: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  listingsButtonText: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "500",
  },
  sectionBordered: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 20,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingsIcon: {
    width: 24,
    height: 24,
  },
  settingsText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalClose: {
    fontSize: 24,
    color: "#6B7280",
  },
  avatarPickerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarPicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E5E7EB",
  },
  changePhotoText: {
    color: "#0061FF",
    marginTop: 8,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#0061FF",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  listingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  listingsTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  listingsScroll: {
    flex: 1,
    padding: 16,
  },
  emptyListings: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  listingCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listingImage: {
    width: 100,
    height: 80,
    borderRadius: 8,
  },
  listingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  listingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listingName: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rentBadge: {
    backgroundColor: "#DBEAFE",
  },
  saleBadge: {
    backgroundColor: "#D1FAE5",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  listingAddress: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  listingDetails: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },
  listingActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  editListingButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#0061FF",
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: "center",
  },
  editListingButtonText: {
    color: "#0061FF",
    fontSize: 12,
    fontWeight: "600",
  },
  deleteListingButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: "center",
  },
  deleteListingButtonText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default Profile;
