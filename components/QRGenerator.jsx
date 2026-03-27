/**
 * QRGenerator - React Component
 * 
 * Generates QR codes from message objects
 * Styled with OfflineNet design system
 */

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { encodeMessageForQR, estimateQRVersion } from '../utils/qrCodec';

export default function QRGenerator({
  message,
  onError = () => {},
  renderAs = 'canvas',
  size = 180
}) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qrSize, setQrSize] = useState(null);

  useEffect(() => {
    if (!message) return;
    generateQR(message);
  }, [message]);

  async function generateQR(msg) {
    try {
      setLoading(true);
      setError(null);

      const encoded = encodeMessageForQR(msg);
      const version = estimateQRVersion(msg);

      const options = {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      };

      if (renderAs === 'canvas' && canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, encoded, options);
        setQrSize(`~${version}`);
      }

      setLoading(false);
    } catch (err) {
      const errorMsg = `QR generation failed: ${err.message}`;
      setError(errorMsg);
      onError(errorMsg);
      setLoading(false);
    }
  }

  function downloadQR() {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL('image/png');
    link.download = `message-${message.id.slice(0, 8)}.png`;
    link.click();
  }

  function copyQRAsImage() {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    navigator.clipboard.writeText(dataUrl).then(() => {
      alert('✅ QR image copied to clipboard!');
    });
  }

  function copyQRDataBase64() {
    try {
      const encoded = window.btoa(unescape(encodeURIComponent(JSON.stringify(message))));
      navigator.clipboard.writeText(encoded).then(() => {
        alert('✅ QR Base64 data copied to clipboard!');
      });
    } catch (err) {
      alert('Failed to copy: ' + err.message);
    }
  }

  function downloadQRAsJSON() {
    try {
      const jsonData = JSON.stringify(message, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `message-${message.id.slice(0, 8)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download: ' + err.message);
    }
  }

  function downloadQRAsBase64() {
    try {
      const encoded = window.btoa(unescape(encodeURIComponent(JSON.stringify(message))));
      const blob = new Blob([encoded], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-data-${message.id.slice(0, 8)}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download: ' + err.message);
    }
  }

  if (!message) {
    return (
      <div style={styles.qrPanel}>
        <div style={styles.placeholderText}>No message. Create one first.</div>
      </div>
    );
  }

  return (
    <div style={styles.qrPanel}>
      <div style={styles.qrPlaceholder}>
        <div style={{ ...styles.qrCorner, ...styles.qrCornerTl }}></div>
        <div style={{ ...styles.qrCorner, ...styles.qrCornerTr }}></div>
        <div style={{ ...styles.qrCorner, ...styles.qrCornerBl }}></div>
        <div style={{ ...styles.qrCorner, ...styles.qrCornerBr }}></div>
        
        {loading ? (
          <div style={styles.placeholderText}>GENERATING...</div>
        ) : error ? (
          <div style={{ ...styles.placeholderText, color: '#e03c3c' }}>{error}</div>
        ) : (
          <canvas
            ref={canvasRef}
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        )}
      </div>

      <div style={styles.qrMeta}>
        <div style={styles.qrMetaRow}>
          <span style={styles.qrMetaKey}>MSG ID</span>
          <span style={styles.qrMetaVal}>{message.id.slice(0, 8)}...</span>
        </div>
        <div style={styles.qrMetaRow}>
          <span style={styles.qrMetaKey}>Type</span>
          <span style={{ ...styles.qrMetaVal, color: '#39d353', fontWeight: 600 }}>{message.type.toUpperCase()}</span>
        </div>
        <div style={styles.qrMetaRow}>
          <span style={styles.qrMetaKey}>Content</span>
          <span style={styles.qrMetaVal}>{message.content.slice(0, 20)}</span>
        </div>
        <div style={styles.qrMetaRow}>
          <span style={styles.qrMetaKey}>Hop Count</span>
          <span style={styles.qrMetaVal}>{message.hop_count || 0}</span>
        </div>
        <div style={styles.qrMetaRow}>
          <span style={styles.qrMetaKey}>Trust Score</span>
          <span style={styles.qrMetaVal}>{message.trust_score || 0}</span>
        </div>
      </div>

      <div style={styles.btnGrid}>
        <button onClick={downloadQR} style={styles.btnSec}>↓ Download QR</button>
        <button onClick={copyQRAsImage} style={styles.btnSec}>⎘ Copy QR</button>
        <button onClick={copyQRDataBase64} style={styles.btnSec}>⎘ Copy Data</button>
        <button onClick={downloadQRAsJSON} style={styles.btnSec}>↓ Save JSON</button>
      </div>

      <button onClick={downloadQRAsBase64} style={styles.btnFull}>↓ Save Base64</button>
    </div>
  );
}

const styles = {
  qrPanel: {
    backgroundColor: '#161819',
    border: '1px solid #1e2124',
    padding: '24px',
    textAlign: 'center',
    position: 'relative'
  },
  qrPlaceholder: {
    width: '180px',
    height: '180px',
    margin: '0 auto 16px',
    border: '1px solid #2e3338',
    backgroundColor: '#0d0e0f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  qrCorner: {
    position: 'absolute',
    width: '16px',
    height: '16px',
    borderColor: '#39d353',
    borderStyle: 'solid'
  },
  qrCornerTl: {
    top: '8px',
    left: '8px',
    borderWidth: '2px 0 0 2px'
  },
  qrCornerTr: {
    top: '8px',
    right: '8px',
    borderWidth: '2px 2px 0 0'
  },
  qrCornerBl: {
    bottom: '8px',
    left: '8px',
    borderWidth: '0 0 2px 2px'
  },
  qrCornerBr: {
    bottom: '8px',
    right: '8px',
    borderWidth: '0 2px 2px 0'
  },
  placeholderText: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '9px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#3d4248'
  },
  qrMeta: {
    textAlign: 'left',
    margin: '16px 0',
    borderTop: '1px solid #1e2124',
    paddingTop: '14px'
  },
  qrMetaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
    fontSize: '11px'
  },
  qrMetaKey: {
    fontFamily: "'Share Tech Mono', monospace",
    color: '#3d4248',
    textTransform: 'uppercase',
    fontSize: '10px',
    letterSpacing: '0.1em'
  },
  qrMetaVal: {
    fontFamily: "'Share Tech Mono', monospace",
    color: '#6b7280',
    fontSize: '10px'
  },
  btnGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginTop: '16px'
  },
  btnSec: {
    background: '#0d0e0f',
    border: '1px solid #2e3338',
    color: '#6b7280',
    padding: '9px 12px',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  btnFull: {
    gridColumn: '1 / -1',
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
    marginTop: '8px',
    width: '100%'
  }
};
