const express = require("express");
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");
const {
  register,
  login,
  forgotPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err) {
        console.error("Passport authentication error:", err);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_error`);
      }
      
      if (!user) {
        console.error("No user returned from passport. Info:", info);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
      }

      try {
        // Generate JWT token
        const token = jwt.sign(
          { userId: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        console.log("Google login successful for:", user.email);

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?token=${token}`);
      } catch (error) {
        console.error("Token generation error:", error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=token_error`);
      }
    })(req, res, next);
  }
);

module.exports = router;
