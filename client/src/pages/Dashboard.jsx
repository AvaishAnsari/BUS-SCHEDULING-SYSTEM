import { useEffect, useState } from 'react';
import { Bus, Route, Calendar, Zap, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getBuses, getRoutes, getSchedules } from '../api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 8, padding: '10px 14px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>{label}</p>
        <p style={{ color: 'var(--cyan)', fontWeight: 700 }}>{payload[0].value} schedules</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats]     = useState({ buses: 0, routes: 0, schedules: 0, peak: 0 });
  const [chartData, setChart] = useState([]);
  const [recent, setRecent]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [buses, routes, schedules] = await Promise.all([getBuses(), getRoutes(), getSchedules()]);
        const peak = schedules.filter(s => s.isPeakHour).length;

        // Chart: schedules per bus
        const busCounts = {};
        buses.forEach(b => (busCounts[b.busNumber] = 0));
        schedules.forEach(s => {
          const num = s.busId?.busNumber;
          if (num) busCounts[num] = (busCounts[num] || 0) + 1;
        });
        const chart = Object.entries(busCounts).map(([bus, count]) => ({ bus, count }));

        setStats({ buses: buses.length, routes: routes.length, schedules: schedules.length, peak });
        setChart(chart);
        setRecent(schedules.slice(0, 8));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /><span>Loading dashboard…</span></div>;

  const STAT_CARDS = [
    { label: 'Total Buses', value: stats.buses, icon: Bus, color: 'cyan' },
    { label: 'Total Routes', value: stats.routes, icon: Route, color: 'purple' },
    { label: 'Schedules', value: stats.schedules, icon: Calendar, color: 'green' },
    { label: 'Peak Slots', value: stats.peak, icon: Zap, color: 'orange' },
  ];

  const BAR_COLORS = ['#00d4ff', '#a855f7', '#22d3a0', '#fb923c', '#f87171'];

  const statusColor = { Scheduled: 'cyan', 'In Transit': 'purple', Completed: 'green', Cancelled: 'red' };

  return (
    <>
      {/* Stat Cards */}
      <div className="stat-grid">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`stat-card ${color}`}>
            <div className={`stat-icon ${color}`}><Icon size={20} /></div>
            <div>
              <div className="stat-label">{label}</div>
              <div className="stat-value">{value}</div>
              <div className="stat-change">Across all routes</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Bar Chart */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp size={18} style={{ color: 'var(--cyan)' }} />
            <span className="section-title" style={{ margin: 0 }}>Bus Usage Frequency</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,115,160,0.1)" />
                <XAxis dataKey="bus" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,212,255,0.05)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <p>No schedule data yet.<br />Generate a schedule to see analytics.</p>
            </div>
          )}
        </div>

        {/* Recent Schedules */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} style={{ color: 'var(--purple)' }} />
            <span className="section-title" style={{ margin: 0 }}>Recent Schedules</span>
          </div>
          {recent.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recent.map(s => (
                <div key={s._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-hover)', borderRadius: 8, gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.routeId?.startLocation} → {s.routeId?.endLocation}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Bus {s.busId?.busNumber}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div className="font-mono" style={{ fontSize: 13, color: 'var(--cyan)', fontWeight: 600 }}>{s.departureTime}</div>
                    {s.isPeakHour && <span className="badge badge-orange" style={{ fontSize: 10 }}>Peak</span>}
                  </div>
                  <span className={`badge badge-${statusColor[s.status] || 'gray'}`} style={{ flexShrink: 0 }}>{s.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <p>No schedules yet.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
