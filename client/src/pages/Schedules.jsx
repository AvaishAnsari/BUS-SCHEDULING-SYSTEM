import { useEffect, useState } from 'react';
import { Zap, Trash2, Plus, X, Calendar, Filter } from 'lucide-react';
import { getSchedules, createSchedule, deleteSchedule, generateSchedule, getBuses, getRoutes } from '../api';
import { toast } from '../components/Toast';

const STATUS_COLOR = { Scheduled: 'cyan', 'In Transit': 'purple', Completed: 'green', Cancelled: 'red' };

function AddScheduleModal({ buses, routes, onClose, onSave }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ busId: '', routeId: '', departureTime: '', date: today });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function submit(e) {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const saved = await createSchedule(form);
      toast('Schedule created!', 'success');
      onSave(saved);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally { setLoading(false); }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add Schedule</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="form-grid" style={{ gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Bus *</label>
              <select className="form-select" value={form.busId} onChange={e => set('busId', e.target.value)} required>
                <option value="">Select bus…</option>
                {buses.map(b => <option key={b._id} value={b._id}>{b.busNumber} ({b.type})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Route *</label>
              <select className="form-select" value={form.routeId} onChange={e => set('routeId', e.target.value)} required>
                <option value="">Select route…</option>
                {routes.map(r => <option key={r._id} value={r._id}>{r.routeNumber}: {r.startLocation} → {r.endLocation}</option>)}
              </select>
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Departure Time *</label>
                <input className="form-input" type="time" value={form.departureTime} onChange={e => set('departureTime', e.target.value)} required />
              </div>
            </div>
          </div>
          {error && <p className="error-msg mt-2">{error}</p>}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Saving…</> : 'Create Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses]         = useState([]);
  const [routes, setRoutes]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [generating, setGen]      = useState(false);
  const [modal, setModal]         = useState(false);
  const [filterRoute, setFR]      = useState('');
  const [filterDate, setFD]       = useState('');
  const [filterPeak, setFP]       = useState('');
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    Promise.all([getSchedules(), getBuses(), getRoutes()])
      .then(([s, b, r]) => { setSchedules(s); setBuses(b); setRoutes(r); })
      .finally(() => setLoading(false));
  }, []);

  async function handleGenerate() {
    const date = filterDate || today;
    if (!confirm(`Generate full schedule for ${date}? This will replace existing schedules for that date.`)) return;
    setGen(true);
    try {
      const res = await generateSchedule(date);
      toast(`✅ ${res.message}`, 'success');
      // Reload all schedules
      const fresh = await getSchedules();
      setSchedules(fresh);
    } catch (err) {
      toast(err.response?.data?.message || 'Generation failed.', 'error');
    } finally { setGen(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this schedule?')) return;
    try {
      await deleteSchedule(id);
      setSchedules(prev => prev.filter(s => s._id !== id));
      toast('Schedule deleted.', 'info');
    } catch (err) { toast(err.response?.data?.message || 'Delete failed.', 'error'); }
  }

  function handleSave(saved) {
    setSchedules(prev => [saved, ...prev]);
    setModal(false);
  }

  const filtered = schedules.filter(s => {
    if (filterRoute && s.routeId?._id !== filterRoute) return false;
    if (filterDate  && s.date !== filterDate) return false;
    if (filterPeak === 'peak'    && !s.isPeakHour) return false;
    if (filterPeak === 'offpeak' && s.isPeakHour)  return false;
    return true;
  });

  if (loading) return <div className="loading-center"><div className="spinner" /><span>Loading schedules…</span></div>;

  return (
    <>
      <div className="page-actions">
        <div className="filter-row">
          <input
            className="form-input input-sm" type="date"
            value={filterDate} onChange={e => setFD(e.target.value)}
            style={{ width: 160 }}
          />
          <select className="form-select input-sm" value={filterRoute} onChange={e => setFR(e.target.value)} style={{ width: 220 }}>
            <option value="">All Routes</option>
            {routes.map(r => <option key={r._id} value={r._id}>{r.routeNumber}: {r.startLocation} → {r.endLocation}</option>)}
          </select>
          <select className="form-select input-sm" value={filterPeak} onChange={e => setFP(e.target.value)} style={{ width: 140 }}>
            <option value="">All Hours</option>
            <option value="peak">Peak Only</option>
            <option value="offpeak">Off-Peak Only</option>
          </select>
          {(filterRoute || filterDate || filterPeak) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setFR(''); setFD(''); setFP(''); }}>
              <X size={13} /> Clear
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" id="add-schedule-btn" onClick={() => setModal(true)}>
            <Plus size={15} /> Manual
          </button>
          <button className="btn btn-purple" id="generate-schedule-btn" onClick={handleGenerate} disabled={generating}>
            {generating ? <><div className="spinner" style={{ width: 14, height: 14, borderTopColor: '#fff' }} /> Generating…</> : <><Zap size={15} /> Generate Schedule</>}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>
        Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> of {schedules.length} schedules
        {filtered.filter(s => s.isPeakHour).length > 0 && (
          <span style={{ marginLeft: 10 }}>
            · <span className="peak-glow" style={{ fontSize: 12 }}>⚡ {filtered.filter(s => s.isPeakHour).length} peak-hour slots</span>
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} />
          <p style={{ marginTop: 12, fontSize: 16, fontWeight: 600 }}>No schedules found</p>
          <p style={{ marginTop: 4 }}>Click <strong>Generate Schedule</strong> to auto-create a full day timetable.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Route</th>
                <th>Bus</th>
                <th>Date</th>
                <th>Departure</th>
                <th>Arrival</th>
                <th>Peak</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s._id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {s.routeId?.startLocation} <span style={{ color: 'var(--text-muted)' }}>→</span> {s.routeId?.endLocation}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.routeId?.routeNumber}</div>
                  </td>
                  <td>
                    <span className="font-mono" style={{ color: 'var(--cyan)', fontWeight: 600 }}>{s.busId?.busNumber}</span>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.busId?.type}</div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{s.date}</td>
                  <td>
                    <span className="font-mono" style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{s.departureTime}</span>
                  </td>
                  <td>
                    <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{s.arrivalTime}</span>
                  </td>
                  <td>
                    {s.isPeakHour
                      ? <span className="badge badge-orange">⚡ Peak</span>
                      : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Off-peak</span>}
                  </td>
                  <td><span className={`badge badge-${STATUS_COLOR[s.status] || 'gray'}`}>{s.status}</span></td>
                  <td>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(s._id)}><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <AddScheduleModal
          buses={buses} routes={routes}
          onClose={() => setModal(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
