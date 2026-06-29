import React, { useState } from 'react';
import { PlusCircle, Edit, Trash2, X, Check, AlertCircle, Filter } from 'lucide-react';
import { createPipelineEntry, updatePipelineEntry, deletePipelineEntry } from '../supabaseService';
import ImportExportBar from './ImportExportBar';

const PIPELINE_STAGES = ['Discussion','KYC','Confirmed','Due Diligence','KYC Completed','CA Signing','Drawdown Issued','Fund Received','On Hold','Dropped'];

const STAGE_COLORS = {
  'Discussion': { bg: 'rgba(99,102,241,0.12)', color: '#818cf8' },
  'KYC': { bg: 'rgba(245,158,11,0.12)', color: 'var(--color-warning)' },
  'Confirmed': { bg: 'rgba(16,185,129,0.12)', color: 'var(--color-success)' },
  'Due Diligence': { bg: 'rgba(249,115,22,0.12)', color: 'var(--color-primary)' },
  'KYC Completed': { bg: 'rgba(16,185,129,0.12)', color: 'var(--color-success)' },
  'CA Signing': { bg: 'rgba(249,115,22,0.15)', color: '#fb923c' },
  'Drawdown Issued': { bg: 'rgba(139,92,246,0.12)', color: 'var(--color-accent)' },
  'Fund Received': { bg: 'rgba(16,185,129,0.18)', color: '#34d399' },
  'On Hold': { bg: 'rgba(156,163,175,0.12)', color: 'var(--text-secondary)' },
  'Dropped': { bg: 'rgba(239,68,68,0.12)', color: 'var(--color-danger)' },
};

const empty = (records) => ({
  serial_no: records.length + 1,
  investor_name: '', contact_person: '', mobile: '', email: '',
  commitment_size_cr: '', status: 'Discussion',
  first_meeting_date: '', last_interaction: '',
  next_action: '', next_action_date: '', assigned_to: '', remarks: ''
});

function PipelineView({ records, onSuccess, formatDate }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  const totalCommitment = records.filter(r => r.status !== 'Dropped').reduce((s, r) => s + Number(r.commitment_size_cr || 0), 0);
  const confirmedCr = records.filter(r => r.status === 'Confirmed' || r.status === 'Fund Received').reduce((s, r) => s + Number(r.commitment_size_cr || 0), 0);

  const openAdd = () => { setForm(empty(records)); setEditingId(null); setError(null); setShowForm(true); };
  const openEdit = (r) => { setForm({ ...r }); setEditingId(r.id); setError(null); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingId(null); setError(null); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null); setSaving(true);
    try {
      if (editingId) { await updatePipelineEntry(editingId, form); onSuccess('Pipeline entry updated.'); }
      else { await createPipelineEntry(form); onSuccess('Pipeline entry added.'); }
      closeForm();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from pipeline?`)) return;
    try { await deletePipelineEntry(id); onSuccess(`${name} removed.`); }
    catch (err) { alert('Error: ' + err.message); }
  };

  const filtered = filterStatus === 'All' ? records : records.filter(r => r.status === filterStatus);

  const stageTag = (status) => {
    const { bg, color } = STAGE_COLORS[status] || { bg: 'rgba(156,163,175,0.12)', color: 'var(--text-secondary)' };
    return <span style={{ background: bg, color, padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap' }}>{status}</span>;
  };

  return (
    <div className="form-layout animate-fade-in">
      <ImportExportBar moduleId="pipeline" onCreate={createPipelineEntry} onDone={onSuccess} />
      {/* KPI strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Pipeline', val: records.filter(r => r.status !== 'Dropped').length, color: 'var(--text-primary)' },
            { label: 'Total Commitment', val: `₹${totalCommitment.toFixed(2)} Cr`, color: 'var(--color-primary)' },
            { label: 'Confirmed', val: `₹${confirmedCr.toFixed(2)} Cr`, color: 'var(--color-success)' },
            { label: 'Dropped', val: records.filter(r => r.status === 'Dropped').length, color: 'var(--color-danger)' },
          ].map(({ label, val, color }) => (
            <div key={label} className="glass-card" style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color, marginTop: '0.2rem' }}>{val}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={16} /> Add to Pipeline
        </button>
      </div>

      {/* Stage funnel chips */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', fontWeight: '700' }}>Pipeline Funnel</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {PIPELINE_STAGES.map(stage => {
            const count = records.filter(r => r.status === stage).length;
            const { bg, color } = STAGE_COLORS[stage] || {};
            return (
              <div key={stage} style={{ background: bg, color, border: `1px solid ${color}40`, borderRadius: '8px', padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: '600', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {stage} <span style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '99px', padding: '0 0.4rem', fontSize: '0.72rem' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {showForm && (
        <div className="glass-card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
              {editingId ? 'Edit Pipeline Entry' : 'Add to Pipeline'}
            </h3>
            <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>
          {error && <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><AlertCircle size={16} />{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Investor Name *</label><input className="form-input" required value={form.investor_name} onChange={e => setForm({ ...form, investor_name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Status</label><select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{PIPELINE_STAGES.map(s => <option key={s}>{s}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Commitment Size (₹ Cr)</label><input className="form-input" type="number" step="0.01" value={form.commitment_size_cr} onChange={e => setForm({ ...form, commitment_size_cr: e.target.value })} placeholder="5.00" /></div>
              <div className="form-group"><label className="form-label">Contact Person</label><input className="form-input" value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Mobile</label><input className="form-input" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">First Meeting Date</label><input className="form-input" type="date" value={form.first_meeting_date} onChange={e => setForm({ ...form, first_meeting_date: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Last Interaction</label><input className="form-input" type="date" value={form.last_interaction} onChange={e => setForm({ ...form, last_interaction: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Next Action</label><input className="form-input" value={form.next_action} onChange={e => setForm({ ...form, next_action: e.target.value })} placeholder="e.g. Send CA draft" /></div>
              <div className="form-group"><label className="form-label">Next Action Date</label><input className="form-input" type="date" value={form.next_action_date} onChange={e => setForm({ ...form, next_action_date: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Assigned To</label><input className="form-input" value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Remarks</label><input className="form-input" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} /></div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={closeForm}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}><Check size={16} /> {saving ? 'Saving...' : (editingId ? 'Update' : 'Add Entry')}</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter by stage */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
        {['All', ...PIPELINE_STAGES].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{
            background: filterStatus === s ? 'var(--color-primary)' : 'rgba(255,255,255,0.04)',
            color: filterStatus === s ? '#fff' : 'var(--text-secondary)',
            border: '1px solid', borderColor: filterStatus === s ? 'var(--color-primary)' : 'var(--border-color)',
            padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer'
          }}>{s} {s !== 'All' && `(${records.filter(r => r.status === s).length})`}</button>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        <div className="records-table-container">
          <table className="records-table">
            <thead>
              <tr>
                <th>#</th><th>Investor Name</th><th>Status</th>
                <th style={{ textAlign: 'right' }}>Size (₹ Cr)</th>
                <th>Contact</th><th>First Meeting</th><th>Last Interaction</th>
                <th>Next Action</th><th>Next Date</th><th>Assigned</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={11} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No pipeline entries.</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} style={{ opacity: r.status === 'Dropped' ? 0.5 : 1 }}>
                  <td style={{ color: 'var(--text-muted)' }}>{r.serial_no || '—'}</td>
                  <td style={{ fontWeight: '600' }}>{r.investor_name}</td>
                  <td>{stageTag(r.status)}</td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--color-primary)' }}>
                    {Number(r.commitment_size_cr || 0) > 0 ? `₹${Number(r.commitment_size_cr).toFixed(2)}` : '—'}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{r.contact_person || '—'}</td>
                  <td style={{ fontSize: '0.82rem' }}>{r.first_meeting_date ? formatDate(r.first_meeting_date) : '—'}</td>
                  <td style={{ fontSize: '0.82rem' }}>{r.last_interaction ? formatDate(r.last_interaction) : '—'}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.next_action || '—'}</td>
                  <td style={{ fontSize: '0.82rem', color: r.next_action_date && new Date(r.next_action_date) < new Date() ? 'var(--color-danger)' : 'inherit' }}>
                    {r.next_action_date ? formatDate(r.next_action_date) : '—'}
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{r.assigned_to || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="icon-btn edit-btn" onClick={() => openEdit(r)}><Edit size={14} /></button>
                      <button className="icon-btn" onClick={() => handleDelete(r.id, r.investor_name)} style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PipelineView;
