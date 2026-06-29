import React, { useState } from 'react';
import { PlusCircle, Edit, Trash2, X, Check, Users, AlertCircle } from 'lucide-react';
import { createInvestor, updateInvestor, deleteInvestor } from '../supabaseService';
import ImportExportBar from './ImportExportBar';

const ENTITY_TYPES = ['Family Office','HNI','Corporate','Trust','Individual','Institution'];
const INVESTOR_CLASSES = ['Class A','Class B','Class C','Class D'];
const KYC_STATUSES = ['Pending','In Progress','Completed'];

const empty = (records) => ({
  serial_no: records.length + 1,
  investor_name: '', entity_type: '', investor_class: 'Class A',
  commitment_cr: '', drawdown_called_cr: '', ca_date: '',
  kyc_status: 'Pending', ckyc_no: '', pan_no: '',
  contact_person: '', email: '', mobile: '', city_state: '', remarks: ''
});

function InvestorsView({ records, onSuccess, formatDate }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const totalCommitment = records.reduce((s, r) => s + Number(r.commitment_cr || 0), 0);
  const totalCalled = records.reduce((s, r) => s + Number(r.drawdown_called_cr || 0), 0);
  const kycDone = records.filter(r => r.kyc_status === 'Completed').length;

  const openAdd = () => { setForm(empty(records)); setEditingId(null); setError(null); setShowForm(true); };
  const openEdit = (r) => { setForm({ ...r }); setEditingId(r.id); setError(null); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingId(null); setError(null); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null); setSaving(true);
    try {
      if (editingId) { await updateInvestor(editingId, form); onSuccess('Investor updated.'); }
      else { await createInvestor(form); onSuccess('Investor added.'); }
      closeForm();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete investor "${name}"?`)) return;
    try { await deleteInvestor(id); onSuccess(`${name} removed.`); }
    catch (err) { alert('Error: ' + err.message); }
  };

  const filtered = records.filter(r =>
    [r.investor_name, r.investor_class, r.entity_type, r.city_state, r.contact_person].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const kycColor = (s) => ({ Completed: 'var(--color-success)', 'In Progress': 'var(--color-warning)', Pending: 'var(--color-danger)' }[s] || 'var(--text-muted)');
  const kycBg = (s) => ({ Completed: 'rgba(16,185,129,0.12)', 'In Progress': 'rgba(245,158,11,0.12)', Pending: 'rgba(239,68,68,0.12)' }[s] || 'transparent');

  return (
    <div className="form-layout animate-fade-in">
      <ImportExportBar moduleId="investors" onCreate={createInvestor} onDone={onSuccess} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Investors', val: records.length, color: 'var(--text-primary)' },
            { label: 'Total Commitment', val: `₹${totalCommitment.toFixed(2)} Cr`, color: 'var(--color-primary)' },
            { label: 'Called', val: `₹${totalCalled.toFixed(2)} Cr`, color: 'var(--color-warning)' },
            { label: 'KYC Done', val: `${kycDone}/${records.length}`, color: 'var(--color-success)' },
          ].map(({ label, val, color }) => (
            <div key={label} className="glass-card" style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color, marginTop: '0.2rem' }}>{val}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={16} /> Add Investor
        </button>
      </div>

      {showForm && (
        <div className="glass-card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
              <Users size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              {editingId ? 'Edit Investor' : 'Add New Investor'}
            </h3>
            <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>
          {error && <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><AlertCircle size={16} />{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-section-title">Basic Details</div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">S.No.</label><input className="form-input" type="number" value={form.serial_no} onChange={e => setForm({ ...form, serial_no: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Investor Name *</label><input className="form-input" required value={form.investor_name} onChange={e => setForm({ ...form, investor_name: e.target.value })} placeholder="Name or Entity" /></div>
              <div className="form-group"><label className="form-label">Entity Type</label><select className="form-input" value={form.entity_type} onChange={e => setForm({ ...form, entity_type: e.target.value })}><option value="">Select...</option>{ENTITY_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Investor Class</label><select className="form-input" value={form.investor_class} onChange={e => setForm({ ...form, investor_class: e.target.value })}>{INVESTOR_CLASSES.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Commitment (₹ Cr) *</label><input className="form-input" type="number" step="0.01" required value={form.commitment_cr} onChange={e => setForm({ ...form, commitment_cr: e.target.value })} placeholder="10.00" /></div>
              <div className="form-group"><label className="form-label">Drawdown Called (₹ Cr)</label><input className="form-input" type="number" step="0.01" value={form.drawdown_called_cr} onChange={e => setForm({ ...form, drawdown_called_cr: e.target.value })} placeholder="0.00" /></div>
              <div className="form-group"><label className="form-label">CA Date</label><input className="form-input" type="date" value={form.ca_date} onChange={e => setForm({ ...form, ca_date: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">KYC Status</label><select className="form-input" value={form.kyc_status} onChange={e => setForm({ ...form, kyc_status: e.target.value })}>{KYC_STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
            </div>
            <div className="form-section-title" style={{ marginTop: '1.25rem' }}>KYC & Contact</div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">CKYC / KIN No.</label><input className="form-input" value={form.ckyc_no} onChange={e => setForm({ ...form, ckyc_no: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">PAN No.</label><input className="form-input" value={form.pan_no} onChange={e => setForm({ ...form, pan_no: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Contact Person</label><input className="form-input" value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Email ID</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Mobile No.</label><input className="form-input" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">City / State</label><input className="form-input" value={form.city_state} onChange={e => setForm({ ...form, city_state: e.target.value })} /></div>
              <div className="form-group full-width"><label className="form-label">Remarks</label><input className="form-input" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} /></div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={closeForm}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}><Check size={16} /> {saving ? 'Saving...' : (editingId ? 'Update' : 'Add Investor')}</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '360px' }}>
        <input className="form-input search-input" placeholder="Search by name, class, city..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '1rem' }} />
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        <div className="records-table-container">
          <table className="records-table">
            <thead>
              <tr>
                <th>#</th><th>Investor Name</th><th>Entity Type</th><th>Class</th>
                <th style={{ textAlign: 'right' }}>Commitment (₹ Cr)</th>
                <th style={{ textAlign: 'right' }}>Called (₹ Cr)</th>
                <th style={{ textAlign: 'right' }}>Balance (₹ Cr)</th>
                <th>CA Date</th><th>KYC</th><th>PAN</th><th>Contact</th><th>City</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={13} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>{search ? 'No results found.' : 'No investors yet.'}</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{r.serial_no || '—'}</td>
                  <td style={{ fontWeight: '600' }}>{r.investor_name}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{r.entity_type || '—'}</td>
                  <td><span style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--color-primary)', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>{r.investor_class}</span></td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--color-primary)' }}>₹{Number(r.commitment_cr).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--color-warning)', fontWeight: '600' }}>₹{Number(r.drawdown_called_cr || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--color-success)', fontWeight: '600' }}>₹{Number(r.balance_commitment_cr || 0).toFixed(2)}</td>
                  <td style={{ fontSize: '0.82rem' }}>{r.ca_date ? formatDate(r.ca_date) : '—'}</td>
                  <td><span style={{ background: kycBg(r.kyc_status), color: kycColor(r.kyc_status), padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>{r.kyc_status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{r.pan_no || '—'}</td>
                  <td style={{ fontSize: '0.82rem' }}>{r.contact_person || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{r.city_state || '—'}</td>
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
                  <td colSpan={4} style={{ fontWeight: '700', padding: '0.85rem 1rem' }}>Total ({records.length} investors)</td>
                  <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--color-primary)', padding: '0.85rem 1rem' }}>₹{totalCommitment.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--color-warning)', fontWeight: '700', padding: '0.85rem 1rem' }}>₹{totalCalled.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--color-success)', fontWeight: '700', padding: '0.85rem 1rem' }}>₹{(totalCommitment - totalCalled).toFixed(2)}</td>
                  <td colSpan={6}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

export default InvestorsView;
