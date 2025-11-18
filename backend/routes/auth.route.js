import express from "express";
import {
  checkAuth,
  deleteAccount,
  forgotPassword,
  getHouseOwner,
  google,
  login,
  logout,
  resetPassword,
  signup,
  updateProfile,
  verifyMail,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import {User} from "../models/user.model.js"; // Add this import

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", login);
router.post("/logout", logout);
router.delete("/delete", verifyToken, deleteAccount);
router.post("/verify-email", verifyMail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/check-auth", verifyToken, checkAuth); //for checking of the auth of the user
router.post("/google", google); // OAuth route
router.patch("/update-profile", verifyToken, updateProfile); // Update profile route
router.get("/houseOwner/:id", getHouseOwner);

// Fix the /me route - add User import at top
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
