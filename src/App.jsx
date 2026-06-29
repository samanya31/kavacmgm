import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Landmark, TrendingUp, Rocket, Users, Clock, GitBranch, AlertCircle, CheckCircle2, RefreshCw, Sun, Moon, LogOut } from 'lucide-react';
import logo from './assets/logo.png';
import DashboardView from './components/DashboardView';
import CashBankView from './components/CashBankView';
import MFHoldingsView from './components/MFHoldingsView';
import DeploymentsView from './components/DeploymentsView';
import InvestorsView from './components/InvestorsView';
import DrawdownsView from './components/DrawdownsView';
import PipelineView from './components/PipelineView';
import LoginView from './components/LoginView';
import {
  fetchDashboardData,
  fetchCashBank,
  fetchMFHoldings,
  fetchDeployments,
  fetchInvestors,
  fetchDrawdowns,
  fetchPipeline,
} from './supabaseService';
import { supabase } from './supabaseClient';

const NAV = [
  { id: 'dashboard',   label: 'Dashboard',         icon: LayoutDashboard },
  { id: 'cash-bank',   label: 'Cash & Bank',        icon: Landmark },
  { id: 'mf-holdings', label: 'Mutual Funds',       icon: TrendingUp },
  { id: 'deployments', label: 'Portfolio',           icon: Rocket },
  { id: 'investors',   label: 'Investors',           icon: Users },
  { id: 'drawdowns',   label: 'Capital Calls',       icon: Clock },
  { id: 'pipeline',    label: 'Pipeline / CRM',      icon: GitBranch },
];

const TITLES = {
  dashboard:   ['CFO Treasury Dashboard',       'Live fund overview — CCE, deployment, investors & pipeline.'],
  'cash-bank': ['Cash & Bank Balances',          'Manage all bank account balances.'],
  'mf-holdings':['Mutual Fund NAV Tracker',      'Track MF holdings with live NAV market values.'],
  deployments: ['Portfolio Deployment Tracker',  'Record and monitor all fund investments.'],
  investors:   ['Investor Master Register',      'Complete register of all 65 investors with KYC & commitment data.'],
  drawdowns:   ['Capital Call / Drawdown Tracker','Track drawdown notices, due dates, and receipts.'],
  pipeline:    ['Investor Pipeline / CRM',       'Manage your investor funnel from first meeting to fund received.'],
};

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Data state for all modules
  const [dashboardData, setDashboardData] = useState(null);
  const [cashBankRecords, setCashBankRecords] = useState([]);
  const [mfRecords, setMfRecords] = useState([]);
  const [deploymentRecords, setDeploymentRecords] = useState([]);
  const [investorRecords, setInvestorRecords] = useState([]);
  const [drawdownRecords, setDrawdownRecords] = useState([]);
  const [pipelineRecords, setPipelineRecords] = useState([]);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, cb, mf, dep, inv, dd, pipe] = await Promise.all([
        fetchDashboardData(),
        fetchCashBank(),
        fetchMFHoldings(),
        fetchDeployments(),
        fetchInvestors(),
        fetchDrawdowns(),
        fetchPipeline(),
      ]);
      setDashboardData(dash);
      setCashBankRecords(cb);
      setMfRecords(mf);
      setDeploymentRecords(dep);
      setInvestorRecords(inv);
      setDrawdownRecords(dd);
      setPipelineRecords(pipe);
    } catch (err) {
      console.error(err);
      setError('Could not connect to Supabase. Check your .env configuration and ensure all tables exist (run schema.sql).');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session) fetchAll();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) fetchAll();
      else { setDashboardData(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    fetchAll();
    setTimeout(() => setSuccess(null), 5000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--color-primary)' }} />
          <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>Initialising CFO Portal...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={theme === 'light' ? 'light-mode' : ''} style={{ minHeight: '100vh' }}>
        <LoginView />
      </div>
    );
  }

  const [contentTitle, contentSub] = TITLES[activeTab] || ['', ''];

  return (
    <div className={`app-container ${theme === 'light' ? 'light-mode' : ''}`} style={{ maxWidth: '100%', padding: 0 }}>

      {/* ── Header ── */}
      <header className="app-header" style={{ padding: '1.25rem 2rem', borderBottom: '1px solid var(--border-color)' }}>
        <div className="brand-section">
          <div className="brand-logo-container" style={{ padding: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}>
            <img src={logo} alt="Kavachh Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
          </div>
          <div className="brand-title">
            <h1 style={{ fontSize: '1.4rem' }}>MOUNT TECH GROWTH FUND</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>KAVACHH — SEBI CAT-II AIF</p>
          </div>
        </div>

        <div className="header-meta" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: '700', letterSpacing: '0.05em' }}>TREASURY PORTAL • CFO INTERFACE</div>
            <div style={{ fontSize: '0.88rem', color: '#fff', fontWeight: '500' }}>{session.user?.email}</div>
          </div>
          {dashboardData?.hasData && dashboardData?.config && (
            <div className="as-at-badge">
              <CheckCircle2 size={14} />
              <span>Corpus: ₹{dashboardData.corpusCr} Cr</span>
            </div>
          )}
          <button onClick={() => setTheme(p => p === 'dark' ? 'light' : 'dark')} className="theme-toggle-btn" title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '0.45rem 0.85rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', height: '38px', transition: 'var(--transition-fast)' }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      {/* ── Body: Sidebar + Main ── */}
      <div className="app-body">
        <aside className="sidebar">
          <div className="sidebar-section">
            <span className="sidebar-label">Navigation</span>
            <nav className="nav-tabs">
              {NAV.map(({ id, label, icon: Icon }) => (
                <button key={id} className={`tab-btn ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
                  <Icon size={18} /> {label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <div className="main-content-wrapper">
          {/* Notifications */}
          {error && (
            <div className="alert alert-danger animate-fade-in">
              <AlertCircle size={18} /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-success animate-fade-in">
              <CheckCircle2 size={18} /><span>{success}</span>
            </div>
          )}

          {/* Content header */}
          <div className="content-header">
            <div>
              <h2 className="content-title">{contentTitle}</h2>
              <p className="content-subtitle">{contentSub}</p>
            </div>
            <button onClick={fetchAll} className="round-refresh-btn" title="Refresh">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Tab views */}
          <div className="content-body">
            {loading && !dashboardData ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                <RefreshCw className="animate-spin" size={28} style={{ color: 'var(--color-primary)', marginBottom: '1rem' }} />
                <p>Loading fund data...</p>
              </div>
            ) : (
              <>
                {activeTab === 'dashboard'    && <DashboardView data={dashboardData} onAddClick={() => setActiveTab('cash-bank')} />}
                {activeTab === 'cash-bank'    && <CashBankView records={cashBankRecords} onSuccess={showSuccess} formatDate={formatDate} />}
                {activeTab === 'mf-holdings'  && <MFHoldingsView records={mfRecords} onSuccess={showSuccess} formatDate={formatDate} />}
                {activeTab === 'deployments'  && <DeploymentsView records={deploymentRecords} onSuccess={showSuccess} formatDate={formatDate} />}
                {activeTab === 'investors'    && <InvestorsView records={investorRecords} onSuccess={showSuccess} formatDate={formatDate} />}
                {activeTab === 'drawdowns'    && <DrawdownsView records={drawdownRecords} onSuccess={showSuccess} formatDate={formatDate} />}
                {activeTab === 'pipeline'     && <PipelineView records={pipelineRecords} onSuccess={showSuccess} formatDate={formatDate} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
