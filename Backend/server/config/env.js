// Environment Variables Configuration
// TODO: Replace <db_password> with your actual MongoDB password
process.env.MONGO_URI = "mongodb+srv://vedpatel29:type_your_real_password_here@green.ydd1hrx.mongodb.net/?appName=Green";
process.env.PORT = process.env.PORT || 5000;
process.env.JWT_SECRET = process.env.JWT_SECRET || "green_energy_secret_key_123";
process.env.NODE_ENV = process.env.NODE_ENV || "development";