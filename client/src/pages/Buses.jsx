import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Bus as BusIcon, X } from 'lucide-react';
import { getBuses, createBus, updateBus, deleteBus } from '../api';
import { toast } from '../components/Toast';

const BUS_TYPES = ['Standard', 'Express', 'Mini', 'Double Decker'];

const TYPE_COLOR = { Standard: 'cyan', Express: 'purple', Mini: 'green', 'Double Decker': 'orange' };

const EMPTY_FORM = { busNumber: '', capacity: '', type: 'Standard', isActive: true };

function BusModal({ bus, onClose, onSave }) {
  const [form, setForm] = useState(bus ? { busNumber: bus.busNumber, capacity: bus.capacity, type: bus.type, isActive: bus.isActive } : EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = { ...form, capacity: Number(form.capacity) };
      const saved = bus ? await updateBus(bus._id, payload) : await createBus(payload);
      toast(bus ? 'Bus updated!' : 'Bus created!', 'success');
      onSave(saved, !!bus);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{bus ? 'Edit Bus' : 'Add New Bus'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="form-grid form-grid-2" style={{ marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label">Bus Number *</label>
              <input className="form-input" value={form.busNumber} onChange={e => set('busNumber', e.target.value)} placeholder="e.g. BUS-006" required />
            </div>
            <div className="form-group">
              <label className="form-label">Capacity *</label>
              <input className="form-input" type="number" min="1" value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="e.g. 50" required />
            </div>
          </div>
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
                {BUS_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.isActive} onChange={e => set('isActive', e.target.value === 'true')}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          {error && <p className="error-msg mt-2">{error}</p>}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Saving…</> : 'Save Bus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Buses() {
  const [buses, setBuses]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(null); // null | 'add' | bus object

  useEffect(() => {
    getBuses().then(setBuses).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this bus?')) return;
    try {
      await deleteBus(id);
      setBuses(prev => prev.filter(b => b._id !== id));
      toast('Bus deleted.', 'info');
    } catch (err) {
      toast(err.response?.data?.message || 'Delete failed.', 'error');
    }
  }

  function handleSave(saved, isEdit) {
    setBuses(prev => isEdit ? prev.map(b => b._id === saved._id ? saved : b) : [saved, ...prev]);
    setModal(null);
  }

  if (loading) return <div className="loading-center"><div className="spinner" /><span>Loading buses…</span></div>;

  return (
    <>
      <div className="page-actions">
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{buses.length} bus{buses.length !== 1 ? 'es' : ''} registered</div>
        </div>
        <button className="btn btn-primary" id="add-bus-btn" onClick={() => setModal('add')}>
          <Plus size={16} /> Add Bus
        </button>
      </div>

      {buses.length === 0 ? (
        <div className="empty-state">
          <BusIcon size={48} />
          <p style={{ marginTop: 12, fontSize: 16, fontWeight: 600 }}>No buses yet</p>
          <p style={{ marginTop: 4 }}>Add your first bus to get started.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Bus Number</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Added</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {buses.map(bus => (
                <tr key={bus._id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <BusIcon size={14} style={{ color: 'var(--cyan)' }} />
                      <span className="font-mono" style={{ fontWeight: 600 }}>{bus.busNumber}</span>
                    </div>
                  </td>
                  <td><span className={`badge badge-${TYPE_COLOR[bus.type] || 'gray'}`}>{bus.type}</span></td>
                  <td>{bus.capacity} seats</td>
                  <td>
                    <span className={`badge ${bus.isActive ? 'badge-green' : 'badge-red'}`}>
                      {bus.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{new Date(bus.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-sm btn-icon" title="Edit" onClick={() => setModal(bus)}><Pencil size={14} /></button>
                      <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={() => handleDelete(bus._id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <BusModal
          bus={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
