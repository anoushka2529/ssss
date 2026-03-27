/**
 * QRDataExtractor - React Component
 * 
 * Extracts and displays JSON data from QR/Base64 payloads
 * Styled with OfflineNet design system
 */

import React, { useState } from 'react';
import { decodeMessageFromQR } from '../utils/qrCodec';

export default function QRDataExtractor({ onMessageExtracted = () => {} }) {
  const [base64Input, setBase64Input] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState(null);

  function extractData() {
    try {
      setError(null);
      
      if (!base64Input.trim()) {
        setError('Enter Base64 data to extract');
        return;
      }

      const decoded = decodeMessageFromQR(base64Input);
      setExtractedData(decoded);
      onMessageExtracted(decoded);
    } catch (err) {
      setError(`Extraction failed: ${err.message}`);
      setExtractedData(null);
    }
  }

  function copyBase64Data() {
    navigator.clipboard.writeText(base64Input).then(() => {
      alert('✅ Base64 data copied!');
    });
  }

  function copyJSON() {
    if (!extractedData) {
      alert('No data to copy. Extract data first.');
      return;
    }
    const jsonText = JSON.stringify(extractedData, null, 2);
    navigator.clipboard.writeText(jsonText).then(() => {
      alert('✅ JSON copied!');
    });
  }

  return (
    <div style={styles.panel}>
      <div style={styles.sectionLabel}>// QR Data Extraction</div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Base64 Data</label>
        <textarea
          value={base64Input}
          onChange={(e) => setBase64Input(e.target.value)}
          placeholder="Paste Base64-encoded QR data here..."
          style={styles.textarea}
        />
      </div>

      <button onClick={extractData} style={styles.btnExtract}>
        ⚡ Extract Data
      </button>

      {error && (
        <div style={styles.errorBox}>{error}</div>
      )}

      {extractedData && (
        <div>
          <button onClick={copyBase64Data} style={styles.btnSecondary}>
            ⎘ Copy Base64 Data
          </button>

          <div style={styles.jsonBlock}>
            <pre>{JSON.stringify(extractedData, null, 2)}</pre>
          </div>

          <button onClick={copyJSON} style={styles.btnCopyJson}>
            ⎘ Copy JSON
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  panel: {
    backgroundColor: '#161819',
    border: '1px solid #1e2124',
    padding: '24px'
  },
  sectionLabel: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '11px',
    color: '#3d4248',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '16px'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '10px',
    color: '#3d4248',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '8px'
  },
  textarea: {
    width: '100%',
    minHeight: '80px',
    padding: '10px',
    backgroundColor: '#0d0e0f',
    border: '1px solid #2e3338',
    color: '#6b7280',
    fontFamily: "'Courier New', monospace",
    fontSize: '11px',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  btnExtract: {
    width: '100%',
    background: 'rgba(57,211,83,0.06)',
    border: '1px solid #1a6628',
    color: '#39d353',
    padding: '10px',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.15s',
    marginBottom: '16px'
  },
  errorBox: {
    backgroundColor: 'rgba(224, 60, 60, 0.1)',
    border: '1px solid #e03c3c',
    color: '#e03c3c',
    padding: '10px',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '10px',
    marginBottom: '16px',
    borderRadius: '2px'
  },
  btnSecondary: {
    width: '100%',
    background: '#0d0e0f',
    border: '1px solid #2e3338',
    color: '#6b7280',
    padding: '9px 12px',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.15s',
    marginBottom: '16px'
  },
  jsonBlock: {
    backgroundColor: '#0d0e0f',
    border: '1px solid #2e3338',
    padding: '14px',
    marginBottom: '16px',
    maxHeight: '300px',
    overflowY: 'auto',
    fontFamily: "'Courier New', monospace",
    fontSize: '10px',
    color: '#6b7280',
    textAlign: 'left',
    lineHeight: '1.5'
  },
  btnCopyJson: {
    width: '100%',
    background: 'rgba(57,211,83,0.06)',
    border: '1px solid #1a6628',
    color: '#39d353',
    padding: '10px',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.15s'
  }
};
