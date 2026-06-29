import React, { useState } from 'react';
import { PlusCircle, Edit, Trash2, X, Check, Landmark, AlertCircle } from 'lucide-react';
import { createCashBank, updateCashBank, deleteCashBank } from '../supabaseService';
import ImportExportBar from './ImportExportBar';

const ACCOUNT_TYPES = ['Current Account', 'Fixed Deposit', 'Savings Account', 'Escrow Account', 'Overnight Fund'];

const empty = () => ({
  bank_name: '', account_type: 'Current Account', balance_cr: '',
  as_of_date: new Date().toISOString().slice(0, 10),
  branch: '', ifsc_code: '', account_no: '', remarks: ''
});

function CashBankView({ records, onSuccess, formatDate }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fmtCr = (v) => `₹${Number(v || 0).toFixed(2)} Cr`;
  const totalBalance = records.reduce((s, r) => s + Number(r.balance_cr || 0), 0);

  const openAdd = () => { setForm(empty()); setEditingId(null); setError(null); setShowForm(true); };
  const openEdit = (r) => { setForm({ ...r, balance_cr: r.balance_cr }); setEditingId(r.id); setError(null); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingId(null); setError(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (editingId) { await updateCashBank(editingId, form); onSuccess('Bank record updated.'); }
      else { await createCashBank(form); onSuccess('Bank record added.'); }
      closeForm();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete bank record for "${name}"?`)) return;
    try { await deleteCashBank(id); onSuccess(`Record for ${name} deleted.`); }
    catch (err) { alert('Error: ' + err.message); }
  };

  return (
    <div className="form-layout animate-fade-in">
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ImportExportBar moduleId="cash-bank" onCreate={createCashBank} onDone={onSuccess} />

      <div style={{ display: 'flex', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '1rem 1.5rem', textAlign: 'center', minWidth: '140px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Cash & Bank</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)', marginTop: '0.25rem' }}>₹{totalBalance.toFixed(2)} Cr</div>
          </div>
          <div className="glass-card" style={{ padding: '1rem 1.5rem', textAlign: 'center', minWidth: '120px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accounts</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.25rem' }}>{records.length}</div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={16} /> Add Bank Entry
        </button>
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="glass-card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
              <Landmark size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              {editingId ? 'Edit Bank Record' : 'New Bank Entry'}
            </h3>
            <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>
          {error && <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><AlertCircle size={16} />{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Bank / Account Name *</label>
                <input className="form-input" required value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} placeholder="e.g. HDFC Bank – Escrow A/c" />
              </div>
              <div className="form-group">
                <label className="form-label">Account Type *</label>
                <select className="form-input" value={form.account_type} onChange={e => setForm({ ...form, account_type: e.target.value })}>
                  {ACCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Balance (₹ Cr) *</label>
                <input className="form-input" type="number" step="0.000001" required value={form.balance_cr} onChange={e => setForm({ ...form, balance_cr: e.target.value })} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">As of Date *</label>
                <input className="form-input" type="date" required value={form.as_of_date} onChange={e => setForm({ ...form, as_of_date: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Bank Branch</label>
                <input className="form-input" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} placeholder="e.g. Connaught Place, New Delhi" />
              </div>
              <div className="form-group">
                <label className="form-label">IFSC Code</label>
                <input className="form-input" value={form.ifsc_code} onChange={e => setForm({ ...form, ifsc_code: e.target.value })} placeholder="e.g. HDFC0001234" />
              </div>
              <div className="form-group">
                <label className="form-label">Account No. (masked)</label>
                <input className="form-input" value={form.account_no} onChange={e => setForm({ ...form, account_no: e.target.value })} placeholder="e.g. XXXXXXXXXXXX1234" />
              </div>
              <div className="form-group">
                <label className="form-label">Remarks</label>
                <input className="form-input" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} placeholder="Optional notes" />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={closeForm}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Check size={16} /> {saving ? 'Saving...' : (editingId ? 'Update Record' : 'Add Record')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="records-table-container">
          <table className="records-table">
            <thead>
              <tr>
                <th>Bank / Account</th>
                <th>Type</th>
                <th>Balance (₹ Cr)</th>
                <th>As of Date</th>
                <th>Branch</th>
                <th>IFSC</th>
                <th>Acct No.</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No bank records yet. Click "Add Bank Entry" to start.</td></tr>
              ) : records.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: '600' }}>{r.bank_name}</td>
                  <td><span style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--color-primary)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>{r.account_type}</span></td>
                  <td style={{ fontWeight: '700', color: 'var(--color-success)' }}>{fmtCr(r.balance_cr)}</td>
                  <td>{formatDate(r.as_of_date)}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{r.branch || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{r.ifsc_code || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{r.account_no || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.remarks || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="icon-btn edit-btn" onClick={() => openEdit(r)} title="Edit"><Edit size={14} /></button>
                      <button className="icon-btn" onClick={() => handleDelete(r.id, r.bank_name)} title="Delete" style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {records.length > 0 && (
              <tfoot>
                <tr style={{ borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                  <td colSpan={2} style={{ fontWeight: '700', padding: '0.85rem 1rem' }}>Total Cash & Bank</td>
                  <td style={{ fontWeight: '800', color: 'var(--color-primary)', padding: '0.85rem 1rem' }}>₹{totalBalance.toFixed(2)} Cr</td>
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

export default CashBankView;
