const mongoose = require('mongoose');
const Lead = require('./server/models/Lead');
require('dotenv').config();

const seedData = [
  {
    firstName: 'Kushal',
    lastName: 'Patel',
    email: 'kushal.patel@gmail.com',
    phone: '9876543210',
    company: 'Tech Solutions Inc',
    source: 'Website',
    stage: 'Contacted',
    projectDetails: {
      propertyType: 'Residential',
      estimatedBudget: '500000'
    },
    leadScore: 75
  },
  {
    firstName: 'Maharshi',
    lastName: 'Pandya',
    email: 'maharshi@gmail.com',
    phone: '8765432109',
    company: 'Green Energy Ltd',
    source: 'Website',
    stage: 'New',
    projectDetails: {
      propertyType: 'Commercial',
      estimatedBudget: '1000000'
    },
    leadScore: 65
  },
  {
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@gmail.com',
    phone: '7654321098',
    company: 'Solar Power Co',
    source: 'Referral',
    stage: 'Quoted',
    projectDetails: {
      propertyType: 'Residential',
      estimatedBudget: '750000'
    },
    leadScore: 85
  },
  {
    firstName: 'Raj',
    lastName: 'Kumar',
    email: 'raj.kumar@gmail.com',
    phone: '6543210987',
    company: 'Energy Solutions',
    source: 'Phone',
    stage: 'Converted',
    projectDetails: {
      propertyType: 'Industrial',
      estimatedBudget: '2000000'
    },
    leadScore: 95
  },
  {
    firstName: 'Ananya',
    lastName: 'Gupta',
    email: 'ananya.gupta@gmail.com',
    phone: '5432109876',
    company: 'Renewable Energy',
    source: 'Social Media',
    stage: 'Lost',
    projectDetails: {
      propertyType: 'Residential',
      estimatedBudget: '600000'
    },
    leadScore: 45
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing leads
    await Lead.deleteMany({});
    console.log('🗑️  Cleared existing leads');

    // Insert seed data
    const inserted = await Lead.insertMany(seedData);
    console.log(`✅ Successfully inserted ${inserted.length} leads`);

    // Display inserted leads
    const allLeads = await Lead.find({});
    console.log('\n📊 All Leads in Database:');
    allLeads.forEach((lead, index) => {
      console.log(`${index + 1}. ${lead.firstName} ${lead.lastName} - ${lead.stage}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
