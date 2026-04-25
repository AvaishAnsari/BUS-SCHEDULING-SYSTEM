const axios = require('axios');

const API_BASE = 'http://localhost:4000/api';

async function runTests() {
  try {
    console.log('--- Health Check ---');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('Health:', health.data);

    console.log('\n--- Bus Tests ---');
    const newBus = await axios.post(`${API_BASE}/bus`, { busNumber: 'TEST-001', capacity: 45, type: 'Express' });
    console.log('Created bus:', newBus.data.busNumber);
    
    const buses = await axios.get(`${API_BASE}/bus`);
    console.log('Total buses:', buses.data.length);
    
    const updatedBus = await axios.put(`${API_BASE}/bus/${newBus.data._id}`, { capacity: 50 });
    console.log('Updated bus capacity:', updatedBus.data.capacity);

    await axios.delete(`${API_BASE}/bus/${newBus.data._id}`);
    console.log('Deleted test bus');

    console.log('\n--- Route Tests ---');
    const newRoute = await axios.post(`${API_BASE}/route`, {
      routeNumber: 'TEST-R1', startLocation: 'A', endLocation: 'B', distance: 10, estimatedDuration: 20
    });
    console.log('Created route:', newRoute.data.routeNumber);
    
    const routes = await axios.get(`${API_BASE}/route`);
    console.log('Total routes:', routes.data.length);
    
    await axios.delete(`${API_BASE}/route/${newRoute.data._id}`);
    console.log('Deleted test route');

    console.log('\n--- Schedule Generation Test ---');
    const genRes = await axios.post(`${API_BASE}/schedule/generate`, { date: '2026-05-01' });
    console.log('Generated schedules:', genRes.data.message);
    
    const schedules = await axios.get(`${API_BASE}/schedule?date=2026-05-01`);
    console.log('Fetched schedules for 2026-05-01:', schedules.data.length);
    
    if (schedules.data.length > 0) {
        console.log('Deleting generated schedules for test cleanup...');
        for(let s of schedules.data) {
             await axios.delete(`${API_BASE}/schedule/${s._id}`);
        }
        console.log('Cleanup done.');
    }

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
  }
}

runTests();
