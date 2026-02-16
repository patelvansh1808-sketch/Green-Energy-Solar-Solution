const mongoose = require('mongoose');
require('./server/config/env');

async function cleanLeads() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Drop the leads collection to remove corrupted data
    await mongoose.connection.db.collection('leads').drop();
    console.log('✅ Leads collection dropped successfully');

    await mongoose.connection.close();
    console.log('Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

cleanLeads();
