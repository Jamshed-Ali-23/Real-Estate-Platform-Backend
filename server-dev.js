const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// In-memory data storage
let properties = [];
let leads = [];
let contacts = [];
let messages = [];
let appointments = [];

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Real Estate Platform API is running (Dev Mode - No Database)',
    timestamp: new Date().toISOString(),
    mode: 'development',
    endpoints: {
      health: '/api/health',
      properties: '/api/properties',
      leads: '/api/leads',
      contacts: '/api/contact',
      settings: '/api/settings',
      auth: '/api/auth'
    }
  });
});

// Auth endpoints (mock)
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    token: 'mock-jwt-token',
    user: {
      id: 1,
      name: 'Admin User',
      email: req.body.email,
      role: 'admin'
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: Date.now(),
      name: req.body.name,
      email: req.body.email
    }
  });
});

// Properties endpoints
app.get('/api/properties', (req, res) => {
  // Support query filtering
  const { listingType, propertyType, bedrooms, location, minPrice, maxPrice, status } = req.query;

  let filteredProperties = properties;

  // Filter by listingType if provided (but allow all if not matching specific type)
  if (listingType) {
    filteredProperties = filteredProperties.filter(p =>
      p.listingType === listingType || !p.listingType || p.listingType === 'sale'
    );
  }

  // Filter by propertyType if provided
  if (propertyType) {
    filteredProperties = filteredProperties.filter(p =>
      p.propertyType?.toLowerCase() === propertyType.toLowerCase()
    );
  }

  // Filter by bedrooms if provided  
  if (bedrooms) {
    const bedsNum = parseInt(bedrooms);
    filteredProperties = filteredProperties.filter(p => p.bedrooms >= bedsNum);
  }

  // Filter by status if provided
  if (status) {
    filteredProperties = filteredProperties.filter(p => p.status === status);
  }

  // Filter by price range if provided
  if (minPrice) {
    filteredProperties = filteredProperties.filter(p => p.price >= parseInt(minPrice));
  }
  if (maxPrice) {
    filteredProperties = filteredProperties.filter(p => p.price <= parseInt(maxPrice));
  }

  // Add _id field for frontend compatibility
  const propertiesWithId = filteredProperties.map(p => ({ ...p, _id: p.id }));
  res.json({
    success: true,
    count: propertiesWithId.length,
    total: propertiesWithId.length,
    data: propertiesWithId
  });
});

app.get('/api/properties/:id', (req, res) => {
  const requestedId = req.params.id;
  const property = properties.find(p =>
    p.id === requestedId ||
    p._id === requestedId ||
    String(p.id) === requestedId
  );
  if (property) {
    // Add _id field for frontend compatibility
    res.json({ success: true, data: { ...property, _id: property.id } });
  } else {
    res.status(404).json({ success: false, message: 'Property not found' });
  }
});

app.post('/api/properties', (req, res) => {
  const newProperty = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  properties.push(newProperty);
  res.status(201).json({ success: true, data: newProperty });
});

app.put('/api/properties/:id', (req, res) => {
  const index = properties.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    properties[index] = { ...properties[index], ...req.body };
    res.json({ success: true, data: properties[index] });
  } else {
    res.status(404).json({ success: false, message: 'Property not found' });
  }
});

app.delete('/api/properties/:id', (req, res) => {
  const index = properties.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    properties.splice(index, 1);
    res.json({ success: true, message: 'Property deleted' });
  } else {
    res.status(404).json({ success: false, message: 'Property not found' });
  }
});

// Leads endpoints
app.get('/api/leads', (req, res) => {
  res.json({
    success: true,
    count: leads.length,
    data: leads
  });
});

// Public lead submission (from property pages)
app.post('/api/leads/public', (req, res) => {
  const newLead = {
    id: Date.now().toString(),
    ...req.body,
    source: 'Property Page',
    status: 'new',
    createdAt: new Date().toISOString()
  };
  leads.push(newLead);
  res.status(201).json({ success: true, data: newLead, message: 'Inquiry submitted successfully' });
});

// Listing submission (from Sell page)
app.post('/api/leads/listing', (req, res) => {
  const newListing = {
    id: Date.now().toString(),
    ...req.body,
    source: 'Sell Form',
    type: 'listing',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  leads.push(newListing);
  res.status(201).json({ success: true, data: newListing, message: 'Listing submitted successfully' });
});

app.post('/api/leads', (req, res) => {
  const newLead = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  leads.push(newLead);
  res.status(201).json({ success: true, data: newLead });
});

app.put('/api/leads/:id', (req, res) => {
  const index = leads.findIndex(l => l.id === req.params.id);
  if (index !== -1) {
    leads[index] = { ...leads[index], ...req.body };
    res.json({ success: true, data: leads[index] });
  } else {
    res.status(404).json({ success: false, message: 'Lead not found' });
  }
});

app.delete('/api/leads/:id', (req, res) => {
  const index = leads.findIndex(l => l.id === req.params.id);
  if (index !== -1) {
    leads.splice(index, 1);
    res.json({ success: true, message: 'Lead deleted' });
  } else {
    res.status(404).json({ success: false, message: 'Lead not found' });
  }
});

// Contact endpoint
app.post('/api/contact', (req, res) => {
  const newContact = {
    id: Date.now().toString(),
    ...req.body,
    status: 'new',
    createdAt: new Date().toISOString()
  };
  contacts.push(newContact);
  res.status(201).json({
    success: true,
    message: 'Contact form submitted successfully',
    data: newContact
  });
});

app.get('/api/contact', (req, res) => {
  res.json({
    success: true,
    count: contacts.length,
    data: contacts
  });
});

// Messages endpoints
app.get('/api/messages', (req, res) => {
  res.json({
    success: true,
    count: messages.length,
    data: messages
  });
});

app.post('/api/messages', (req, res) => {
  const newMessage = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  messages.push(newMessage);
  res.status(201).json({ success: true, data: newMessage });
});

// Appointments endpoints
app.get('/api/appointments', (req, res) => {
  res.json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});

app.post('/api/appointments', (req, res) => {
  const newAppointment = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  appointments.push(newAppointment);
  res.status(201).json({ success: true, data: newAppointment });
});

// Analytics endpoint
app.get('/api/analytics', (req, res) => {
  res.json({
    success: true,
    data: {
      totalProperties: properties.length,
      totalLeads: leads.length,
      totalContacts: contacts.length,
      totalMessages: messages.length,
      totalAppointments: appointments.length
    }
  });
});

// Settings endpoints
app.get('/api/settings/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Johnson',
      title: 'Senior Real Estate Agent',
      email: 'johnson@realestate.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main Street, New York, NY 10001',
      bio: 'Experienced real estate professional with over 10 years of expertise.',
    }
  });
});

app.put('/api/settings/profile', (req, res) => {
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: req.body
  });
});

app.put('/api/settings/notifications', (req, res) => {
  res.json({
    success: true,
    message: 'Notification preferences updated',
    data: req.body
  });
});

app.put('/api/settings/password', (req, res) => {
  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🏠 Real Estate Platform Backend (Dev Mode)             ║
║                                                          ║
║   Server running on: http://localhost:${PORT}              ║
║   Environment: Development                               ║
║   Database: In-memory storage (no MongoDB needed)        ║
║                                                          ║
║   ✅ All API endpoints working                           ║
║   ✅ No database setup required                          ║
║   ✅ Ready for frontend development                      ║
║                                                          ║
║   Health Check: http://localhost:${PORT}/api/health       ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
