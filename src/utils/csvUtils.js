// ──────────────────────────────────────────────────────────────
// CSV Utility — Templates + Import/Export for all modules
// ──────────────────────────────────────────────────────────────

/**
 * Download a CSV file in the browser.
 */
export function downloadCSV(filename, headers, rows) {
  const escape = (v) => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csvContent =
    [headers, ...rows].map(row => row.map(escape).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Parse a CSV text string into an array of objects keyed by headers.
 * Handles quoted fields with commas.
 */
export function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must have at least one header row and one data row.');

  const parseRow = (line) => {
    const result = [];
    let inQuote = false, current = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { current += '"'; i++; }
        else { inQuote = !inQuote; }
      } else if (ch === ',' && !inQuote) {
        result.push(current.trim()); current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'));
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseRow(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = values[idx] ?? ''; });
    records.push(obj);
  }
  return { headers, records };
}

// ──────────────────────────────────────────────────────────────
// TEMPLATE DEFINITIONS — one per module
// ──────────────────────────────────────────────────────────────

export const TEMPLATES = {

  'cash-bank': {
    filename: 'kavachh_cash_bank_template.csv',
    headers: ['bank_name', 'account_type', 'balance_cr', 'as_of_date', 'branch', 'ifsc_code', 'account_no', 'remarks'],
    sample: [
      ['HDFC Bank – Escrow A/c', 'Current Account', '12.50', '2026-06-29', 'Connaught Place, New Delhi', 'HDFC0001234', 'XXXXXXXXXXXX1234', 'Fund Escrow Account'],
      ['ICICI Bank – Ops A/c', 'Current Account', '3.80', '2026-06-29', 'Nehru Place, New Delhi', 'ICIC0002345', 'XXXXXXXXXXXX2345', 'Operational Account'],
      ['SBI – FD', 'Fixed Deposit', '25.00', '2026-06-15', 'Parliament Street, New Delhi', 'SBIN0003456', 'XXXXXXXXXXXX3456', '12-month FD @7.5% p.a.'],
    ],
    notes: [
      'account_type: Current Account / Fixed Deposit / Savings Account / Escrow Account / Overnight Fund',
      'balance_cr: Enter balance in INR Crore (e.g. 12.50 means ₹12.50 Cr)',
      'as_of_date: YYYY-MM-DD format (e.g. 2026-06-29)',
    ]
  },

  'mf-holdings': {
    filename: 'kavachh_mf_holdings_template.csv',
    headers: ['scheme_name', 'amc', 'units_held', 'latest_nav', 'cost_cr', 'nav_date', 'isin', 'remarks'],
    sample: [
      ['HDFC Liquid Fund – Growth', 'HDFC AMC', '125000', '3847.52', '45.00', '2026-06-28', 'INF179K01VY7', 'Liquid parking'],
      ['Nippon India Overnight Fund', 'Nippon AMC', '88000', '1215.34', '10.20', '2026-06-28', 'INF204K01T90', 'Overnight fund'],
    ],
    notes: [
      'units_held: Total units held (not in Cr)',
      'latest_nav: Current NAV in INR per unit (e.g. 3847.52)',
      'cost_cr: Purchase cost in INR Crore',
      'nav_date: YYYY-MM-DD format',
      'Market value (₹ Cr) = units_held × latest_nav ÷ 1,00,00,000 — auto-calculated',
    ]
  },

  'deployments': {
    filename: 'kavachh_deployments_template.csv',
    headers: ['portfolio_company', 'sector', 'amount_deployed_cr', 'investment_date', 'instrument', 'stage', 'co_investor', 'irr_target', 'remarks'],
    sample: [
      ['TechCo Pvt Ltd', 'FinTech', '15.00', '2026-03-15', 'CCPS', 'Series A', 'XYZ Capital', '22', 'Lead investor'],
      ['AgriStart Pvt Ltd', 'AgriTech', '10.00', '2026-05-01', 'Equity', 'Pre-Series A', '', '25', 'Co-led'],
    ],
    notes: [
      'sector: FinTech / AgriTech / HealthTech / EdTech / CleanTech / LogisTech / D2C / SaaS / DeepTech / Other',
      'amount_deployed_cr: In INR Crore',
      'instrument: CCPS / Equity / NCD / CCD / Preference Shares / Debentures / Other',
      'stage: Pre-Seed / Seed / Pre-Series A / Series A / Series B / Series C / Growth',
      'irr_target: Percentage as number (e.g. 22 for 22%)',
      'investment_date: YYYY-MM-DD format',
    ]
  },

  'investors': {
    filename: 'kavachh_investors_template.csv',
    headers: ['serial_no', 'investor_name', 'entity_type', 'investor_class', 'commitment_cr', 'drawdown_called_cr', 'ca_date', 'kyc_status', 'ckyc_no', 'pan_no', 'contact_person', 'email', 'mobile', 'city_state', 'remarks'],
    sample: [
      ['1', 'Mehta Family Office', 'Family Office', 'Class A', '10.00', '0.00', '2026-01-15', 'Completed', 'CKYC123456', 'ABCDE1234F', 'Rajesh Mehta', 'rajesh@mehta.com', '9999999999', 'Mumbai, Maharashtra', ''],
      ['2', 'Sharma HNI', 'HNI', 'Class B', '5.00', '0.00', '2026-02-01', 'Pending', '', 'PQRST5678G', 'Priya Sharma', 'priya@sharma.com', '8888888888', 'Delhi', ''],
      ['3', 'ABC Corporates Ltd', 'Corporate', 'Class A', '25.00', '5.00', '2025-12-10', 'Completed', 'CKYC789012', 'XYZAB9012H', 'Anil Gupta', 'anil@abc.com', '7777777777', 'Bangalore, Karnataka', 'Lead investor'],
    ],
    notes: [
      'entity_type: Family Office / HNI / Corporate / Trust / Individual / Institution',
      'investor_class: Class A / Class B / Class C / Class D',
      'commitment_cr: Total commitment in INR Crore',
      'drawdown_called_cr: Amount called so far in INR Crore',
      'kyc_status: Pending / In Progress / Completed',
      'ca_date: Contribution Agreement signing date — YYYY-MM-DD format',
    ]
  },

  'drawdowns': {
    filename: 'kavachh_drawdowns_template.csv',
    headers: ['investor_name', 'investor_class', 'notice_no', 'drawdown_amount_cr', 'notice_date', 'due_date', 'amount_received_cr', 'receipt_date', 'remarks'],
    sample: [
      ['Mehta Family Office', 'Class A', 'DD-001', '5.00', '2026-06-01', '2026-06-15', '5.00', '2026-06-10', 'First drawdown received'],
      ['Sharma HNI', 'Class B', 'DD-002', '2.50', '2026-06-01', '2026-06-20', '0.00', '', 'Awaiting receipt'],
    ],
    notes: [
      'notice_no: Drawdown notice reference number (e.g. DD-001)',
      'drawdown_amount_cr: Amount called in INR Crore',
      'notice_date / due_date / receipt_date: YYYY-MM-DD format',
      'amount_received_cr: Leave 0 if not yet received',
      'balance_pending_cr = drawdown_amount_cr − amount_received_cr — auto-calculated',
    ]
  },

  'pipeline': {
    filename: 'kavachh_pipeline_template.csv',
    headers: ['serial_no', 'investor_name', 'contact_person', 'mobile', 'email', 'commitment_size_cr', 'status', 'first_meeting_date', 'last_interaction', 'next_action', 'next_action_date', 'assigned_to', 'remarks'],
    sample: [
      ['1', 'Verma Family Office', 'Suresh Verma', '9876543210', 'suresh@verma.com', '10.00', 'Discussion', '2026-06-01', '2026-06-20', 'Send NDA', '2026-07-05', 'Rohan', 'High interest'],
      ['2', 'Global Tech VC', 'Anita Singh', '9123456780', 'anita@gtvc.com', '50.00', 'KYC', '2026-05-15', '2026-06-25', 'Follow up on KYC docs', '2026-07-02', 'Priya', 'Institutional LP'],
      ['3', 'Dropped Prospect', 'Ram Lal', '9000000000', 'ram@example.com', '2.00', 'Dropped', '2026-04-01', '2026-05-01', '', '', '', 'Not interested'],
    ],
    notes: [
      'status: Discussion / KYC / Confirmed / Due Diligence / KYC Completed / CA Signing / Drawdown Issued / Fund Received / On Hold / Dropped',
      'commitment_size_cr: Estimated commitment in INR Crore',
      'All dates: YYYY-MM-DD format',
    ]
  },
};
