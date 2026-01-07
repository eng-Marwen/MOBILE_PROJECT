// ======================= IMPORTS =======================

// JSON Web Token library
import jwt from "jsonwebtoken";

// ======================= VERIFY TOKEN MIDDLEWARE =======================

/**
 * Middleware to verify JWT stored in cookies
 * - Extracts token from "auth-token" cookie
 * - Verifies token using SECRET_KEY
 * - Attaches userId to request object
 */
export const verifyToken = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies["auth-token"];

    // If token does not exist → unauthorized
    if (!token) {
      throw new Error("Unauthorized - invalid token");
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // If token is invalid or expired
    if (!decoded) {
      throw new Error("Unauthorized - invalid token");
    }

    // Attach user ID to request for later use
    req.userId = decoded.userId;

    // Continue to next middleware/controller
    next();
  } catch (error) {
    // Token verification failed
    res.status(403).json({
      status: "fail",
      message: error.message,
    });
  }
};
