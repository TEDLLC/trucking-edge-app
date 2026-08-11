import React, { useState } from 'react';
import type { OperationalAlert } from '../services/intelligenceEngine';

interface Props {
  alert: OperationalAlert;
  onClose: () => void;
  onSuccess: (actionType: 'pod' | 'invoice', entityId: string) => void;
}

export const InvoiceAndPodModal: React.FC<Props> = ({ alert, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const isPodAction = alert.entityType === 'load' && alert.id.startsWith('pod-');
  const isInvoiceAction = alert.entityType === 'load' && alert.id.startsWith('inv-');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      if (isPodAction) {
        setSuccessMessage('Proof of Delivery (POD) uploaded successfully! Invoice generation unlocked.');
        setTimeout(() => onSuccess('pod', alert.entityId), 1200);
      } else if (isInvoiceAction) {
        setSuccessMessage('Invoice successfully generated and sent to Accounts Receivable queue!');
        setTimeout(() => onSuccess('invoice', alert.entityId), 1200);
      } else {
        setSuccessMessage('Action executed successfully!');
        setTimeout(() => onClose(), 1200);
      }
    }, 800);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(2, 6, 23, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: '#090d16',
        border: '1px solid #1e293b',
        borderRadius: '12px',
        padding: '24px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#38bdf8', margin: 0 }}>
            {alert.title}
          </h3>
          <button 
            type="button" 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '20px' }}>
          {alert.description}
        </p>

        {successMessage ? (
          <div style={{ background: '#064e3b', color: '#34d399', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: '500' }}>
            {successMessage}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isPodAction && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#cbd5e1', marginBottom: '6px' }}>
                  Upload Proof of Delivery (PDF or Scan)
                </label>
                <input 
                  type="file" 
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                  style={{
                    width: '100%',
                    background: '#020617',
                    border: '1px solid #334155',
                    color: '#fff',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            )}

            {isInvoiceAction && (
              <div style={{ background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0 0 8px 0' }}>
                  <strong>Billing Verification:</strong> POD verified. System will automatically calculate carrier fee, accessorials, and generate standard freight invoice packet.
                </p>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Ready for AR dispatch</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid #334155',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {submitting ? 'Processing...' : alert.suggestedActionLabel}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InvoiceAndPodModal;