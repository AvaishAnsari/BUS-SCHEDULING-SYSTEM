import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, MapPin, X, ArrowRight } from 'lucide-react';
import { getRoutes, createRoute, updateRoute, deleteRoute } from '../api';
import { toast } from '../components/Toast';

const EMPTY_FORM = { routeNumber: '', startLocation: '', endLocation: '', distance: '', estimatedDuration: '', stops: '' };

const MAX_DIST = 100; // km — for distance bar scaling

function RouteModal({ route, onClose, onSave }) {
  const [form, setForm] = useState(route ? {
    routeNumber: route.routeNumber, startLocation: route.startLocation,
    endLocation: route.endLocation, distance: route.distance,
    estimatedDuration: route.estimatedDuration,
    stops: route.stops?.join(', ') || '',
  } : EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function submit(e) {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const payload = {
        ...form,
        distance: Number(form.distance),
        estimatedDuration: Number(form.estimatedDuration),
        stops: form.stops ? form.stops.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      const saved = route ? await updateRoute(route._id, payload) : await createRoute(payload);
      toast(route ? 'Route updated!' : 'Route created!', 'success');
      onSave(saved, !!route);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally { setLoading(false); }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <h2 className="modal-title">{route ? 'Edit Route' : 'Add New Route'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="form-grid form-grid-3" style={{ marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label">Route Number *</label>
              <input className="form-input" value={form.routeNumber} onChange={e => set('routeNumber', e.target.value)} placeholder="e.g. R-05" required />
            </div>
            <div className="form-group">
              <label className="form-label">Distance (km) *</label>
              <input className="form-input" type="number" min="0" step="0.1" value={form.distance} onChange={e => set('distance', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (min) *</label>
              <input className="form-input" type="number" min="1" value={form.estimatedDuration} onChange={e => set('estimatedDuration', e.target.value)} required />
            </div>
          </div>
          <div className="form-grid form-grid-2" style={{ marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label">Start Location *</label>
              <input className="form-input" value={form.startLocation} onChange={e => set('startLocation', e.target.value)} placeholder="e.g. Central Station" required />
            </div>
            <div className="form-group">
              <label className="form-label">End Location *</label>
              <input className="form-input" value={form.endLocation} onChange={e => set('endLocation', e.target.value)} placeholder="e.g. Airport" required />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Stops (comma-separated)</label>
            <input className="form-input" value={form.stops} onChange={e => set('stops', e.target.value)} placeholder="e.g. City Mall, Tech Park, Terminal 1" />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Saving…</> : 'Save Route'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Routes() {
  const [routes, setRoutes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);

  useEffect(() => { getRoutes().then(setRoutes).finally(() => setLoading(false)); }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this route?')) return;
    try {
      await deleteRoute(id);
      setRoutes(prev => prev.filter(r => r._id !== id));
      toast('Route deleted.', 'info');
    } catch (err) { toast(err.response?.data?.message || 'Delete failed.', 'error'); }
  }

  function handleSave(saved, isEdit) {
    setRoutes(prev => isEdit ? prev.map(r => r._id === saved._id ? saved : r) : [saved, ...prev]);
    setModal(null);
  }

  if (loading) return <div className="loading-center"><div className="spinner" /><span>Loading routes…</span></div>;

  return (
    <>
      <div className="page-actions">
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{routes.length} route{routes.length !== 1 ? 's' : ''} configured</div>
        <button className="btn btn-primary" id="add-route-btn" onClick={() => setModal('add')}>
          <Plus size={16} /> Add Route
        </button>
      </div>

      {routes.length === 0 ? (
        <div className="empty-state">
          <MapPin size={48} />
          <p style={{ marginTop: 12, fontSize: 16, fontWeight: 600 }}>No routes yet</p>
          <p style={{ marginTop: 4 }}>Add your first route to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {routes.map(route => {
            const barWidth = Math.min((route.distance / MAX_DIST) * 100, 100);
            return (
              <div key={route._id} className="card" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <span className="badge badge-purple" style={{ fontSize: 12 }}>{route.routeNumber}</span>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(route)}><Pencil size={13} /></button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(route._id)}><Trash2 size={13} /></button>
                  </div>
                </div>

                <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                  <MapPin size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{route.startLocation}</span>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{route.endLocation}</span>
                </div>

                <div className="distance-bar-bg" style={{ marginBottom: 12 }}>
                  <div className="distance-bar" style={{ width: `${barWidth}%` }} />
                </div>

                <div className="flex gap-3" style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: route.stops?.length ? 10 : 0 }}>
                  <span>📍 {route.distance} km</span>
                  <span>⏱ {route.estimatedDuration} min</span>
                </div>

                {route.stops?.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stops</div>
                    <div className="flex" style={{ flexWrap: 'wrap', gap: 4 }}>
                      {route.stops.map((stop, i) => (
                        <span key={i} className="badge badge-gray" style={{ fontSize: 11 }}>{stop}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <RouteModal
          route={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
