import React, { useState } from 'react';
import { Search, Edit, Trash2, ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { deleteRecord } from '../supabaseService';

function RecordsTable({ records, onEdit, onDeleteSuccess, formatDate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter records based on search query
  const filteredRecords = records.filter(r => {
    const q = searchQuery.toLowerCase();
    const dateFormatted = formatDate(r.entry_date).toLowerCase();
    return (
      r.entry_date.includes(q) ||
      dateFormatted.includes(q) ||
      (r.bank_name && r.bank_name.toLowerCase().includes(q)) ||
      (r.investor_name && r.investor_name.toLowerCase().includes(q)) ||
      (r.mf_scheme_name && r.mf_scheme_name.toLowerCase().includes(q)) ||
      (r.notes && r.notes.toLowerCase().includes(q))
    );
  });

  // Pagination Math
  const totalItems = filteredRecords.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

  // Format Helper for Indian Rupees (INR)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleDelete = async (id, dateStr) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete the ledger record for ${formatDate(dateStr)}?`);
    if (!confirmDelete) return;

    try {
      await deleteRecord(id);
      onDeleteSuccess(`Record for ${formatDate(dateStr)} has been successfully deleted.`);
    } catch (err) {
      console.error(err);
      alert(`Error deleting record: ${err.message}`);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '1.5rem' }}>
      
      {/* Search and Table Controls */}
      <div className="table-controls">
        <div className="search-input-wrapper">
          <input 
            type="text"
            placeholder="Search records by date, bank, investor, scheme..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // reset to first page on search
            }}
            className="form-input search-input"
          />
          <Search size={16} className="search-icon-pos" />
        </div>
        
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Total Entries: <strong>{totalItems}</strong>
        </div>
      </div>

      {/* Database Scrollable Grid */}
      <div className="records-table-container">
        <table className="records-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Bank Account</th>
              <th style={{ textAlign: 'right' }}>Bank Balance</th>
              <th>Investor Details</th>
              <th style={{ textAlign: 'right' }}>Capital Call Due</th>
              <th style={{ textAlign: 'right' }}>Amt Received</th>
              <th style={{ textAlign: 'right' }}>Outstanding Recv</th>
              <th>MF Scheme</th>
              <th style={{ textAlign: 'right' }}>MF Market Value</th>
              <th style={{ textAlign: 'right' }}>FD Value</th>
              <th style={{ textAlign: 'right' }}>Overnight Funds</th>
              <th style={{ textAlign: 'right' }}>Liquid Funds</th>
              <th style={{ textAlign: 'right' }}>Treasury Inv</th>
              <th style={{ textAlign: 'right', fontWeight: 'bold', color: '#fff' }}>Total CCE</th>
              <th>Notes</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan="16" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  No matching records found in the database.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((r) => (
                <tr key={r.id}>
                  {/* Date */}
                  <td style={{ fontWeight: '600', color: '#fff' }}>{formatDate(r.entry_date)}</td>
                  
                  {/* Bank Account */}
                  <td>
                    <div>{r.bank_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.acct_no}</div>
                  </td>
                  
                  {/* Bank Balance */}
                  <td style={{ textAlign: 'right', fontWeight: '500' }}>{formatCurrency(r.bank_balance)}</td>
                  
                  {/* Investor */}
                  <td>{r.investor_name || '-'}</td>
                  
                  {/* Call Due */}
                  <td style={{ textAlign: 'right' }}>{r.capital_call_due ? formatCurrency(r.capital_call_due) : '₹0'}</td>
                  
                  {/* Amt Received */}
                  <td style={{ textAlign: 'right' }}>{r.amt_received ? formatCurrency(r.amt_received) : '₹0'}</td>
                  
                  {/* Outstanding */}
                  <td style={{ 
                    textAlign: 'right', 
                    fontWeight: r.outstanding_receivable > 0 ? '700' : 'normal',
                    color: r.outstanding_receivable > 0 ? 'var(--color-warning)' : 'inherit'
                  }}>
                    {r.outstanding_receivable ? formatCurrency(r.outstanding_receivable) : '₹0'}
                  </td>
                  
                  {/* MF Scheme */}
                  <td>{r.mf_scheme_name || '-'}</td>
                  
                  {/* MF Value */}
                  <td style={{ textAlign: 'right', fontWeight: '500' }}>{formatCurrency(r.mf_market_value)}</td>
                  
                  {/* FD */}
                  <td style={{ textAlign: 'right' }}>{r.fd_value ? formatCurrency(r.fd_value) : '₹0'}</td>
                  
                  {/* Overnight */}
                  <td style={{ textAlign: 'right' }}>{r.overnight_funds_value ? formatCurrency(r.overnight_funds_value) : '₹0'}</td>
                  
                  {/* Liquid */}
                  <td style={{ textAlign: 'right' }}>{r.liquid_funds_value ? formatCurrency(r.liquid_funds_value) : '₹0'}</td>
                  
                  {/* Treasury */}
                  <td style={{ textAlign: 'right' }}>{r.treasury_value ? formatCurrency(r.treasury_value) : '₹0'}</td>
                  
                  {/* Total CCE */}
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--color-primary)' }}>{formatCurrency(r.total_cce)}</td>
                  
                  {/* Notes */}
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-secondary)' }} title={r.notes}>
                    {r.notes || '-'}
                  </td>
                  
                  {/* Actions */}
                  <td className="actions-cell" style={{ textAlign: 'center' }}>
                    <button 
                      onClick={() => onEdit(r)} 
                      className="icon-btn edit-btn"
                      title="Edit Record"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(r.id, r.entry_date)} 
                      className="icon-btn delete-btn"
                      title="Delete Record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <div>
            Showing entries <strong>{startIndex + 1}</strong> to <strong>{endIndex}</strong> of <strong>{totalItems}</strong>
          </div>
          <div className="pagination-buttons">
            <button 
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              <ArrowLeft size={12} /> Prev
            </button>
            <button 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              Next <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecordsTable;
