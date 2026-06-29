import React, { useState } from 'react';
import { PlusCircle, Edit, Trash2, X, Check, Rocket, AlertCircle } from 'lucide-react';
import { createDeployment, updateDeployment, deleteDeployment } from '../supabaseService';
import ImportExportBar from './ImportExportBar';

const SECTORS = ['FinTech','AgriTech','HealthTech','EdTech','CleanTech','LogisTech','D2C','SaaS','DeepTech','Other'];
const INSTRUMENTS = ['CCPS','Equity','NCD','CCD','Preference Shares','Debentures','Other'];
const STAGES = ['Pre-Seed','Seed','Pre-Series A','Series A','Series B','Series C','Growth'];

const empty = () => ({
  portfolio_company: '', sector: 'FinTech', amount_deployed_cr: '',
  investment_date: new Date().toISOString().slice(0, 10),
  instrument: 'CCPS', stage: 'Series A', co_investor: '', irr_target: '', remarks: ''
});

function DeploymentsView({ records, onSuccess, formatDate }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const totalDeployed = records.reduce((s, r) => s + Number(r.amount_deployed_cr || 0), 0);

  const openAdd = () => { setForm(empty()); setEditingId(null); setError(null); setShowForm(true); };
  const openEdit = (r) => { setForm({ ...r }); setEditingId(r.id); setError(null); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingId(null); setError(null); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null); setSaving(true);
    try {
      if (editingId) { await updateDeployment(editingId, form); onSuccess('Deployment updated.'); }
      else { await createDeployment(form); onSuccess('Deployment added.'); }
      closeForm();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete deployment for "${name}"?`)) return;
    try { await deleteDeployment(id); onSuccess(`${name} deleted.`); }
    catch (err) { alert('Error: ' + err.message); }
  };

  // Sector breakdown
  const sectorMap = {};
  records.forEach(r => { sectorMap[r.sector || 'Other'] = (sectorMap[r.sector || 'Other'] || 0) + Number(r.amount_deployed_cr || 0); });

  return (
    <div className="form-layout animate-fade-in">
      <ImportExportBar moduleId="deployments" onCreate={createDeployment} onDone={onSuccess} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div className="glass-card" style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Deployed</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-primary)', marginTop: '0.2rem' }}>₹{totalDeployed.toFixed(2)} Cr</div>
          </div>
          <div className="glass-card" style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Portfolio Companies</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>{records.length}</div>
          </div>
          <div className="glass-card" style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sectors</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-accent)', marginTop: '0.2rem' }}>{Object.keys(sectorMap).length}</div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={16} /> Add Investment
        </button>
      </div>

      {showForm && (
        <div className="glass-card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
              <Rocket size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              {editingId ? 'Edit Investment' : 'New Portfolio Investment'}
            </h3>
            <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>
          {error && <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><AlertCircle size={16} />{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Portfolio Company *</label><input className="form-input" required value={form.portfolio_company} onChange={e => setForm({ ...form, portfolio_company: e.target.value })} placeholder="Company Name" /></div>
              <div className="form-group"><label className="form-label">Sector</label><select className="form-input" value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })}>{SECTORS.map(s => <option key={s}>{s}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Amount Deployed (₹ Cr) *</label><input className="form-input" type="number" step="0.01" required value={form.amount_deployed_cr} onChange={e => setForm({ ...form, amount_deployed_cr: e.target.value })} placeholder="15.00" /></div>
              <div className="form-group"><label className="form-label">Investment Date</label><input className="form-input" type="date" value={form.investment_date} onChange={e => setForm({ ...form, investment_date: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Instrument</label><select className="form-input" value={form.instrument} onChange={e => setForm({ ...form, instrument: e.target.value })}>{INSTRUMENTS.map(i => <option key={i}>{i}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Stage</label><select className="form-input" value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>{STAGES.map(s => <option key={s}>{s}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Co-Investor</label><input className="form-input" value={form.co_investor} onChange={e => setForm({ ...form, co_investor: e.target.value })} placeholder="e.g. XYZ Capital" /></div>
              <div className="form-group"><label className="form-label">IRR Target (%)</label><input className="form-input" type="number" step="0.01" value={form.irr_target} onChange={e => setForm({ ...form, irr_target: e.target.value })} placeholder="22" /></div>
              <div className="form-group full-width"><label className="form-label">Remarks</label><input className="form-input" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} placeholder="Notes" /></div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={closeForm}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}><Check size={16} /> {saving ? 'Saving...' : (editingId ? 'Update' : 'Add Investment')}</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card" style={{ padding: 0 }}>
        <div className="records-table-container">
          <table className="records-table">
            <thead>
              <tr>
                <th>Portfolio Company</th><th>Sector</th><th style={{ textAlign: 'right' }}>Amount (₹ Cr)</th>
                <th>Date</th><th>Instrument</th><th>Stage</th><th>Co-Investor</th>
                <th style={{ textAlign: 'right' }}>IRR Target</th><th>Remarks</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No portfolio investments yet.</td></tr>
              ) : records.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: '600' }}>{r.portfolio_company}</td>
                  <td><span style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--color-accent)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>{r.sector}</span></td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--color-primary)' }}>₹{Number(r.amount_deployed_cr).toFixed(2)} Cr</td>
                  <td>{formatDate(r.investment_date)}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{r.instrument}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{r.stage}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{r.co_investor || '—'}</td>
                  <td style={{ textAlign: 'right', fontWeight: '600', color: 'var(--color-success)' }}>{r.irr_target ? `${r.irr_target}%` : '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{r.remarks || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="icon-btn edit-btn" onClick={() => openEdit(r)}><Edit size={14} /></button>
                      <button className="icon-btn" onClick={() => handleDelete(r.id, r.portfolio_company)} style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {records.length > 0 && (
              <tfoot>
                <tr style={{ borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                  <td colSpan={2} style={{ fontWeight: '700', padding: '0.85rem 1rem' }}>Total Deployed</td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--color-primary)', padding: '0.85rem 1rem' }}>₹{totalDeployed.toFixed(2)} Cr</td>
                  <td colSpan={7}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

export default DeploymentsView;
