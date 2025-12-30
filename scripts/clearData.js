const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function clearData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const propertiesResult = await mongoose.connection.db.collection('properties').deleteMany({});
    console.log('Properties deleted:', propertiesResult.deletedCount);
    
    const leadsResult = await mongoose.connection.db.collection('leads').deleteMany({});
    console.log('Leads deleted:', leadsResult.deletedCount);
    
    console.log('\n✅ All data cleared! Database is now empty.');
    console.log('Only user-added data will appear from now on.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

clearData();
