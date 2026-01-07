// ======================= IMPORTS =======================

// Import Cloudinary SDK (v2 API)
import { v2 as cloudinary } from "cloudinary";

// ======================= CLOUDINARY CONFIG =======================

// Configure Cloudinary using environment variables
// These values should be stored securely in your .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Cloudinary cloud name
  api_key: process.env.CLOUDINARY_API_KEY, // API key
  api_secret: process.env.CLOUDINARY_API_SECRET, // API secret
});

// ======================= DELETE IMAGE CONTROLLER =======================

export const deleteImage = async (req, res) => {
  // Extract publicId from request body
  const { publicId } = req.body;

  // Validate input
  if (!publicId) {
    return res.status(400).json({
      message: "Public ID is required",
    });
  }

  try {
    // Delete image from Cloudinary using publicId
    const result = await cloudinary.uploader.destroy(publicId);

    // Successful deletion response
    res.status(200).json({
      message: "Image deleted successfully",
      result,
    });
  } catch (error) {
    // Log error for debugging
    console.error("Error deleting image:", error);

    // Server error response
    res.status(500).json({
      message: "Error deleting image",
      error,
    });
  }
};
