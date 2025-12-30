const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from backend folder
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models
const Property = require('../models/Property');

console.log('🌱 Starting database seeding...');
console.log(`📊 Connecting to: ${process.env.MONGODB_URI ? 'MongoDB Atlas' : 'No URI found'}`);

// Pakistani properties data
const properties = [
  {
    title: '1 Kanal Luxury Villa in DHA Phase 6',
    description: 'Stunning 5-bedroom luxury villa in DHA Phase 6 Islamabad featuring modern architecture, Italian marble flooring, and beautiful landscaped garden. This masterpiece offers spacious living areas, a designer kitchen with imported fittings, and a private home theater. The master suite includes a walk-in closet and luxury bathroom.',
    price: 85000000,
    propertyType: 'Villa',
    status: 'For Sale',
    listingType: 'sale',
    featured: true,
    address: {
      street: 'Street 15, Sector C',
      city: 'Islamabad',
      state: 'Federal Capital',
      zipCode: '44000',
      country: 'Pakistan'
    },
    bedrooms: 5,
    bathrooms: 6,
    area: 4500,
    lotSize: 4500,
    yearBuilt: 2023,
    parking: 3,
    features: ['Swimming Pool', 'Home Theater', 'Smart Home', 'Garden', 'Servant Quarter'],
    amenities: ['Central AC', 'Security System', 'Solar Panels', 'Backup Generator'],
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
    ],
    views: 345
  },
  {
    title: 'Modern Apartment in Bahria Town Phase 8',
    description: 'Exclusive 3-bedroom apartment in the heart of Bahria Town Phase 8 Rawalpindi with stunning views of the Grand Mosque. Features modern finishes, open plan kitchen, and access to all Bahria Town amenities including swimming pool and gym.',
    price: 18500000,
    propertyType: 'Apartment',
    status: 'For Sale',
    listingType: 'sale',
    featured: true,
    address: {
      street: 'Safari Villas, Block C',
      city: 'Rawalpindi',
      state: 'Punjab',
      zipCode: '46000',
      country: 'Pakistan'
    },
    bedrooms: 3,
    bathrooms: 3,
    area: 1800,
    yearBuilt: 2022,
    parking: 1,
    features: ['Mosque View', 'Balcony', 'Modern Kitchen', 'Tile Flooring'],
    amenities: ['Lift', 'Swimming Pool', 'Gym', 'Community Park', '24/7 Security'],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'
    ],
    views: 289
  },
  {
    title: '10 Marla House in F-7 Islamabad',
    description: 'Beautiful 4-bedroom house in the prime location of F-7 Islamabad. Close to Jinnah Super Market and Faisal Mosque. Features spacious rooms, modern kitchen, and lovely lawn. Perfect for families looking for a peaceful neighborhood.',
    price: 95000000,
    propertyType: 'House',
    status: 'For Sale',
    listingType: 'sale',
    featured: false,
    address: {
      street: 'Street 25, F-7/2',
      city: 'Islamabad',
      state: 'Federal Capital',
      zipCode: '44000',
      country: 'Pakistan'
    },
    bedrooms: 4,
    bathrooms: 4,
    area: 2700,
    lotSize: 2700,
    yearBuilt: 2018,
    parking: 2,
    features: ['Lawn', 'Modern Kitchen', 'Marble Flooring', 'Drawing Room'],
    amenities: ['Central AC', 'Garage', 'Servant Quarter', 'Store Room'],
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800'
    ],
    views: 432
  },
  {
    title: 'Luxury Penthouse in Clifton Karachi',
    description: 'Breathtaking sea-facing penthouse in Clifton Block 2, Karachi. This exclusive property offers 4 bedrooms with panoramic ocean views, private terrace, and world-class finishes. Located in the most prestigious neighborhood of Karachi.',
    price: 150000000,
    propertyType: 'Penthouse',
    status: 'For Sale',
    listingType: 'sale',
    featured: true,
    address: {
      street: 'Ocean Tower, Block 2',
      city: 'Karachi',
      state: 'Sindh',
      zipCode: '75600',
      country: 'Pakistan'
    },
    bedrooms: 4,
    bathrooms: 5,
    area: 4000,
    yearBuilt: 2021,
    parking: 2,
    features: ['Sea View', 'Private Terrace', 'Jacuzzi', 'Designer Interior'],
    amenities: ['Pool', 'Gym', 'Concierge', '24/7 Security', 'Valet Parking'],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
      'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800'
    ],
    views: 567
  },
  {
    title: '1 Kanal Plot in DHA Phase 9 Lahore',
    description: 'Premium residential plot in DHA Phase 9 Prism Lahore. Ideal location near main boulevard with all utilities available. Perfect for building your dream home in the most sought-after housing society.',
    price: 32000000,
    propertyType: 'Plot',
    status: 'For Sale',
    listingType: 'sale',
    featured: false,
    address: {
      street: 'Block A, Plot 125',
      city: 'Lahore',
      state: 'Punjab',
      zipCode: '54000',
      country: 'Pakistan'
    },
    bedrooms: 0,
    bathrooms: 0,
    area: 4500,
    lotSize: 4500,
    yearBuilt: 2024,
    parking: 0,
    features: ['Corner Plot', 'Near Boulevard', 'Developed Area', 'All Utilities'],
    amenities: ['Near Park', 'Near Mosque', 'Near Commercial Area'],
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
      'https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=800'
    ],
    views: 156
  },
  {
    title: 'Farm House in Bani Gala Islamabad',
    description: 'Magnificent 4 Kanal farm house in scenic Bani Gala with mountain views. Features include a swimming pool, lush green lawns, fruit orchard, and modern amenities. Perfect weekend retreat or permanent residence.',
    price: 180000000,
    propertyType: 'Farmhouse',
    status: 'For Sale',
    listingType: 'sale',
    featured: true,
    address: {
      street: 'Bani Gala Road',
      city: 'Islamabad',
      state: 'Federal Capital',
      zipCode: '44000',
      country: 'Pakistan'
    },
    bedrooms: 6,
    bathrooms: 7,
    area: 18000,
    lotSize: 18000,
    yearBuilt: 2020,
    parking: 4,
    features: ['Mountain Views', 'Swimming Pool', 'Orchard', 'BBQ Area', 'Guest House'],
    amenities: ['Bore Hole', 'Solar System', 'Generator', 'Security'],
    images: [
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800',
      'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800'
    ],
    views: 234
  },
  {
    title: '3 Bedroom Apartment for Rent in Gulberg',
    description: 'Spacious 3-bedroom apartment for rent in the commercial hub of Gulberg, Lahore. Walking distance to MM Alam Road restaurants and shopping. Modern finishes with open plan living and dining.',
    price: 150000,
    propertyType: 'Apartment',
    status: 'For Rent',
    listingType: 'rent',
    featured: true,
    address: {
      street: 'Gulberg III, Block Y',
      city: 'Lahore',
      state: 'Punjab',
      zipCode: '54000',
      country: 'Pakistan'
    },
    bedrooms: 3,
    bathrooms: 2,
    area: 1600,
    yearBuilt: 2019,
    parking: 1,
    features: ['City View', 'Modern Kitchen', 'Wooden Flooring', 'Balcony'],
    amenities: ['Lift', 'Security', 'Backup Power', 'Covered Parking'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800'
    ],
    views: 423
  },
  {
    title: 'Commercial Shop in Blue Area Islamabad',
    description: 'Prime location commercial shop in Blue Area, Islamabad. Ground floor shop with excellent foot traffic. Suitable for retail, restaurant, or office use. Great investment opportunity in the capital.',
    price: 45000000,
    propertyType: 'Shop',
    status: 'For Sale',
    listingType: 'sale',
    featured: false,
    address: {
      street: 'Jinnah Avenue, Blue Area',
      city: 'Islamabad',
      state: 'Federal Capital',
      zipCode: '44000',
      country: 'Pakistan'
    },
    bedrooms: 0,
    bathrooms: 1,
    area: 800,
    yearBuilt: 2015,
    parking: 0,
    features: ['Ground Floor', 'Main Road Facing', 'High Ceiling', 'Glass Front'],
    amenities: ['Central AC', 'Fire Safety', 'Loading Area'],
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800'
    ],
    views: 189
  },
  {
    title: '5 Marla House in Bahria Town Lahore',
    description: 'Beautiful newly built 5 Marla house in Bahria Town Lahore. Perfect starter home with 3 bedrooms, modern kitchen, and small garden. Gated community with 24/7 security and all amenities.',
    price: 15000000,
    propertyType: 'House',
    status: 'For Sale',
    listingType: 'sale',
    featured: true,
    address: {
      street: 'Block D, Sector C',
      city: 'Lahore',
      state: 'Punjab',
      zipCode: '54000',
      country: 'Pakistan'
    },
    bedrooms: 3,
    bathrooms: 3,
    area: 1350,
    lotSize: 1350,
    yearBuilt: 2023,
    parking: 1,
    features: ['Brand New', 'Garden', 'Modern Design', 'Tile Flooring'],
    amenities: ['Gated Community', 'Nearby Park', 'Nearby School', 'Nearby Mosque'],
    images: [
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800'
    ],
    views: 312
  },
  {
    title: 'Office Space for Rent in I-8 Markaz',
    description: 'Professional office space available for rent in I-8 Markaz, Islamabad. 4th floor with lift access, ready to move in. Perfect for IT companies, consultancies, or corporate offices.',
    price: 200000,
    propertyType: 'Office',
    status: 'For Rent',
    listingType: 'rent',
    featured: false,
    address: {
      street: 'I-8 Markaz, Business Center',
      city: 'Islamabad',
      state: 'Federal Capital',
      zipCode: '44000',
      country: 'Pakistan'
    },
    bedrooms: 0,
    bathrooms: 2,
    area: 2000,
    yearBuilt: 2018,
    parking: 3,
    features: ['Open Plan', 'Conference Room', 'Reception Area', 'Pantry'],
    amenities: ['Lift', 'Central AC', 'High Speed Internet Ready', '24/7 Access'],
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800'
    ],
    views: 178
  }
];

// Seed function
const seedDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data
    console.log('🗑️  Clearing existing properties...');
    await Property.deleteMany({});

    // Insert properties one by one to trigger pre-save hook for slug generation
    console.log('📦 Inserting properties...');
    const createdProperties = [];
    for (const propData of properties) {
      const prop = new Property(propData);
      await prop.save();
      createdProperties.push(prop);
    }
    
    console.log(`✅ ${createdProperties.length} properties created successfully!`);
    
    // Display created properties
    console.log('\n📋 Created Properties:');
    createdProperties.forEach((prop, index) => {
      const priceDisplay = prop.price >= 10000000 
        ? `PKR ${(prop.price / 10000000).toFixed(2)} Crore`
        : `PKR ${(prop.price / 100000).toFixed(2)} Lac`;
      console.log(`   ${index + 1}. ${prop.title} - ${priceDisplay} (${prop.status})`);
    });

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📌 Next steps:');
    console.log('   1. Start backend: npm start');
    console.log('   2. Start frontend: npm run dev');
    console.log('   3. Visit: http://localhost:3001');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

// Run seeder
seedDB();
