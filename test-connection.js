#!/usr/bin/env node

/**
 * MongoDB Atlas Quick Setup & Connection Tester
 * 
 * This script helps you:
 * 1. Set up MongoDB Atlas connection
 * 2. Test the connection
 * 3. Verify all works before starting the server
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🔍 MongoDB Atlas Connection Tester                     ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`);

// Check if MONGODB_URI is configured
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI || mongoURI.includes('YOUR_PASSWORD_HERE') || mongoURI.includes('xxxxx')) {
  console.error(`
❌ MongoDB Atlas is not configured yet!

Please follow these steps:

1. Go to MongoDB Atlas: https://cloud.mongodb.com/
2. Create a free cluster (M0)
3. Create a database user
4. Whitelist your IP (0.0.0.0/0 for dev)
5. Get your connection string

Then update your .env file:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/real-estate-platform

Or run: npm run configure-atlas

`);
  process.exit(1);
}

console.log('🔄 Testing MongoDB Atlas connection...\n');
console.log(`Connection String: ${mongoURI.replace(/:[^:@]+@/, ':****@')}\n`);

// Test connection
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(async (conn) => {
  console.log('✅ MongoDB Atlas Connected Successfully!\n');
  console.log(`📊 Host: ${conn.connection.host}`);
  console.log(`📦 Database: ${conn.connection.name}`);
  console.log(`🔌 Port: ${conn.connection.port || 27017}`);
  
  // Get database stats
  try {
    const admin = conn.connection.db.admin();
    const info = await admin.serverInfo();
    console.log(`🏷️  MongoDB Version: ${info.version}`);
  } catch (err) {
    // Ignore if we can't get server info
  }

  // Check collections
  const collections = await conn.connection.db.listCollections().toArray();
  console.log(`\n📂 Collections in database: ${collections.length}`);
  if (collections.length > 0) {
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
  } else {
    console.log('   (No collections yet - run "npm run seed" to populate)');
  }

  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   ✅ MongoDB Atlas is Ready!                             ║
║                                                          ║
║   Next steps:                                            ║
║   1. npm run seed      (populate database)               ║
║   2. npm start         (start backend server)            ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);

  await mongoose.connection.close();
  process.exit(0);
})
.catch((error) => {
  console.error('❌ MongoDB Atlas Connection Failed!\n');
  console.error(`Error: ${error.message}\n`);

  if (error.message.includes('authentication failed')) {
    console.error(`
🔐 Authentication Error - Check:
   1. Username is correct
   2. Password is correct (URL-encoded if it has special characters)
   3. Database user has proper permissions
`);
  } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
    console.error(`
🌐 Network Error - Check:
   1. Your IP is whitelisted (0.0.0.0/0 for dev)
   2. Cluster is running (not paused)
   3. Internet connection is working
`);
  } else if (error.message.includes('Invalid connection string')) {
    console.error(`
🔗 Connection String Error - Check:
   1. Connection string format is correct
   2. Password is URL-encoded
   3. Database name is included
   
Example:
mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true
`);
  }

  console.error(`
Need help? Check the setup guide:
📖 MONGODB_ATLAS_SETUP.md
  `);

  process.exit(1);
});
