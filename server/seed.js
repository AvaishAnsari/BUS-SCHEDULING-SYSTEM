require('dotenv').config();
const mongoose = require('mongoose');
const Bus = require('./models/Bus');
const Route = require('./models/Route');
const Schedule = require('./models/Schedule');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bus_scheduling';

const buses = [
  { busNumber: 'BUS-001', capacity: 50, type: 'Standard' },
  { busNumber: 'BUS-002', capacity: 40, type: 'Mini' },
  { busNumber: 'BUS-003', capacity: 80, type: 'Double Decker' },
  { busNumber: 'BUS-004', capacity: 50, type: 'Standard' },
  { busNumber: 'BUS-005', capacity: 60, type: 'Express' },
];

const routes = [
  { routeNumber: 'R-01', startLocation: 'Central Station', endLocation: 'Airport', distance: 32, estimatedDuration: 55, stops: ['City Mall', 'Tech Park', 'Airport Terminal 1'] },
  { routeNumber: 'R-02', startLocation: 'West End', endLocation: 'University', distance: 14, estimatedDuration: 30, stops: ['West Park', 'Library', 'Main Gate'] },
  { routeNumber: 'R-03', startLocation: 'Harbor', endLocation: 'North Station', distance: 22, estimatedDuration: 40, stops: ['Fish Market', 'Old Town', 'Museum'] },
  { routeNumber: 'R-04', startLocation: 'East Gate', endLocation: 'Shopping District', distance: 18, estimatedDuration: 35, stops: ['Green Park', 'IT Hub', 'Grand Mall'] },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('🌱  Connected to MongoDB');

  await Bus.deleteMany({});
  await Route.deleteMany({});
  await Schedule.deleteMany({});
  console.log('🗑️   Cleared existing data');

  const createdBuses = await Bus.insertMany(buses);
  const createdRoutes = await Route.insertMany(routes);
  console.log(`✅  Seeded ${createdBuses.length} buses and ${createdRoutes.length} routes`);

  console.log('✅  Seed complete! Use the "Generate Schedule" button in the UI to populate schedules.');
  mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
