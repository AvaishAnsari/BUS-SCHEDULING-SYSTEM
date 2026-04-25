const API_BASE = 'http://localhost:4000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function runTests() {
  try {
    console.log('--- Health Check ---');
    const health = await request('/health');
    console.log('Health:', health);

    console.log('\n--- Bus Tests ---');
    const newBus = await request('/bus', {
      method: 'POST',
      body: JSON.stringify({ busNumber: 'TEST-001', capacity: 45, type: 'Express' })
    });
    console.log('Created bus:', newBus.busNumber);
    
    const buses = await request('/bus');
    console.log('Total buses:', buses.length);
    
    const updatedBus = await request(`/bus/${newBus._id}`, {
      method: 'PUT',
      body: JSON.stringify({ capacity: 50 })
    });
    console.log('Updated bus capacity:', updatedBus.capacity);

    await request(`/bus/${newBus._id}`, { method: 'DELETE' });
    console.log('Deleted test bus');

    console.log('\n--- Route Tests ---');
    const newRoute = await request('/route', {
      method: 'POST',
      body: JSON.stringify({
        routeNumber: 'TEST-R1', startLocation: 'A', endLocation: 'B', distance: 10, estimatedDuration: 20
      })
    });
    console.log('Created route:', newRoute.routeNumber);
    
    const routes = await request('/route');
    console.log('Total routes:', routes.length);
    
    await request(`/route/${newRoute._id}`, { method: 'DELETE' });
    console.log('Deleted test route');

    console.log('\n--- Schedule Generation Test ---');
    const genRes = await request('/schedule/generate', {
      method: 'POST',
      body: JSON.stringify({ date: '2026-05-01' })
    });
    console.log('Generated schedules:', genRes.message);
    
    const schedules = await request('/schedule?date=2026-05-01');
    console.log('Fetched schedules for 2026-05-01:', schedules.length);
    
    if (schedules.length > 0) {
        console.log('Deleting generated schedules for test cleanup...');
        for(let s of schedules) {
             await request(`/schedule/${s._id}`, { method: 'DELETE' });
        }
        console.log('Cleanup done.');
    }

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();
