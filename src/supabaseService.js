import { supabase } from './supabaseClient';

const fmt = (v) => Number(v || 0);

// ─────────────────────────────────────────────
// FUND CONFIG
// ─────────────────────────────────────────────
export async function fetchFundConfig() {
  const { data, error } = await supabase.from('fund_config').select('*').limit(1).single();
  if (error) throw new Error(error.message);
  return data;
}
export async function updateFundConfig(id, payload) {
  const { data, error } = await supabase.from('fund_config').update(payload).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

// ─────────────────────────────────────────────
// CASH & BANK
// ─────────────────────────────────────────────
export async function fetchCashBank() {
  const { data, error } = await supabase.from('cash_bank').select('*').order('as_of_date', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}
export async function createCashBank(r) {
  const payload = {
    bank_name: r.bank_name || '',
    account_type: r.account_type || 'Current Account',
    balance_cr: fmt(r.balance_cr),
    as_of_date: r.as_of_date,
    branch: r.branch || '',
    ifsc_code: r.ifsc_code || '',
    account_no: r.account_no || '',
    remarks: r.remarks || '',
  };
  const { data, error } = await supabase.from('cash_bank').insert([payload]).select().single();
  if (error) throw new Error(error.message);
  return data;
}
export async function updateCashBank(id, r) {
  const payload = {
    bank_name: r.bank_name || '',
    account_type: r.account_type || 'Current Account',
    balance_cr: fmt(r.balance_cr),
    as_of_date: r.as_of_date,
    branch: r.branch || '',
    ifsc_code: r.ifsc_code || '',
    account_no: r.account_no || '',
    remarks: r.remarks || '',
  };
  const { data, error } = await supabase.from('cash_bank').update(payload).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}
export async function deleteCashBank(id) {
  const { error } = await supabase.from('cash_bank').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

// ─────────────────────────────────────────────
// MUTUAL FUND HOLDINGS
// ─────────────────────────────────────────────
export async function fetchMFHoldings() {
  const { data, error } = await supabase.from('mf_holdings').select('*').order('nav_date', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}
export async function createMFHolding(r) {
  const market_value_cr = fmt(r.units_held) * fmt(r.latest_nav) / 10000000;
  const unrealised_gl_cr = market_value_cr - fmt(r.cost_cr);
  const payload = {
    scheme_name: r.scheme_name || '',
    amc: r.amc || '',
    units_held: fmt(r.units_held),
    latest_nav: fmt(r.latest_nav),
    market_value_cr,
    cost_cr: fmt(r.cost_cr),
    unrealised_gl_cr,
    nav_date: r.nav_date,
    isin: r.isin || '',
    remarks: r.remarks || '',
  };
  const { data, error } = await supabase.from('mf_holdings').insert([payload]).select().single();
  if (error) throw new Error(error.message);
  return data;
}
export async function updateMFHolding(id, r) {
  const market_value_cr = fmt(r.units_held) * fmt(r.latest_nav) / 10000000;
  const unrealised_gl_cr = market_value_cr - fmt(r.cost_cr);
  const payload = {
    scheme_name: r.scheme_name || '',
    amc: r.amc || '',
    units_held: fmt(r.units_held),
    latest_nav: fmt(r.latest_nav),
    market_value_cr,
    cost_cr: fmt(r.cost_cr),
    unrealised_gl_cr,
    nav_date: r.nav_date,
    isin: r.isin || '',
    remarks: r.remarks || '',
  };
  const { data, error } = await supabase.from('mf_holdings').update(payload).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}
export async function deleteMFHolding(id) {
  const { error } = await supabase.from('mf_holdings').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

// ─────────────────────────────────────────────
// DEPLOYMENTS (PORTFOLIO)
// ─────────────────────────────────────────────
export async function fetchDeployments() {
  const { data, error } = await supabase.from('deployments').select('*').order('investment_date', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}
export async function createDeployment(r) {
  const payload = {
    portfolio_company: r.portfolio_company || '',
    sector: r.sector || '',
    amount_deployed_cr: fmt(r.amount_deployed_cr),
    investment_date: r.investment_date || null,
    instrument: r.instrument || '',
    stage: r.stage || '',
    co_investor: r.co_investor || '',
    irr_target: fmt(r.irr_target),
    remarks: r.remarks || '',
  };
  const { data, error } = await supabase.from('deployments').insert([payload]).select().single();
  if (error) throw new Error(error.message);
  return data;
}
export async function updateDeployment(id, r) {
  const payload = {
    portfolio_company: r.portfolio_company || '',
    sector: r.sector || '',
    amount_deployed_cr: fmt(r.amount_deployed_cr),
    investment_date: r.investment_date || null,
    instrument: r.instrument || '',
    stage: r.stage || '',
    co_investor: r.co_investor || '',
    irr_target: fmt(r.irr_target),
    remarks: r.remarks || '',
  };
  const { data, error } = await supabase.from('deployments').update(payload).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}
export async function deleteDeployment(id) {
  const { error } = await supabase.from('deployments').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

// ─────────────────────────────────────────────
// INVESTORS
// ─────────────────────────────────────────────
export async function fetchInvestors() {
  const { data, error } = await supabase.from('investors').select('*').order('serial_no', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}
export async function createInvestor(r) {
  const balance_commitment_cr = fmt(r.commitment_cr) - fmt(r.drawdown_called_cr);
  const payload = {
    serial_no: r.serial_no ? Number(r.serial_no) : null,
    investor_name: r.investor_name || '',
    entity_type: r.entity_type || '',
    investor_class: r.investor_class || '',
    commitment_cr: fmt(r.commitment_cr),
    drawdown_called_cr: fmt(r.drawdown_called_cr),
    balance_commitment_cr,
    ca_date: r.ca_date || null,
    kyc_status: r.kyc_status || 'Pending',
    ckyc_no: r.ckyc_no || '',
    pan_no: r.pan_no || '',
    contact_person: r.contact_person || '',
    email: r.email || '',
    mobile: r.mobile || '',
    city_state: r.city_state || '',
    remarks: r.remarks || '',
  };
  const { data, error } = await supabase.from('investors').insert([payload]).select().single();
  if (error) throw new Error(error.message);
  return data;
}
export async function updateInvestor(id, r) {
  const balance_commitment_cr = fmt(r.commitment_cr) - fmt(r.drawdown_called_cr);
  const payload = {
    serial_no: r.serial_no ? Number(r.serial_no) : null,
    investor_name: r.investor_name || '',
    entity_type: r.entity_type || '',
    investor_class: r.investor_class || '',
    commitment_cr: fmt(r.commitment_cr),
    drawdown_called_cr: fmt(r.drawdown_called_cr),
    balance_commitment_cr,
    ca_date: r.ca_date || null,
    kyc_status: r.kyc_status || 'Pending',
    ckyc_no: r.ckyc_no || '',
    pan_no: r.pan_no || '',
    contact_person: r.contact_person || '',
    email: r.email || '',
    mobile: r.mobile || '',
    city_state: r.city_state || '',
    remarks: r.remarks || '',
  };
  const { data, error } = await supabase.from('investors').update(payload).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}
export async function deleteInvestor(id) {
  const { error } = await supabase.from('investors').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

// ─────────────────────────────────────────────
// DRAWDOWNS (CAPITAL CALLS)
// ─────────────────────────────────────────────
export async function fetchDrawdowns() {
  const { data, error } = await supabase.from('drawdowns').select('*').order('due_date', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}
export async function createDrawdown(r) {
  const balance_pending_cr = Math.max(0, fmt(r.drawdown_amount_cr) - fmt(r.amount_received_cr));
  const payload = {
    investor_name: r.investor_name || '',
    investor_class: r.investor_class || '',
    notice_no: r.notice_no || '',
    drawdown_amount_cr: fmt(r.drawdown_amount_cr),
    notice_date: r.notice_date || null,
    due_date: r.due_date || null,
    amount_received_cr: fmt(r.amount_received_cr),
    receipt_date: r.receipt_date || null,
    balance_pending_cr,
    remarks: r.remarks || '',
  };
  const { data, error } = await supabase.from('drawdowns').insert([payload]).select().single();
  if (error) throw new Error(error.message);
  return data;
}
export async function updateDrawdown(id, r) {
  const balance_pending_cr = Math.max(0, fmt(r.drawdown_amount_cr) - fmt(r.amount_received_cr));
  const payload = {
    investor_name: r.investor_name || '',
    investor_class: r.investor_class || '',
    notice_no: r.notice_no || '',
    drawdown_amount_cr: fmt(r.drawdown_amount_cr),
    notice_date: r.notice_date || null,
    due_date: r.due_date || null,
    amount_received_cr: fmt(r.amount_received_cr),
    receipt_date: r.receipt_date || null,
    balance_pending_cr,
    remarks: r.remarks || '',
  };
  const { data, error } = await supabase.from('drawdowns').update(payload).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}
export async function deleteDrawdown(id) {
  const { error } = await supabase.from('drawdowns').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

// ─────────────────────────────────────────────
// PIPELINE (CRM)
// ─────────────────────────────────────────────
export async function fetchPipeline() {
  const { data, error } = await supabase.from('pipeline').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}
export async function createPipelineEntry(r) {
  const payload = {
    serial_no: r.serial_no ? Number(r.serial_no) : null,
    investor_name: r.investor_name || '',
    contact_person: r.contact_person || '',
    mobile: r.mobile || '',
    email: r.email || '',
    commitment_size_cr: fmt(r.commitment_size_cr),
    status: r.status || 'Discussion',
    first_meeting_date: r.first_meeting_date || null,
    last_interaction: r.last_interaction || null,
    next_action: r.next_action || '',
    next_action_date: r.next_action_date || null,
    assigned_to: r.assigned_to || '',
    remarks: r.remarks || '',
  };
  const { data, error } = await supabase.from('pipeline').insert([payload]).select().single();
  if (error) throw new Error(error.message);
  return data;
}
export async function updatePipelineEntry(id, r) {
  const payload = {
    serial_no: r.serial_no ? Number(r.serial_no) : null,
    investor_name: r.investor_name || '',
    contact_person: r.contact_person || '',
    mobile: r.mobile || '',
    email: r.email || '',
    commitment_size_cr: fmt(r.commitment_size_cr),
    status: r.status || 'Discussion',
    first_meeting_date: r.first_meeting_date || null,
    last_interaction: r.last_interaction || null,
    next_action: r.next_action || '',
    next_action_date: r.next_action_date || null,
    assigned_to: r.assigned_to || '',
    remarks: r.remarks || '',
  };
  const { data, error } = await supabase.from('pipeline').update(payload).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}
export async function deletePipelineEntry(id) {
  const { error } = await supabase.from('pipeline').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

// ─────────────────────────────────────────────
// DASHBOARD AGGREGATE
// ─────────────────────────────────────────────
export async function fetchDashboardData() {
  const [config, cashBank, mfHoldings, deployments, investors, drawdowns, pipeline] = await Promise.all([
    fetchFundConfig().catch(() => ({ fund_corpus_cr: 500, fund_name: 'MountTech Growth Fund – Kavachh' })),
    fetchCashBank(),
    fetchMFHoldings(),
    fetchDeployments(),
    fetchInvestors(),
    fetchDrawdowns(),
    fetchPipeline(),
  ]);

  const totalCashCr = cashBank.reduce((s, r) => s + fmt(r.balance_cr), 0);
  const totalMFCr = mfHoldings.reduce((s, r) => s + fmt(r.market_value_cr), 0);
  const totalDeployedCr = deployments.reduce((s, r) => s + fmt(r.amount_deployed_cr), 0);
  const totalDrawdownCalled = drawdowns.reduce((s, r) => s + fmt(r.drawdown_amount_cr), 0);
  const totalReceived = drawdowns.reduce((s, r) => s + fmt(r.amount_received_cr), 0);
  const totalPending = drawdowns.reduce((s, r) => s + fmt(r.balance_pending_cr), 0);
  const totalCommitment = investors.reduce((s, r) => s + fmt(r.commitment_cr), 0);
  const corpusCr = fmt(config?.fund_corpus_cr || 500);

  // Pipeline funnel counts
  const PIPELINE_STAGES = ['Discussion','KYC','Confirmed','Due Diligence','KYC Completed','CA Signing','Drawdown Issued','Fund Received','On Hold','Dropped'];
  const pipelineFunnel = PIPELINE_STAGES.map(stage => ({
    stage,
    count: pipeline.filter(p => p.status === stage).length,
    commitment_cr: pipeline.filter(p => p.status === stage).reduce((s, p) => s + fmt(p.commitment_size_cr), 0),
  }));
  const confirmedPipelineCr = pipeline.filter(p => p.status === 'Confirmed' || p.status === 'Fund Received').reduce((s,p) => s + fmt(p.commitment_size_cr), 0);

  // Sector allocation for deployments
  const sectorMap = {};
  deployments.forEach(d => {
    sectorMap[d.sector || 'Other'] = (sectorMap[d.sector || 'Other'] || 0) + fmt(d.amount_deployed_cr);
  });
  const sectorAllocation = Object.entries(sectorMap).map(([sector, value]) => ({ sector, value }));

  // KYC status breakdown
  const kycCompleted = investors.filter(i => i.kyc_status === 'Completed').length;
  const kycPending = investors.filter(i => i.kyc_status !== 'Completed').length;

  // Drawdown ageing by due_date
  const today = new Date();
  const overdueDrawdowns = drawdowns.filter(d => {
    if (!d.due_date || d.balance_pending_cr <= 0) return false;
    return new Date(d.due_date) < today;
  });

  // Latest bank balances by account
  const bankSummary = cashBank.slice(0, 10).map(b => ({
    bank_name: b.bank_name,
    account_type: b.account_type,
    balance_cr: b.balance_cr,
    as_of_date: b.as_of_date,
    branch: b.branch,
    account_no: b.account_no,
  }));

  // MF holdings summary
  const mfSummary = mfHoldings.map(m => ({
    scheme_name: m.scheme_name,
    amc: m.amc,
    units_held: m.units_held,
    latest_nav: m.latest_nav,
    market_value_cr: m.market_value_cr,
    cost_cr: m.cost_cr,
    unrealised_gl_cr: m.unrealised_gl_cr,
    nav_date: m.nav_date,
  }));

  return {
    hasData: cashBank.length > 0 || mfHoldings.length > 0 || deployments.length > 0 || investors.length > 0,
    config,
    corpusCr,
    totalCashCr,
    totalMFCr,
    totalDeployedCr,
    totalCCECr: totalCashCr + totalMFCr,
    totalCommitment,
    totalDrawdownCalled,
    totalReceived,
    totalPending,
    investorCount: investors.length,
    pipelineCount: pipeline.length,
    confirmedPipelineCr,
    deploymentPct: corpusCr > 0 ? totalDeployedCr / corpusCr : 0,
    pipelineFunnel,
    sectorAllocation,
    bankSummary,
    mfSummary,
    kycCompleted,
    kycPending,
    overdueCount: overdueDrawdowns.length,
    overdueCr: overdueDrawdowns.reduce((s, d) => s + fmt(d.balance_pending_cr), 0),
  };
}
