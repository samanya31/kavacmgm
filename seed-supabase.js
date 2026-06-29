import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env manually
let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      env[key] = val;
    }
  });
  supabaseUrl = supabaseUrl || env.VITE_SUPABASE_URL;
  supabaseAnonKey = supabaseAnonKey || env.VITE_SUPABASE_ANON_KEY;
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be defined in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('Reading seed.json...');
  if (!fs.existsSync('seed.json')) {
    console.error('Error: seed.json not found in the root directory.');
    process.exit(1);
  }

  const rawData = fs.readFileSync('seed.json', 'utf8').replace(/^\ufeff/i, '');
  const seedData = JSON.parse(rawData);
  console.log(`Found ${seedData.length} records. Uploading to Supabase...`);

  // Transform records
  const records = seedData.map(r => {
    const bank_balance = Number(r.bank_balance || 0);
    const capital_call_due = Number(r.capital_call_due || 0);
    const amt_received = Number(r.amt_received || 0);
    const outstanding_receivable = r.outstanding_receivable !== undefined
      ? Number(r.outstanding_receivable)
      : Math.max(0, capital_call_due - amt_received);

    const mf_units = Number(r.mf_units || 0);
    const mf_nav = Number(r.mf_nav || 0);
    const mf_market_value = r.mf_market_value !== undefined
      ? Number(r.mf_market_value)
      : (mf_units * mf_nav);

    const fd_value = Number(r.fd_value || 0);
    const overnight_funds_value = Number(r.overnight_funds_value || 0);
    const liquid_funds_value = Number(r.liquid_funds_value || 0);
    const treasury_value = Number(r.treasury_value || 0);

    const total_cash = bank_balance;
    const total_cce = r.total_cce !== undefined && r.total_cce !== null
      ? Number(r.total_cce)
      : (bank_balance + mf_market_value + fd_value + overnight_funds_value + liquid_funds_value + treasury_value);

    return {
      entry_date: r.entry_date,
      bank_name: r.bank_name || '',
      acct_no: r.acct_no || '',
      bank_balance,
      investor_name: r.investor_name || '',
      investor_commitment: Number(r.investor_commitment || 0),
      capital_call_due,
      amt_received,
      outstanding_receivable,
      mf_scheme_name: r.mf_scheme_name || '',
      mf_units,
      mf_nav,
      mf_market_value,
      fd_value,
      overnight_funds_value,
      liquid_funds_value,
      treasury_value,
      total_cash,
      total_cce,
      notes: r.notes || ''
    };
  });

  // Insert in chunks of 50 to avoid server request payload limits
  const chunkSize = 50;
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    console.log(`Inserting records ${i + 1} to ${Math.min(i + chunkSize, records.length)}...`);
    const { error } = await supabase
      .from('daily_records')
      .insert(chunk);

    if (error) {
      console.error('Error inserting chunk:', error);
      console.error('Make sure your "daily_records" table exists and that your RLS policies allow inserts (Option A in schema.sql).');
      process.exit(1);
    }
  }

  console.log('Seeding completed successfully!');
}

seed();
