import React, { useState } from 'react';
import { PlusCircle, Edit, Trash2, X, Check, Briefcase, AlertCircle } from 'lucide-react';
import { createMFHolding, updateMFHolding, deleteMFHolding } from '../supabaseService';
import ImportExportBar from './ImportExportBar';

const empty = () => ({
  scheme_name: '', amc: '', units_held: '', latest_nav: '', cost_cr: '',
  nav_date: new Date().toISOString().slice(0, 10), isin: '', remarks: ''
});

function MFHoldingsView({ records, onSuccess, formatDate }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const totalMV = records.reduce((s, r) => s + Number(r.market_value_cr || 0), 0);
  const totalCost = records.reduce((s, r) => s + Number(r.cost_cr || 0), 0);
  const totalGL = totalMV - totalCost;

  const liveValue = (f) => {
    const u = Number(f.units_held || 0), n = Number(f.latest_nav || 0);
    return u > 0 && n > 0 ? (u * n / 10000000).toFixed(4) : null;
  };

  const openAdd = () => { setForm(empty()); setEditingId(null); setError(null); setShowForm(true); };
  const openEdit = (r) => { setForm({ ...r }); setEditingId(r.id); setError(null); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingId(null); setError(null); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null); setSaving(true);
    try {
      if (editingId) { await updateMFHolding(editingId, form); onSuccess('MF holding updated.'); }
      else { await createMFHolding(form); onSuccess('MF holding added.'); }
      closeForm();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete MF holding "${name}"?`)) return;
    try { await deleteMFHolding(id); onSuccess(`${name} deleted.`); }
    catch (err) { alert('Error: ' + err.message); }
  };

  return (
    <div className="form-layout animate-fade-in">
      <ImportExportBar moduleId="mf-holdings" onCreate={createMFHolding} onDone={onSuccess} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total MF Value', val: `₹${totalMV.toFixed(2)} Cr`, color: 'var(--color-success)' },
            { label: 'Total Cost', val: `₹${totalCost.toFixed(2)} Cr`, color: 'var(--text-primary)' },
            { label: 'Unrealised G/L', val: `${totalGL >= 0 ? '+' : ''}₹${totalGL.toFixed(2)} Cr`, color: totalGL >= 0 ? 'var(--color-success)' : 'var(--color-danger)' },
          ].map(({ label, val, color }) => (
            <div key={label} className="glass-card" style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color, marginTop: '0.2rem' }}>{val}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={16} /> Add MF Holding
        </button>
      </div>

      {showForm && (
        <div className="glass-card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
              <Briefcase size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              {editingId ? 'Edit MF Holding' : 'Add MF Holding'}
            </h3>
            <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>
          {error && <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><AlertCircle size={16} />{error}</div>}
          {liveValue(form) && (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--color-success)' }}>
              Live Market Value = {Number(form.units_held).toLocaleString('en-IN')} units × ₹{Number(form.latest_nav).toFixed(2)} NAV = <strong>₹{liveValue(form)} Cr</strong>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Scheme Name *</label><input className="form-input" required value={form.scheme_name} onChange={e => setForm({ ...form, scheme_name: e.target.value })} placeholder="HDFC Liquid Fund – Growth" /></div>
              <div className="form-group"><label className="form-label">AMC</label><input className="form-input" value={form.amc} onChange={e => setForm({ ...form, amc: e.target.value })} placeholder="HDFC AMC" /></div>
              <div className="form-group"><label className="form-label">Units Held *</label><input className="form-input" type="number" step="0.001" required value={form.units_held} onChange={e => setForm({ ...form, units_held: e.target.value })} placeholder="125000" /></div>
              <div className="form-group"><label className="form-label">Latest NAV (₹) *</label><input className="form-input" type="number" step="0.0001" required value={form.latest_nav} onChange={e => setForm({ ...form, latest_nav: e.target.value })} placeholder="3847.52" /></div>
              <div className="form-group"><label className="form-label">Cost (₹ Cr)</label><input className="form-input" type="number" step="0.000001" value={form.cost_cr} onChange={e => setForm({ ...form, cost_cr: e.target.value })} placeholder="45.00" /></div>
              <div className="form-group"><label className="form-label">NAV Date</label><input className="form-input" type="date" value={form.nav_date} onChange={e => setForm({ ...form, nav_date: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">ISIN</label><input className="form-input" value={form.isin} onChange={e => setForm({ ...form, isin: e.target.value })} placeholder="INF179K01VY7" /></div>
              <div className="form-group"><label className="form-label">Remarks</label><input className="form-input" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} placeholder="Liquid parking" /></div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={closeForm}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}><Check size={16} /> {saving ? 'Saving...' : (editingId ? 'Update' : 'Add Holding')}</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card" style={{ padding: 0 }}>
        <div className="records-table-container">
          <table className="records-table">
            <thead>
              <tr>
                <th>Scheme Name</th><th>AMC</th><th style={{ textAlign: 'right' }}>Units</th>
                <th style={{ textAlign: 'right' }}>NAV (₹)</th><th style={{ textAlign: 'right' }}>Market Value (₹ Cr)</th>
                <th style={{ textAlign: 'right' }}>Cost (₹ Cr)</th><th style={{ textAlign: 'right' }}>G/L (₹ Cr)</th>
                <th>NAV Date</th><th>ISIN</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No MF holdings yet.</td></tr>
              ) : records.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: '600' }}>{r.scheme_name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.amc || '—'}</td>
                  <td style={{ textAlign: 'right' }}>{Number(r.units_held).toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right' }}>₹{Number(r.latest_nav).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--color-success)' }}>₹{Number(r.market_value_cr).toFixed(4)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>₹{Number(r.cost_cr || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', color: Number(r.unrealised_gl_cr) >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: '600' }}>
                    {Number(r.unrealised_gl_cr) >= 0 ? '+' : ''}₹{Number(r.unrealised_gl_cr || 0).toFixed(4)}
                  </td>
                  <td>{formatDate(r.nav_date)}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{r.isin || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="icon-btn edit-btn" onClick={() => openEdit(r)}><Edit size={14} /></button>
                      <button className="icon-btn" onClick={() => handleDelete(r.id, r.scheme_name)} style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {records.length > 0 && (
              <tfoot>
                <tr style={{ borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                  <td colSpan={4} style={{ fontWeight: '700', padding: '0.85rem 1rem' }}>Total MF Portfolio</td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--color-success)', padding: '0.85rem 1rem' }}>₹{totalMV.toFixed(4)}</td>
                  <td style={{ textAlign: 'right', padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>₹{totalCost.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '0.85rem 1rem', color: totalGL >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: '700' }}>
                    {totalGL >= 0 ? '+' : ''}₹{totalGL.toFixed(4)}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

export default MFHoldingsView;
