const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google OAuth - Profile received:", profile.displayName, profile.emails[0].value);

        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          console.log("Google OAuth - Existing user found:", user.email);
          return done(null, user);
        }

        console.log("Google OAuth - Creating new user");

        // Create new user - hash a random password for security
        const hashedPassword = await bcrypt.hash("google-oauth-" + profile.id, 10);

        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: hashedPassword,
          connectionType: "Residential", // Default value
          location: "Not specified",
          role: "user",
          googleId: profile.id,
        });

        console.log("Google OAuth - User created successfully:", user.email);
        return done(null, user);
      } catch (error) {
        console.error("Google OAuth Error:", error.message);
        console.error("Error details:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
