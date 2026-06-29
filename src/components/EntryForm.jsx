import React, { useState, useEffect } from 'react';
import { Landmark, Briefcase, Coins, Clock, FileText, ArrowLeft, Check } from 'lucide-react';
import { createRecord, updateRecord } from '../supabaseService';

function EntryForm({ record, onSuccess, onCancel }) {
  const isEdit = !!record;

  const [formData, setFormData] = useState({
    entry_date: '',
    bank_name: '',
    acct_no: '',
    bank_balance: '',
    investor_name: '',
    investor_commitment: '',
    capital_call_due: '',
    amt_received: '',
    mf_scheme_name: '',
    mf_units: '',
    mf_nav: '',
    fd_value: '',
    overnight_funds_value: '',
    liquid_funds_value: '',
    treasury_value: '',
    notes: ''
  });

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Preset Option Lists for Convenience
  const bankPresets = [
    { name: 'HDFC Bank - Current', acct: 'XXXX0001' },
    { name: 'ICICI Bank - Current', acct: 'XXXX0002' },
    { name: 'Kotak Mahindra - FD', acct: 'XXXX0003' },
    { name: 'Axis Bank - Savings', acct: 'XXXX0004' },
    { name: 'SBI - Escrow', acct: 'XXXX0005' }
  ];

  const investorPresets = [
    'Alpha Ventures Fund',
    'Beta Capital Partners',
    'Gamma Growth LP',
    'Delta Investments',
    'Epsilon AIF'
  ];

  const mfPresets = [
    'HDFC Liquid Fund',
    'SBI Overnight Fund',
    'ICICI Pru Liquid',
    'Kotak Liquid Fund',
    'Axis Liquid Fund'
  ];

  useEffect(() => {
    if (record) {
      // Prefill form for editing
      setFormData({
        entry_date: record.entry_date || '',
        bank_name: record.bank_name || '',
        acct_no: record.acct_no || '',
        bank_balance: record.bank_balance !== null ? record.bank_balance.toString() : '',
        investor_name: record.investor_name || '',
        investor_commitment: record.investor_commitment !== null ? record.investor_commitment.toString() : '',
        capital_call_due: record.capital_call_due !== null ? record.capital_call_due.toString() : '',
        amt_received: record.amt_received !== null ? record.amt_received.toString() : '',
        mf_scheme_name: record.mf_scheme_name || '',
        mf_units: record.mf_units !== null ? record.mf_units.toString() : '',
        mf_nav: record.mf_nav !== null ? record.mf_nav.toString() : '',
        fd_value: record.fd_value !== null ? record.fd_value.toString() : '',
        overnight_funds_value: record.overnight_funds_value !== null ? record.overnight_funds_value.toString() : '',
        liquid_funds_value: record.liquid_funds_value !== null ? record.liquid_funds_value.toString() : '',
        treasury_value: record.treasury_value !== null ? record.treasury_value.toString() : '',
        notes: record.notes || ''
      });
    } else {
      // Default new form state: prefill date with today's date in local YYYY-MM-DD
      const today = new Date();
      const localDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
      setFormData(prev => ({ ...prev, entry_date: localDate }));
    }
  }, [record]);

  // Form input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Preset Selectors Handlers
  const handleBankSelect = (e) => {
    const selected = bankPresets.find(b => b.name === e.target.value);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        bank_name: selected.name,
        acct_no: selected.acct || prev.acct_no
      }));
    }
  };

  // Real-time calculated fields
  const calcMFMarketValue = Number(formData.mf_units || 0) * Number(formData.mf_nav || 0);
  const calcOutstandingReceivable = Math.max(0, Number(formData.capital_call_due || 0) - Number(formData.amt_received || 0));
  const calcTotalCCE = 
    Number(formData.bank_balance || 0) +
    calcMFMarketValue +
    Number(formData.fd_value || 0) +
    Number(formData.overnight_funds_value || 0) +
    Number(formData.liquid_funds_value || 0) +
    Number(formData.treasury_value || 0);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!formData.entry_date) {
      setError('Date is a required field.');
      setSubmitting(false);
      return;
    }

    try {
      if (isEdit) {
        await updateRecord(record.id, formData);
      } else {
        await createRecord(formData);
      }

      onSuccess(isEdit ? 'Record updated successfully.' : 'New daily entry added successfully.');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)' }}>
          {isEdit ? 'Modify Daily CCE Entry' : 'Manual Data Input Entry'}
        </h2>
        <button onClick={onCancel} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-layout">
        
        {/* Date Row */}
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Entry Date *</label>
            <input 
              type="date"
              name="entry_date"
              value={formData.entry_date}
              onChange={handleChange}
              disabled={isEdit} // date cannot be modified for existing records to maintain data integrity
              className="form-input"
              required
            />
          </div>
        </div>

        {/* Section 1: Bank Account Details */}
        <div>
          <div className="form-section-title">
            <Landmark size={16} />
            <span>Bank Account Balances</span>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Preset Account Template</label>
              <select onChange={handleBankSelect} className="form-input" defaultValue="">
                <option value="" disabled>-- Select Preset to Pre-fill --</option>
                {bankPresets.map((b, idx) => (
                  <option key={idx} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Active Bank Name</label>
              <input 
                type="text"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                placeholder="e.g. HDFC Bank - Current"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account No.</label>
              <input 
                type="text"
                name="acct_no"
                value={formData.acct_no}
                onChange={handleChange}
                placeholder="e.g. XXXX0001"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Closing Balance (₹)</label>
              <input 
                type="number"
                step="any"
                name="bank_balance"
                value={formData.bank_balance}
                onChange={handleChange}
                placeholder="e.g. 150000000"
                className="form-input"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Investor Receivables */}
        <div>
          <div className="form-section-title">
            <Clock size={16} />
            <span>Investor Receivables</span>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Select Investor</label>
              <select 
                onChange={(e) => setFormData(prev => ({ ...prev, investor_name: e.target.value }))}
                className="form-input" 
                defaultValue=""
              >
                <option value="" disabled>-- Select Preset --</option>
                {investorPresets.map((inv, idx) => (
                  <option key={idx} value={inv}>{inv}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Investor Name</label>
              <input 
                type="text"
                name="investor_name"
                value={formData.investor_name}
                onChange={handleChange}
                placeholder="e.g. Alpha Ventures"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Commitment (₹)</label>
              <input 
                type="number"
                step="any"
                name="investor_commitment"
                value={formData.investor_commitment}
                onChange={handleChange}
                placeholder="0"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Capital Call Due (₹)</label>
              <input 
                type="number"
                step="any"
                name="capital_call_due"
                value={formData.capital_call_due}
                onChange={handleChange}
                placeholder="0"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Amount Received (₹)</label>
              <input 
                type="number"
                step="any"
                name="amt_received"
                value={formData.amt_received}
                onChange={handleChange}
                placeholder="0"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Outstanding Receivable (Auto)</label>
              <div className="form-input" style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--color-warning)', fontWeight: 'bold' }}>
                {formatCurrency(calcOutstandingReceivable)}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Mutual Fund Investments */}
        <div>
          <div className="form-section-title">
            <Briefcase size={16} />
            <span>Mutual Fund Holdings</span>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Select Scheme Preset</label>
              <select 
                onChange={(e) => setFormData(prev => ({ ...prev, mf_scheme_name: e.target.value }))}
                className="form-input" 
                defaultValue=""
              >
                <option value="" disabled>-- Select Preset --</option>
                {mfPresets.map((mf, idx) => (
                  <option key={idx} value={mf}>{mf}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mutual Fund Scheme Name</label>
              <input 
                type="text"
                name="mf_scheme_name"
                value={formData.mf_scheme_name}
                onChange={handleChange}
                placeholder="e.g. SBI Overnight Fund"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Units Held</label>
              <input 
                type="number"
                step="any"
                name="mf_units"
                value={formData.mf_units}
                onChange={handleChange}
                placeholder="0"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Latest NAV (₹)</label>
              <input 
                type="number"
                step="any"
                name="mf_nav"
                value={formData.mf_nav}
                onChange={handleChange}
                placeholder="0"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Market Value (Auto)</label>
              <div className="form-input" style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--color-success)', fontWeight: 'bold' }}>
                {formatCurrency(calcMFMarketValue)}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Additional Cash Equivalents */}
        <div>
          <div className="form-section-title">
            <Coins size={16} />
            <span>Additional Cash Equivalents</span>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Fixed Deposits (₹)</label>
              <input 
                type="number"
                step="any"
                name="fd_value"
                value={formData.fd_value}
                onChange={handleChange}
                placeholder="0"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Overnight Funds (₹)</label>
              <input 
                type="number"
                step="any"
                name="overnight_funds_value"
                value={formData.overnight_funds_value}
                onChange={handleChange}
                placeholder="0"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Liquid Funds (₹)</label>
              <input 
                type="number"
                step="any"
                name="liquid_funds_value"
                value={formData.liquid_funds_value}
                onChange={handleChange}
                placeholder="0"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Treasury Inv. (₹)</label>
              <input 
                type="number"
                step="any"
                name="treasury_value"
                value={formData.treasury_value}
                onChange={handleChange}
                placeholder="0"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Notes & Live Summary */}
        <div>
          <div className="form-section-title">
            <FileText size={16} />
            <span>Remarks & Live Preview Summary</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
            <div className="form-group">
              <label className="form-label">Journal Notes / Remarks</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add daily entries notes or comments..."
                className="form-input"
                rows="4"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="glass-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Calculated Total CCE</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {formatCurrency(calcTotalCCE)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Sum of Bank Balance, MF Value, FD, Overnight, Liquid & Treasury investments.
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={submitting}
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={submitting}
          >
            <Check size={16} />
            {submitting ? 'Saving Record...' : isEdit ? 'Update Record' : 'Save Daily Entry'}
          </button>
        </div>

      </form>
    </div>
  );
}

export default EntryForm;
