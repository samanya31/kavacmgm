import React, { useState } from 'react';
import { PlusCircle, Edit, Trash2, X, Check, AlertCircle, Clock } from 'lucide-react';
import { createDrawdown, updateDrawdown, deleteDrawdown } from '../supabaseService';
import ImportExportBar from './ImportExportBar';

const CLASSES = ['Class A', 'Class B', 'Class C', 'Class D'];
const empty = () => ({
  investor_name: '', investor_class: 'Class A', notice_no: '',
  drawdown_amount_cr: '', notice_date: '', due_date: '',
  amount_received_cr: '', receipt_date: '', remarks: ''
});

function DrawdownsView({ records, onSuccess, formatDate }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const totalCalled = records.reduce((s, r) => s + Number(r.drawdown_amount_cr || 0), 0);
  const totalReceived = records.reduce((s, r) => s + Number(r.amount_received_cr || 0), 0);
  const totalPending = records.reduce((s, r) => s + Number(r.balance_pending_cr || 0), 0);
  const today = new Date();
  const overdueCount = records.filter(r => r.due_date && new Date(r.due_date) < today && Number(r.balance_pending_cr || 0) > 0).length;

  const openAdd = () => { setForm(empty()); setEditingId(null); setError(null); setShowForm(true); };
  const openEdit = (r) => { setForm({ ...r }); setEditingId(r.id); setError(null); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingId(null); setError(null); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null); setSaving(true);
    try {
      if (editingId) { await updateDrawdown(editingId, form); onSuccess('Drawdown updated.'); }
      else { await createDrawdown(form); onSuccess('Drawdown notice added.'); }
      closeForm();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete drawdown notice for "${name}"?`)) return;
    try { await deleteDrawdown(id); onSuccess(`Notice for ${name} deleted.`); }
    catch (err) { alert('Error: ' + err.message); }
  };

  const isOverdue = (r) => r.due_date && new Date(r.due_date) < today && Number(r.balance_pending_cr || 0) > 0;

  return (
    <div className="form-layout animate-fade-in">
      <ImportExportBar moduleId="drawdowns" onCreate={createDrawdown} onDone={onSuccess} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Called', val: `₹${totalCalled.toFixed(2)} Cr`, color: 'var(--color-primary)' },
            { label: 'Total Received', val: `₹${totalReceived.toFixed(2)} Cr`, color: 'var(--color-success)' },
            { label: 'Pending', val: `₹${totalPending.toFixed(2)} Cr`, color: 'var(--color-warning)' },
            { label: 'Overdue', val: overdueCount, color: overdueCount > 0 ? 'var(--color-danger)' : 'var(--text-secondary)' },
          ].map(({ label, val, color }) => (
            <div key={label} className="glass-card" style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color, marginTop: '0.2rem' }}>{val}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={16} /> Add Notice
        </button>
      </div>

      {showForm && (
        <div className="glass-card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
              <Clock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              {editingId ? 'Edit Drawdown Notice' : 'New Drawdown Notice'}
            </h3>
            <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>
          {error && <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><AlertCircle size={16} />{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Investor Name *</label><input className="form-input" required value={form.investor_name} onChange={e => setForm({ ...form, investor_name: e.target.value })} placeholder="Investor name" /></div>
              <div className="form-group"><label className="form-label">Investor Class</label><select className="form-input" value={form.investor_class} onChange={e => setForm({ ...form, investor_class: e.target.value })}>{CLASSES.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Notice No.</label><input className="form-input" value={form.notice_no} onChange={e => setForm({ ...form, notice_no: e.target.value })} placeholder="e.g. DD-001" /></div>
              <div className="form-group"><label className="form-label">Drawdown Amount (₹ Cr) *</label><input className="form-input" type="number" step="0.01" required value={form.drawdown_amount_cr} onChange={e => setForm({ ...form, drawdown_amount_cr: e.target.value })} placeholder="5.00" /></div>
              <div className="form-group"><label className="form-label">Notice Date</label><input className="form-input" type="date" value={form.notice_date} onChange={e => setForm({ ...form, notice_date: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Due Date</label><input className="form-input" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Amount Received (₹ Cr)</label><input className="form-input" type="number" step="0.01" value={form.amount_received_cr} onChange={e => setForm({ ...form, amount_received_cr: e.target.value })} placeholder="0.00" /></div>
              <div className="form-group"><label className="form-label">Receipt Date</label><input className="form-input" type="date" value={form.receipt_date} onChange={e => setForm({ ...form, receipt_date: e.target.value })} /></div>
              <div className="form-group full-width"><label className="form-label">Remarks</label><input className="form-input" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} placeholder="Notes" /></div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={closeForm}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}><Check size={16} /> {saving ? 'Saving...' : (editingId ? 'Update' : 'Add Notice')}</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card" style={{ padding: 0 }}>
        <div className="records-table-container">
          <table className="records-table">
            <thead>
              <tr>
                <th>Investor</th><th>Class</th><th>Notice No.</th>
                <th style={{ textAlign: 'right' }}>Called (₹ Cr)</th>
                <th>Notice Date</th><th>Due Date</th>
                <th style={{ textAlign: 'right' }}>Received (₹ Cr)</th>
                <th>Receipt Date</th>
                <th style={{ textAlign: 'right' }}>Pending (₹ Cr)</th>
                <th>Remarks</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={11} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No drawdown notices yet.</td></tr>
              ) : records.map(r => (
                <tr key={r.id} style={{ background: isOverdue(r) ? 'rgba(239,68,68,0.04)' : undefined }}>
                  <td style={{ fontWeight: '600' }}>{r.investor_name}</td>
                  <td><span style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--color-primary)', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>{r.investor_class}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.notice_no || '—'}</td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--color-primary)' }}>₹{Number(r.drawdown_amount_cr).toFixed(2)}</td>
                  <td style={{ fontSize: '0.82rem' }}>{r.notice_date ? formatDate(r.notice_date) : '—'}</td>
                  <td style={{ fontSize: '0.82rem', color: isOverdue(r) ? 'var(--color-danger)' : 'inherit', fontWeight: isOverdue(r) ? '700' : 'normal' }}>
                    {r.due_date ? formatDate(r.due_date) : '—'} {isOverdue(r) && '⚠'}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--color-success)', fontWeight: '600' }}>₹{Number(r.amount_received_cr || 0).toFixed(2)}</td>
                  <td style={{ fontSize: '0.82rem' }}>{r.receipt_date ? formatDate(r.receipt_date) : '—'}</td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: Number(r.balance_pending_cr || 0) > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                    ₹{Number(r.balance_pending_cr || 0).toFixed(2)}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{r.remarks || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="icon-btn edit-btn" onClick={() => openEdit(r)}><Edit size={14} /></button>
                      <button className="icon-btn" onClick={() => handleDelete(r.id, r.investor_name)} style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {records.length > 0 && (
              <tfoot>
                <tr style={{ borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                  <td colSpan={3} style={{ fontWeight: '700', padding: '0.85rem 1rem' }}>Total Drawdown</td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--color-primary)', padding: '0.85rem 1rem' }}>₹{totalCalled.toFixed(2)}</td>
                  <td colSpan={2}></td>
                  <td style={{ textAlign: 'right', color: 'var(--color-success)', fontWeight: '700', padding: '0.85rem 1rem' }}>₹{totalReceived.toFixed(2)}</td>
                  <td></td>
                  <td style={{ textAlign: 'right', color: 'var(--color-warning)', fontWeight: '800', padding: '0.85rem 1rem' }}>₹{totalPending.toFixed(2)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

export default DrawdownsView;
