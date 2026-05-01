import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

// ─── Buses ────────────────────────────────────────────────────────────
export const getBuses   = ()       => api.get('/bus').then(r => r.data);
export const createBus  = (data)   => api.post('/bus', data).then(r => r.data);
export const updateBus  = (id, d)  => api.put(`/bus/${id}`, d).then(r => r.data);
export const deleteBus  = (id)     => api.delete(`/bus/${id}`).then(r => r.data);

// ─── Routes ───────────────────────────────────────────────────────────
export const getRoutes   = ()       => api.get('/route').then(r => r.data);
export const createRoute = (data)   => api.post('/route', data).then(r => r.data);
export const updateRoute = (id, d)  => api.put(`/route/${id}`, d).then(r => r.data);
export const deleteRoute = (id)     => api.delete(`/route/${id}`).then(r => r.data);

// ─── Schedules ────────────────────────────────────────────────────────
export const getSchedules    = (params) => api.get('/schedule', { params }).then(r => r.data);
export const createSchedule  = (data)   => api.post('/schedule', data).then(r => r.data);
export const deleteSchedule  = (id)     => api.delete(`/schedule/${id}`).then(r => r.data);
export const generateSchedule = (date)  => api.post('/schedule/generate', { date }).then(r => r.data);
