import React, { useState } from 'react';
import { calculateIftaMetrics, type JurisdictionSummary } from '../utils/iftaService';
import { encryptData, decryptData } from '../utils/encryption';

export const IftaDashboard: React.FC = () => {
  // Sample state for demonstration/testing of IFTA metrics
  const [jurisdictions] = useState([
    { jurisdiction: 'TX', milesDriven: 1250 },
    { jurisdiction: 'OK', milesDriven: 450 },
    { jurisdiction: 'NM', milesDriven: 800 }
  ]);

  const [fuelReceipts] = useState([
    { jurisdiction: 'TX', gallons: 200 },
    { jurisdiction: 'OK', gallons: 80 }
  ]);

  const iftaSummary: JurisdictionSummary[] = calculateIftaMetrics(jurisdictions, fuelReceipts);

  // Security test states
  const [sensitiveInput, setSensitiveInput] = useState('');
  const [encryptedOutput, setEncryptedOutput] = useState('');
  const [decryptedOutput, setDecryptedOutput] = useState('');

  const handleEncrypt = async () => {
    if (!sensitiveInput) return;
    const encrypted = await encryptData(sensitiveInput);
    setEncryptedOutput(encrypted);
    setDecryptedOutput('');
  };

  const handleDecrypt = async () => {
    if (!encryptedOutput) return;
    const decrypted = await decryptData(encryptedOutput);
    setDecryptedOutput(decrypted);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Trucking Edge - Compliance & Security Dashboard</h1>
      
      {/* IFTA Section */}
      <section style={{ marginTop: '24px', padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Quarterly IFTA Jurisdiction Metrics</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
          <thead>
            <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Jurisdiction</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Total Miles</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Gallons Purchased</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Taxable Miles</th>
            </tr>
          </thead>
          <tbody>
            {iftaSummary.map((row) => (
              <tr key={row.jurisdiction}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row.jurisdiction}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row.totalMiles}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row.totalGallons}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row.taxableMiles}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Security & Encryption Test Section */}
      <section style={{ marginTop: '24px', padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Driver PII Encryption Utility (Test Sandbox)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          <input
            type="text"
            placeholder="Enter sensitive data (e.g., SSN or Bank Account)"
            value={sensitiveInput}
            onChange={(e) => setSensitiveInput(e.target.value)}
            style={{ padding: '8px', fontSize: '14px' }}
          />
          <button onClick={handleEncrypt} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            Encrypt Data
          </button>
          
          {encryptedOutput && (
            <div style={{ wordBreak: 'break-all', background: '#eef', padding: '8px' }}>
              <strong>Encrypted:</strong> {encryptedOutput}
            </div>
          )}

          {encryptedOutput && (
            <button onClick={handleDecrypt} style={{ padding: '8px 16px', cursor: 'pointer' }}>
              Decrypt Data
            </button>
          )}

          {decryptedOutput && (
            <div style={{ background: '#efe', padding: '8px' }}>
              <strong>Decrypted:</strong> {decryptedOutput}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};