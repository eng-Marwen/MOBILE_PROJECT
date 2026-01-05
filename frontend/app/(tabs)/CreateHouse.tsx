import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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
import { useSelector } from "react-redux";
import { api } from "../../services/api";
import { RootState } from "../../store";

type HouseFormData = {
  name: string;
  description: string;
  address: string;
  type: string;
  parking: boolean;
  furnished: boolean;
  offer: boolean;
  bedrooms: number;
  bathrooms: number;
  regularPrice: number;
  discountedPrice: number;
  area: string;
  images: string[];
};

export default function CreateHouseScreen() {
  const [formData, setFormData] = useState<HouseFormData>({
    name: "",
    description: "",
    address: "",
    type: "",
    parking: false,
    furnished: false,
    offer: false,
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountedPrice: 0,
    area: "",
    images: [],
  });
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!user) {
      Alert.alert(
        "Sign Up Required",
        "You need to sign up or log in before you can create a listing.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/login"),
          },
        ]
      );
    }
  }, [user, router]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Image picker function (same as profile)
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need camera roll permissions!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...result.assets.map((a) => a.uri)],
      }));
    }
  };

  const handleSubmitForm = async () => {
    // Validation (similar to web)
    if (!formData.name || formData.name.length < 4) {
      Alert.alert("Error", "House name must be at least 4 characters");
      return;
    }
    if (!formData.description || formData.description.length < 20) {
      Alert.alert("Error", "Description must be at least 20 characters");
      return;
    }
    if (!formData.address) {
      Alert.alert("Error", "Please enter an address");
      return;
    }
    if (!formData.type) {
      Alert.alert("Error", "Please select either Sale or Rent");
      return;
    }
    if (formData.images.length === 0) {
      Alert.alert("Error", "Please upload at least one image");
      return;
    }
    if (formData.offer && formData.discountedPrice >= formData.regularPrice) {
      Alert.alert("Error", "Discounted price must be less than regular price");
      return;
    }
    if (
      formData.area !== "" &&
      (isNaN(Number(formData.area)) || Number(formData.area) < 0)
    ) {
      Alert.alert("Error", "Area must be a positive number or left empty");
      return;
    }

    setCreating(true);
    try {
      const response = await api.post("/houses", formData);
      Alert.alert("Success", "House listing created successfully!");
      setFormData({
        name: "",
        description: "",
        address: "",
        type: "",
        parking: false,
        furnished: false,
        offer: false,
        bedrooms: 1,
        bathrooms: 1,
        regularPrice: 50,
        discountedPrice: 0,
        area: "",
        images: [],
      });
      console.log(response.data);
      router.replace("/(tabs)");
    } catch (error) {
      let message = "Failed to create house listing";
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as any).message === "string"
      ) {
        message = (error as any).message;
      }
      Alert.alert("Error", message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        <Ionicons name="add-circle" size={20} color="#26a522ff" /> Create New
        House Listing
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={formData.name}
        onChangeText={(v) => handleChange("name", v)}
        maxLength={62}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={formData.description}
        onChangeText={(v) => handleChange("description", v)}
        multiline
        maxLength={500}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={formData.address}
        onChangeText={(v) => handleChange("address", v)}
      />

      {/* Type selection with icons */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            formData.type === "sale" && styles.typeButtonActive,
          ]}
          onPress={() => handleChange("type", "sale")}
        >
          <Ionicons name="cash-outline" size={20} color="#007AFF" />
          <Text style={styles.typeButtonText}>Sell</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            formData.type === "rent" && styles.typeButtonActive,
          ]}
          onPress={() => handleChange("type", "rent")}
        >
          <Ionicons name="home-outline" size={20} color="#007AFF" />
          <Text style={styles.typeButtonText}>Rent</Text>
        </TouchableOpacity>
      </View>

      {/* Feature switches stacked vertically */}
      <View style={styles.iconSwitchColumn}>
        <View style={styles.iconSwitchItem}>
          <Ionicons
            name="car-outline"
            size={22}
            color={formData.parking ? "#27ae60" : "#888"}
          />
          <Text style={styles.iconSwitchText}>Parking</Text>
          <Switch
            value={formData.parking}
            onValueChange={(v) => handleChange("parking", v)}
          />
        </View>
        <View style={styles.iconSwitchItem}>
          <MaterialCommunityIcons
            name="sofa"
            size={22}
            color={formData.furnished ? "#27ae60" : "#888"}
          />
          <Text style={styles.iconSwitchText}>Furnished</Text>
          <Switch
            value={formData.furnished}
            onValueChange={(v) => handleChange("furnished", v)}
          />
        </View>
        <View style={styles.iconSwitchItem}>
          <Ionicons
            name="pricetag-outline"
            size={22}
            color={formData.offer ? "#DB4437" : "#888"}
          />
          <Text style={styles.iconSwitchText}>Offer</Text>
          <Switch
            value={formData.offer}
            onValueChange={(v) => handleChange("offer", v)}
          />
        </View>
      </View>

      {/* Bedrooms & Bathrooms with icons */}
      <View style={styles.iconInputRow}>
        <View style={styles.iconInputItem}>
          <Ionicons name="bed-outline" size={20} color="#007AFF" />
          <TextInput
            style={styles.inputSmall}
            placeholder="Bedrooms"
            value={formData.bedrooms.toString()}
            onChangeText={(v) => handleChange("bedrooms", parseInt(v) || 1)}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.iconInputItem}>
          <MaterialCommunityIcons name="shower" size={20} color="#007AFF" />
          <TextInput
            style={styles.inputSmall}
            placeholder="Bathrooms"
            value={formData.bathrooms.toString()}
            onChangeText={(v) => handleChange("bathrooms", parseInt(v) || 1)}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Price inputs */}
      <View style={styles.iconInputRow}>
        <View style={styles.iconInputItem}>
          <Ionicons name="cash-outline" size={20} color="#007AFF" />
          <TextInput
            style={styles.inputSmall}
            placeholder="Regular Price"
            value={formData.regularPrice.toString()}
            onChangeText={(v) =>
              handleChange("regularPrice", parseInt(v) || 50)
            }
            keyboardType="numeric"
          />
        </View>
        <View style={styles.iconInputItem}>
          <Ionicons name="pricetag-outline" size={20} color="#DB4437" />
          <TextInput
            style={styles.inputSmall}
            placeholder="Discounted Price"
            value={formData.discountedPrice.toString()}
            onChangeText={(v) =>
              handleChange("discountedPrice", parseInt(v) || 0)
            }
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Area input under prices */}
      <View style={[styles.iconInputItem, { marginBottom: 16 }]}>
        <MaterialCommunityIcons name="ruler-square" size={20} color="#007AFF" />
        <TextInput
          style={styles.inputSmall}
          placeholder="Area (m²)"
          value={formData.area.toString()}
          onChangeText={(v) => handleChange("area", v)}
          keyboardType="numeric"
        />
      </View>

      {/* Image Picker & Preview */}
      <View style={{ marginBottom: 16 }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#E5E5EA",
            padding: 12,
            borderRadius: 8,
            alignItems: "center",
            marginBottom: 8,
          }}
          onPress={pickImages}
        >
          <Ionicons name="images-outline" size={22} color="#007AFF" />
          <Text style={{ color: "#007AFF", fontWeight: "600", marginLeft: 8 }}>
            Pick Images
          </Text>
        </TouchableOpacity>
        <ScrollView horizontal>
          {formData.images.map((uri, idx) => (
            <Image
              key={idx}
              source={{ uri }}
              style={{ width: 80, height: 80, borderRadius: 8, marginRight: 8 }}
            />
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmitForm}
        disabled={creating}
      >
        <Ionicons name="checkmark-circle" size={22} color="#FFF" />
        <Text style={styles.submitButtonText}>
          {creating ? "Creating..." : "Create Listing"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F8F8F8" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 16, color: "#222" },
  input: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  inputSmall: {
    backgroundColor: "#FFF",
    padding: 8,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    width: 100,
    marginLeft: 8,
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    marginRight: 8,
    backgroundColor: "#FFF",
  },
  typeButtonActive: {
    backgroundColor: "#007AFF22",
    borderColor: "#007AFF",
  },
  typeButtonText: {
    marginLeft: 6,
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
  },
  iconSwitchColumn: {
    flexDirection: "column",
    marginBottom: 12,
  },
  iconSwitchItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  iconSwitchText: {
    marginLeft: 6,
    marginRight: 6,
    fontSize: 15,
    color: "#222",
    fontWeight: "500",
  },
  iconInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconInputItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#26a522ff",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 8,
  },
});
