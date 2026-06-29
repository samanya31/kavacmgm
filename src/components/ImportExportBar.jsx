import React, { useRef, useState } from 'react';
import { Download, Upload, FileText, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { downloadCSV, parseCSV, TEMPLATES } from '../utils/csvUtils';

/**
 * ImportExportBar — renders "Download Template" + "Import CSV" buttons.
 *
 * Props:
 *   moduleId  — one of: 'cash-bank' | 'mf-holdings' | 'deployments' | 'investors' | 'drawdowns' | 'pipeline'
 *   onCreate  — async function(row: object) => void  (called for each imported row)
 *   onDone    — function(message: string) => void    (called when import finishes successfully)
 */
function ImportExportBar({ moduleId, onCreate, onDone }) {
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null); // { ok, errors }
  const [showNotes, setShowNotes] = useState(false);

  const tpl = TEMPLATES[moduleId];
  if (!tpl) return null;

  const handleDownloadTemplate = () => {
    downloadCSV(tpl.filename, tpl.headers, tpl.sample);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const { records } = parseCSV(text);

      if (records.length === 0) {
        setImportResult({ ok: 0, errors: ['No data rows found in the CSV.'] });
        setImporting(false);
        return;
      }

      let ok = 0;
      const errors = [];

      for (let i = 0; i < records.length; i++) {
        try {
          await onCreate(records[i]);
          ok++;
        } catch (err) {
          errors.push(`Row ${i + 2}: ${err.message}`);
        }
      }

      setImportResult({ ok, errors });
      if (ok > 0) {
        onDone(`Successfully imported ${ok} record${ok > 1 ? 's' : ''}${errors.length > 0 ? ` (${errors.length} failed)` : ''}.`);
      }
    } catch (err) {
      setImportResult({ ok: 0, errors: [err.message] });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      {/* Button Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Download Template */}
        <button
          onClick={handleDownloadTemplate}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
            color: 'var(--color-success)', borderRadius: '8px',
            padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: '600',
            cursor: 'pointer', fontFamily: 'var(--font-heading)', transition: 'var(--transition-fast)'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(16,185,129,0.16)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(16,185,129,0.08)'}
          title="Download sample CSV with correct column format"
        >
          <Download size={15} /> Download Template
        </button>

        {/* Import CSV */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)',
            color: 'var(--color-accent)', borderRadius: '8px',
            padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: '600',
            cursor: importing ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-heading)', transition: 'var(--transition-fast)',
            opacity: importing ? 0.7 : 1
          }}
          onMouseOver={e => !importing && (e.currentTarget.style.background = 'rgba(139,92,246,0.16)')}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'}
          title="Import records from a CSV file"
        >
          <Upload size={15} /> {importing ? 'Importing...' : 'Import CSV'}
        </button>

        {/* Column Notes Toggle */}
        <button
          onClick={() => setShowNotes(p => !p)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: 'transparent', border: 'none',
            color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '500',
            cursor: 'pointer', padding: '0.4rem 0.5rem'
          }}
          title="View column format notes"
        >
          <Info size={14} /> {showNotes ? 'Hide Notes' : 'Column Notes'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {/* Column Notes Panel */}
      {showNotes && (
        <div style={{
          marginTop: '0.75rem',
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.18)',
          borderRadius: '10px',
          padding: '0.9rem 1.1rem',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          position: 'relative'
        }}>
          <button
            onClick={() => setShowNotes(false)}
            style={{ position: 'absolute', right: '0.75rem', top: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={14} />
          </button>
          <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={14} style={{ color: 'var(--color-accent)' }} /> Column Format Notes
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--color-accent)', marginBottom: '0.25rem', wordBreak: 'break-all' }}>
            📄 {tpl.filename}
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>
            {tpl.headers.join(', ')}
          </div>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {tpl.notes.map((note, i) => <li key={i}>{note}</li>)}
          </ul>
        </div>
      )}

      {/* Import Result Banner */}
      {importResult && (
        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {importResult.ok > 0 && (
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', padding: '0.65rem 1rem', color: 'var(--color-success)', fontSize: '0.85rem' }}>
              <CheckCircle2 size={15} />
              <span>{importResult.ok} row{importResult.ok > 1 ? 's' : ''} imported successfully.</span>
              <button onClick={() => setImportResult(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><X size={13} /></button>
            </div>
          )}
          {importResult.errors.length > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: '8px', padding: '0.65rem 1rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--color-danger)', fontWeight: '600', marginBottom: '0.4rem' }}>
                <AlertCircle size={14} /> {importResult.errors.length} row{importResult.errors.length > 1 ? 's' : ''} failed:
              </div>
              <ul style={{ paddingLeft: '1.25rem', color: '#f87171', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {importResult.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                {importResult.errors.length > 5 && <li>...and {importResult.errors.length - 5} more.</li>}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ImportExportBar;
