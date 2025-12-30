const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Import models
const User = require('../models/User');
const Property = require('../models/Property');
const Lead = require('../models/Lead');
const Appointment = require('../models/Appointment');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

// Sample data
const users = [
  {
    name: 'John Agent',
    email: 'agent@realestate.com',
    password: 'agent123',
    role: 'agent',
    phone: '+1 (555) 123-4567',
    bio: 'Experienced real estate agent with 10+ years in the industry. Specializing in luxury homes and commercial properties.',
    isActive: true
  },
  {
    name: 'Admin User',
    email: 'admin@realestate.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1 (555) 987-6543',
    bio: 'Platform administrator',
    isActive: true
  },
  {
    name: 'Sarah Client',
    email: 'client@example.com',
    password: 'client123',
    role: 'user',
    phone: '+1 (555) 456-7890',
    isActive: true
  }
];

const getProperties = (agentId) => [
  {
    title: 'Modern Luxury Villa with Pool',
    description: 'Stunning 5-bedroom modern villa featuring an infinity pool, smart home technology, and breathtaking mountain views. This architectural masterpiece offers open-plan living spaces, a gourmet kitchen with top-of-the-line appliances, and a private cinema room.',
    price: 1250000,
    propertyType: 'house',
    status: 'available',
    purpose: 'sale',
    location: {
      address: '123 Luxury Lane',
      city: 'Beverly Hills',
      state: 'California',
      zipCode: '90210',
      country: 'USA'
    },
    features: {
      bedrooms: 5,
      bathrooms: 4,
      area: 4500,
      yearBuilt: 2022,
      parking: 3,
      amenities: ['pool', 'gym', 'smart_home', 'security', 'garden', 'garage']
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800' },
      { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800' }
    ],
    agent: agentId,
    isFeatured: true,
    views: 245
  },
  {
    title: 'Downtown Penthouse Apartment',
    description: 'Exclusive penthouse with panoramic city views, private elevator access, and rooftop terrace. Features floor-to-ceiling windows, designer finishes, and a chef\'s kitchen.',
    price: 850000,
    propertyType: 'apartment',
    status: 'available',
    purpose: 'sale',
    location: {
      address: '500 Skyline Tower, Unit PH1',
      city: 'New York',
      state: 'New York',
      zipCode: '10001',
      country: 'USA'
    },
    features: {
      bedrooms: 3,
      bathrooms: 3,
      area: 2800,
      yearBuilt: 2020,
      parking: 2,
      amenities: ['elevator', 'gym', 'concierge', 'rooftop', 'security']
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800' }
    ],
    agent: agentId,
    isFeatured: true,
    views: 189
  },
  {
    title: 'Charming Suburban Family Home',
    description: 'Perfect family home in a quiet neighborhood with excellent schools nearby. Features a spacious backyard, updated kitchen, and cozy fireplace in the living room.',
    price: 425000,
    propertyType: 'house',
    status: 'available',
    purpose: 'sale',
    location: {
      address: '789 Oak Street',
      city: 'Austin',
      state: 'Texas',
      zipCode: '78701',
      country: 'USA'
    },
    features: {
      bedrooms: 4,
      bathrooms: 2,
      area: 2200,
      yearBuilt: 2015,
      parking: 2,
      amenities: ['garden', 'garage', 'fireplace', 'basement']
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800' }
    ],
    agent: agentId,
    isFeatured: false,
    views: 156
  },
  {
    title: 'Beachfront Condo with Ocean Views',
    description: 'Wake up to stunning ocean views in this beautifully renovated beachfront condo. Direct beach access, resort-style amenities, and modern coastal design.',
    price: 3500,
    propertyType: 'condo',
    status: 'available',
    purpose: 'rent',
    location: {
      address: '100 Ocean Drive, Unit 5B',
      city: 'Miami',
      state: 'Florida',
      zipCode: '33139',
      country: 'USA'
    },
    features: {
      bedrooms: 2,
      bathrooms: 2,
      area: 1400,
      yearBuilt: 2018,
      parking: 1,
      amenities: ['pool', 'gym', 'beach_access', 'balcony', 'concierge']
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800' }
    ],
    agent: agentId,
    isFeatured: true,
    views: 312
  },
  {
    title: 'Commercial Office Space Downtown',
    description: 'Prime commercial space ideal for startups or established businesses. Open floor plan, high ceilings, and modern amenities in the heart of the business district.',
    price: 8500,
    propertyType: 'commercial',
    status: 'available',
    purpose: 'rent',
    location: {
      address: '200 Business Center Blvd',
      city: 'San Francisco',
      state: 'California',
      zipCode: '94102',
      country: 'USA'
    },
    features: {
      bedrooms: 0,
      bathrooms: 2,
      area: 3500,
      yearBuilt: 2019,
      parking: 5,
      amenities: ['elevator', 'security', 'conference_room', 'kitchen']
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800' }
    ],
    agent: agentId,
    isFeatured: false,
    views: 87
  },
  {
    title: 'Cozy Studio in Arts District',
    description: 'Trendy studio apartment in the vibrant arts district. Exposed brick walls, high ceilings, and walkable to restaurants, galleries, and nightlife.',
    price: 1800,
    propertyType: 'apartment',
    status: 'available',
    purpose: 'rent',
    location: {
      address: '55 Artist Way, Unit 3A',
      city: 'Los Angeles',
      state: 'California',
      zipCode: '90013',
      country: 'USA'
    },
    features: {
      bedrooms: 0,
      bathrooms: 1,
      area: 550,
      yearBuilt: 1925,
      parking: 0,
      amenities: ['laundry', 'rooftop']
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', isPrimary: true }
    ],
    agent: agentId,
    isFeatured: false,
    views: 234
  }
];

const getLeads = (agentId, propertyIds) => [
  {
    name: 'Michael Johnson',
    email: 'michael.j@email.com',
    phone: '+1 (555) 111-2222',
    source: 'website',
    status: 'qualified',
    interests: {
      propertyType: ['house', 'condo'],
      priceRange: { min: 400000, max: 800000 },
      locations: ['Austin', 'Dallas'],
      timeline: 'immediate'
    },
    notes: 'Looking for a family home, pre-approved for $750k mortgage',
    assignedTo: agentId,
    properties: propertyIds.slice(0, 2),
    activities: [
      { type: 'created', description: 'Lead created from website inquiry' },
      { type: 'call', description: 'Initial discovery call - discussed requirements' },
      { type: 'email', description: 'Sent property listings matching criteria' }
    ]
  },
  {
    name: 'Emily Chen',
    email: 'emily.chen@email.com',
    phone: '+1 (555) 333-4444',
    source: 'referral',
    status: 'new',
    interests: {
      propertyType: ['apartment'],
      priceRange: { min: 1500, max: 3000 },
      locations: ['Miami', 'Fort Lauderdale'],
      timeline: '1-3_months'
    },
    notes: 'Relocating for work, needs rental near downtown',
    assignedTo: agentId,
    activities: [
      { type: 'created', description: 'Referred by existing client Sarah' }
    ]
  },
  {
    name: 'Robert Williams',
    email: 'r.williams@company.com',
    phone: '+1 (555) 555-6666',
    source: 'website',
    status: 'contacted',
    interests: {
      propertyType: ['commercial'],
      priceRange: { min: 5000, max: 15000 },
      locations: ['San Francisco', 'Oakland'],
      timeline: '3-6_months'
    },
    notes: 'Tech startup looking for office space, 20-30 employees',
    assignedTo: agentId,
    activities: [
      { type: 'created', description: 'Inquiry from commercial listings page' },
      { type: 'email', description: 'Sent commercial property brochure' }
    ]
  },
  {
    name: 'Jennifer Martinez',
    email: 'jen.martinez@email.com',
    phone: '+1 (555) 777-8888',
    source: 'social_media',
    status: 'negotiating',
    interests: {
      propertyType: ['house'],
      priceRange: { min: 1000000, max: 1500000 },
      locations: ['Beverly Hills', 'Bel Air'],
      timeline: 'immediate'
    },
    notes: 'Interested in luxury villa, submitted offer at $1.2M',
    assignedTo: agentId,
    properties: [propertyIds[0]],
    activities: [
      { type: 'created', description: 'Instagram ad conversion' },
      { type: 'viewing', description: 'Showed Modern Luxury Villa' },
      { type: 'call', description: 'Discussed offer terms' },
      { type: 'note', description: 'Submitted offer at $1.2M, pending response' }
    ]
  }
];

const getAppointments = (agentId, propertyIds, leadIds) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    {
      title: 'Property Viewing - Modern Luxury Villa',
      type: 'viewing',
      date: tomorrow,
      startTime: '10:00',
      endTime: '11:00',
      location: '123 Luxury Lane, Beverly Hills, CA',
      property: propertyIds[0],
      lead: leadIds[3],
      createdBy: agentId,
      notes: 'Second viewing, client is very interested',
      status: 'scheduled'
    },
    {
      title: 'Initial Consultation - Michael Johnson',
      type: 'meeting',
      date: tomorrow,
      startTime: '14:00',
      endTime: '15:00',
      location: 'Office',
      lead: leadIds[0],
      createdBy: agentId,
      notes: 'Discuss financing options and timeline',
      status: 'scheduled'
    },
    {
      title: 'Open House - Downtown Penthouse',
      type: 'open_house',
      date: nextWeek,
      startTime: '12:00',
      endTime: '16:00',
      location: '500 Skyline Tower, Unit PH1, New York, NY',
      property: propertyIds[1],
      createdBy: agentId,
      notes: 'Weekend open house, expect 20-30 visitors',
      status: 'scheduled'
    },
    {
      title: 'Follow-up Call - Robert Williams',
      type: 'follow_up',
      date: today,
      startTime: '16:00',
      endTime: '16:30',
      lead: leadIds[2],
      createdBy: agentId,
      notes: 'Discuss commercial space requirements',
      status: 'scheduled'
    }
  ];
};

// Seed function
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Property.deleteMany();
    await Lead.deleteMany();
    await Appointment.deleteMany();

    console.log('Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users`);

    const agentUser = createdUsers.find(u => u.role === 'agent');

    // Create properties
    const propertiesData = getProperties(agentUser._id);
    const createdProperties = await Property.create(propertiesData);
    console.log(`Created ${createdProperties.length} properties`);

    const propertyIds = createdProperties.map(p => p._id);

    // Create leads
    const leadsData = getLeads(agentUser._id, propertyIds);
    const createdLeads = await Lead.create(leadsData);
    console.log(`Created ${createdLeads.length} leads`);

    const leadIds = createdLeads.map(l => l._id);

    // Create appointments
    const appointmentsData = getAppointments(agentUser._id, propertyIds, leadIds);
    const createdAppointments = await Appointment.create(appointmentsData);
    console.log(`Created ${createdAppointments.length} appointments`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest Accounts:');
    console.log('Agent: agent@realestate.com / agent123');
    console.log('Admin: admin@realestate.com / admin123');
    console.log('Client: client@example.com / client123');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

// Destroy function
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Property.deleteMany();
    await Lead.deleteMany();
    await Appointment.deleteMany();

    console.log('All data destroyed!');
    process.exit(0);
  } catch (err) {
    console.error('Error destroying data:', err);
    process.exit(1);
  }
};

// Run based on command
if (process.argv[2] === '-d') {
  destroyData();
} else {
  seedData();
}
