import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Bus, Route as RouteIcon, Calendar, LayoutDashboard, Zap } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Buses from './pages/Buses';
import RoutesPage from './pages/Routes';
import Schedules from './pages/Schedules';
import { ToastContainer } from './components/Toast';

const NAV = [
  { to: '/',          label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/buses',     label: 'Buses',      icon: Bus },
  { to: '/routes',    label: 'Routes',     icon: RouteIcon },
  { to: '/schedules', label: 'Schedules',  icon: Calendar },
];

const PAGE_META = {
  '/':          { title: 'Dashboard',  sub: 'System overview & analytics' },
  '/buses':     { title: 'Bus Fleet',  sub: 'Manage all buses in the system' },
  '/routes':    { title: 'Routes',     sub: 'Configure and manage bus routes' },
  '/schedules': { title: 'Schedules',  sub: 'View and generate bus timetables' },
};

function Layout() {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] || { title: 'BusSync', sub: '' };
  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Zap size={22} />
          <div>
            <div className="logo-text">BusSync</div>
            <div className="logo-sub">Smart Scheduler</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-label">Navigation</div>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="status-dot">
            <div className="dot" />
            System Online
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <div>
            <div className="topbar-title">{meta.title}</div>
            <div className="topbar-sub">{meta.sub}</div>
          </div>
          <div className="flex items-center gap-3" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </header>
        <div className="page-content">
          <Routes>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/buses"     element={<Buses />} />
            <Route path="/routes"    element={<RoutesPage />} />
            <Route path="/schedules" element={<Schedules />} />
          </Routes>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
