import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Landmark, TrendingUp, Rocket, Users, Target, AlertCircle, Coins, PlusCircle } from 'lucide-react';

const fmtCr = (v) => `₹${Number(v || 0).toFixed(2)} Cr`;
const fmtPct = (v) => `${(Number(v || 0) * 100).toFixed(1)}%`;

const SECTOR_COLORS = ['var(--color-primary)','var(--color-success)','var(--color-accent)','var(--color-warning)','#06b6d4','#ec4899','#84cc16'];

function KPICard({ label, value, sub, icon: Icon, color = 'var(--color-primary)', accent }) {
  return (
    <div className="glass-card metric-card" style={accent ? { borderLeft: `3px solid ${color}` } : {}}>
      <div className="metric-header">
        <span className="metric-label">{label}</span>
        <div className="metric-icon-wrapper" style={{ color, background: `${color}20` }}>
          <Icon size={20} />
        </div>
      </div>
      <span className="metric-value" style={accent ? { color, background: `linear-gradient(to right, ${color}, white)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}}>
        {value}
      </span>
      {sub && <div className="metric-footer" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{sub}</div>}
    </div>
  );
}

function DashboardView({ data, onAddClick }) {
  if (!data || !data.hasData) {
    return (
      <div className="glass-card animate-fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
        <Coins size={48} style={{ color: 'var(--color-primary)', marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>No Data Yet</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
          Start by adding bank balances, MF holdings, investors, and deployments using the sidebar tabs.
        </p>
        <button onClick={onAddClick} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={16} /> Add Bank Entry
        </button>
      </div>
    );
  }

  const {
    corpusCr, totalCashCr, totalMFCr, totalCCECr, totalDeployedCr,
    investorCount, pipelineCount, confirmedPipelineCr,
    deploymentPct, bankSummary, mfSummary, pipelineFunnel,
    sectorAllocation, kycCompleted, kycPending, overdueCount, overdueCr, totalPending,
    config
  } = data;

  // CCE Allocation Pie
  const cceAllocation = [
    { name: 'Cash & Bank', value: totalCashCr, color: 'var(--color-primary)' },
    { name: 'Mutual Funds', value: totalMFCr, color: 'var(--color-success)' },
  ].filter(d => d.value > 0);

  // Pipeline funnel for bar chart (top 8)
  const funnelChartData = pipelineFunnel.filter(f => f.count > 0 || f.commitment_cr > 0).slice(0, 8);

  return (
    <div className="form-layout animate-fade-in">

      {/* ── Row 1: 4 Top KPIs ── */}
      <div className="metrics-grid">
        <KPICard label="Fund Corpus" value={fmtCr(corpusCr)} sub={`SEBI Cat-II AIF`} icon={Target} color="var(--color-accent)" />
        <KPICard label="Total CCE" value={fmtCr(totalCCECr)} sub={`Cash ₹${totalCashCr.toFixed(2)}Cr + MF ₹${totalMFCr.toFixed(2)}Cr`} icon={Coins} color="var(--color-primary)" accent />
        <KPICard label="Total Deployed" value={fmtCr(totalDeployedCr)} sub={`${fmtPct(deploymentPct)} of corpus`} icon={Rocket} color="var(--color-success)" />
        <KPICard label="Investors" value={investorCount} sub={`${kycCompleted} KYC done · ${kycPending} pending`} icon={Users} color="var(--color-warning)" />
      </div>

      {/* ── Row 2: 4 More KPIs ── */}
      <div className="metrics-grid">
        <KPICard label="Cash & Bank" value={fmtCr(totalCashCr)} sub={`${bankSummary.length} accounts`} icon={Landmark} color="var(--color-primary)" />
        <KPICard label="MF Portfolio" value={fmtCr(totalMFCr)} sub={`${mfSummary.length} schemes`} icon={TrendingUp} color="var(--color-success)" />
        <KPICard label="Outstanding Calls" value={fmtCr(totalPending)} sub={overdueCount > 0 ? `⚠ ${overdueCount} overdue` : 'All on track'} icon={AlertCircle} color={overdueCount > 0 ? 'var(--color-danger)' : 'var(--color-success)'} />
        <KPICard label="Pipeline Confirmed" value={fmtCr(confirmedPipelineCr)} sub={`${pipelineCount} total in pipeline`} icon={Users} color="var(--color-accent)" />
      </div>

      {/* ── Row 3: Charts ── */}
      <div className="charts-grid">
        {/* CCE Allocation Donut */}
        <div className="glass-card">
          <div className="chart-title"><span>CCE Asset Allocation</span></div>
          {cceAllocation.length > 0 ? (
            <>
              <div style={{ width: '100%', height: 220, position: 'relative' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={cceAllocation} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="value">
                      {cceAllocation.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-main)', borderColor: 'var(--border-color)', borderRadius: '8px' }} formatter={v => [fmtCr(v), '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total CCE</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>₹{totalCCECr.toFixed(1)} Cr</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.82rem' }}>
                {cceAllocation.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                    </div>
                    <span style={{ fontWeight: '600' }}>{fmtCr(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>No CCE data yet.</div>}
        </div>

        {/* Sector Deployment Donut */}
        <div className="glass-card">
          <div className="chart-title"><span>Deployment by Sector</span></div>
          {sectorAllocation.length > 0 ? (
            <>
              <div style={{ width: '100%', height: 220, position: 'relative' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={sectorAllocation} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                      {sectorAllocation.map((e, i) => <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-main)', borderColor: 'var(--border-color)', borderRadius: '8px' }} formatter={v => [`₹${v.toFixed(2)} Cr`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Deployed</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>₹{totalDeployedCr.toFixed(1)} Cr</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.78rem' }}>
                {sectorAllocation.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: SECTOR_COLORS[i % SECTOR_COLORS.length] }} />
                    <span>{item.sector}: ₹{item.value.toFixed(1)} Cr</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>No deployments yet.</div>}
        </div>
      </div>

      {/* ── Row 4: Detail Tables ── */}
      <div className="details-grid">
        {/* Bank Balances */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Cash & Bank Balances</h3>
          <table className="detail-table">
            <thead><tr><th>Bank / Account</th><th>Type</th><th style={{ textAlign: 'right' }}>Balance (₹ Cr)</th></tr></thead>
            <tbody>
              {bankSummary.length === 0 ? <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data</td></tr>
                : bankSummary.map((b, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: '500' }}>{b.bank_name}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{b.account_type}</td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--color-success)' }}>₹{Number(b.balance_cr).toFixed(2)}</td>
                  </tr>
                ))}
              <tr className="row-total"><td>Total</td><td></td><td style={{ textAlign: 'right' }}>{fmtCr(totalCashCr)}</td></tr>
            </tbody>
          </table>
        </div>

        {/* MF Holdings */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>MF Holdings</h3>
          <table className="detail-table">
            <thead><tr><th>Scheme</th><th style={{ textAlign: 'right' }}>NAV (₹)</th><th style={{ textAlign: 'right' }}>Value (₹ Cr)</th></tr></thead>
            <tbody>
              {mfSummary.length === 0 ? <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data</td></tr>
                : mfSummary.map((m, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: '500', fontSize: '0.85rem' }}>{m.scheme_name}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>₹{Number(m.latest_nav).toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--color-success)' }}>₹{Number(m.market_value_cr).toFixed(4)}</td>
                  </tr>
                ))}
              <tr className="row-total"><td>Total</td><td></td><td style={{ textAlign: 'right' }}>{fmtCr(totalMFCr)}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Pipeline Funnel */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Investor Pipeline Funnel</h3>
          {funnelChartData.length > 0 ? (
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="stage" fontSize={9} stroke="var(--text-secondary)" tick={{ fontSize: 9 }} />
                  <YAxis fontSize={10} stroke="var(--text-secondary)" />
                  <Tooltip contentStyle={{ background: 'var(--bg-main)', borderColor: 'var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }} />
                  <Bar dataKey="count" name="Investors" fill="var(--color-primary)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No pipeline data yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardView;
