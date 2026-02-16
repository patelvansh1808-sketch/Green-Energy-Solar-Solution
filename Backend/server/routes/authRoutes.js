const express = require("express");
const passport = require("../config/passport");
const { generateAccessToken, generateRefreshToken } = require("../config/jwt");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
} = require("../controllers/authController");
const User = require("../models/User");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshToken);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    prompt: "select_account", // Force account selection every time
    accessType: "offline"
  })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, async (err, user, info) => {
      if (err) {
        console.error("Passport authentication error:", err);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_error`);
      }
      
      if (!user) {
        console.error("No user returned from passport. Info:", info);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
      }

      try {
        // Generate JWT tokens
        const accessToken = generateAccessToken(user._id, user.role, user.email);
        const refreshToken_ = generateRefreshToken(user._id);

        // Save refresh token to database
        user.refreshToken = refreshToken_;
        await user.save();

        console.log("Google login successful for:", user.email);

        // Redirect to frontend with tokens
        res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?accessToken=${accessToken}&refreshToken=${refreshToken_}`);
      } catch (error) {
        console.error("Token generation error:", error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=token_error`);
      }
    })(req, res, next);
  }
);

module.exports = router;
