/**
 * QRScanner - React Component
 * 
 * Scans QR codes and processes messages
 * Includes manual input fallback and file upload
 * Styled with OfflineNet design system
 */

import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { decodeMessageFromQR } from '../utils/qrCodec';
import { validateMessage, incrementHopCount } from '../utils/messageSchema';
import { saveMessage, messageExists } from '../utils/storage';

export default function QRScanner({
  onMessageScanned = () => {},
  onError = () => {},
  onDuplicate = () => {}
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanningIntervalRef = useRef(null);
  const streamRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastScannedId, setLastScannedId] = useState(null);
  const [status, setStatus] = useState('initializing');
  const [manualInputOpen, setManualInputOpen] = useState(false);
  const [manualQRData, setManualQRData] = useState('');
  const fileUploadRef = useRef(null);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      const timer = setTimeout(() => {
        startScanning();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  async function startScanning() {
    try {
      setStatus('initializing');
      console.log('🔧 Starting camera scanner...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      console.log('✅ Camera permission granted');

      if (!videoRef.current) {
        throw new Error('Video element not found');
      }

      videoRef.current.srcObject = stream;
      streamRef.current = stream;

      await new Promise((resolve) => {
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          console.log('📹 Video stream started:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
          resolve();
        };
      });

      startScanLoop();
      setScanning(true);
      setStatus('ready');
      console.log('✅ Scanner ready - show QR code to camera');
    } catch (error) {
      console.error('❌ Camera access error:', error);
      const errorMsg = error.name === 'NotAllowedError' 
        ? 'Camera permission denied. Please accept and reload.'
        : error.name === 'NotFoundError'
        ? 'No camera found on this device.'
        : `Camera error: ${error.message}`;
      
      setStatus('error');
      onError(errorMsg);
    }
  }

  function startScanLoop() {
    if (scanningIntervalRef.current) {
      clearInterval(scanningIntervalRef.current);
    }

    let frameCount = 0;

    scanningIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      frameCount++;
      if (frameCount % 30 === 0) {
        console.log(`🔍 Scanned ${frameCount} frames...`);
      }

      if (code && code.data) {
        console.log('✅✅✅ QR CODE DETECTED!!');
        console.log('📍 Data:', code.data);
        handleScanSuccess(code.data);
      }
    }, 100);
  }

  function stopScanning() {
    if (scanningIntervalRef.current) {
      clearInterval(scanningIntervalRef.current);
      scanningIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setScanning(false);
    console.log('⏹️ Scanner stopped');
  }

  function handleScanSuccess(decodedText) {
    console.log('🔍 QR Detected - Raw Data:', decodedText);

    const now = performance.now();
    if (lastScannedId !== null && (now - lastScannedId) < 2000) {
      console.log('⏳ Debouncing - ignoring duplicate scan (within 2s)');
      return;
    }

    console.log('✅ QR passed debounce check, processing...');
    setLastScannedId(now);
    processQRData(decodedText);
  }

  function processQRData(qrString) {
    try {
      console.log('📊 Processing QR Data (length: ' + qrString.length + ')');

      let scannedMessage;
      try {
        scannedMessage = decodeMessageFromQR(qrString);
        console.log('✅ Decoded Successfully:', scannedMessage);
      } catch (decodeError) {
        console.error('❌ Decode Error:', decodeError.message);
        setStatus('error');
        onError(`Failed to decode QR: ${decodeError.message}`);
        setTimeout(() => setStatus('ready'), 3000);
        return;
      }

      const validation = validateMessage(scannedMessage);
      if (!validation.valid) {
        const errorMsg = `Invalid message schema: ${validation.errors.join(', ')}`;
        console.error('❌ Schema Invalid:', validation.errors);
        setStatus('error');
        onError(errorMsg);
        setTimeout(() => setStatus('ready'), 3000);
        return;
      }

      console.log('✅ Schema Valid');

      if (messageExists(scannedMessage.id)) {
        console.log('⚠️ Duplicate detected:', scannedMessage.id);
        onDuplicate(scannedMessage);
        setStatus('duplicate');
        setTimeout(() => setStatus('ready'), 2000);
        return;
      }

      console.log('✅ New message (not duplicate)');

      const updatedMessage = incrementHopCount(scannedMessage);
      console.log('📈 Hop count incremented:', updatedMessage.hop_count);

      saveMessage(updatedMessage);
      console.log('💾 Message saved to storage');

      onMessageScanned(updatedMessage);

      setStatus('success');
      console.log('🎉 Processing Complete!');

      setTimeout(() => setStatus('ready'), 2000);

      setManualQRData('');
      setManualInputOpen(false);
    } catch (error) {
      const errorMsg = `Failed to process QR: ${error.message}`;
      console.error('❌ Processing Error:', errorMsg);
      setStatus('error');
      onError(errorMsg);
      setTimeout(() => setStatus('ready'), 3000);
    }
  }

  function handleManualSubmit() {
    if (!manualQRData.trim()) {
      alert('Please paste QR data');
      return;
    }

    console.log('📝 Manual Input Submitted');
    processQRData(manualQRData);
  }

  function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📁 File uploaded:', file.name);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (!content) throw new Error('Failed to read file');

        console.log('📖 File content type:', typeof content, 'length:', content.length);

        let qrData = content;
        if (file.name.endsWith('.json')) {
          try {
            const jsonObj = JSON.parse(content);
            qrData = window.btoa(unescape(encodeURIComponent(JSON.stringify(jsonObj))));
            console.log('📄 Parsed as JSON, converted to Base64');
          } catch (jsonErr) {
            console.log('Not JSON, treating as raw Base64');
          }
        }

        if (qrData.match(/^[A-Za-z0-9+/=]+$/)) {
          console.log('✅ Valid Base64 detected');
          processQRData(qrData);
        } else {
          throw new Error('File does not contain valid QR data');
        }
      } catch (error) {
        const errorMsg = `Failed to read file: ${error.message}`;
        console.error('❌ File read error:', errorMsg);
        onError(errorMsg);
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  }

  async function toggleScanner() {
    if (scanning) {
      stopScanning();
    } else {
      await startScanning();
    }
  }

  async function restartScanner() {
    stopScanning();
    await new Promise(r => setTimeout(r, 500));
    await startScanning();
  }

  return (
    <div style={styles.layoutContainer}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* LEFT COLUMN: CAMERA */}
      <div style={styles.mainColumn}>
        <div style={styles.scannerHeader}>
          <div style={styles.scannerTitle}>Camera Ingestion</div>
          <div style={styles.statusChip}>
            <div style={styles.statusChipDot}></div>
            READY
          </div>
        </div>

        <div style={styles.cameraFrame}>
          <div style={{ ...styles.camCorner, ...styles.camCornerTl }}></div>
          <div style={{ ...styles.camCorner, ...styles.camCornerTr }}></div>
          <div style={{ ...styles.camCorner, ...styles.camCornerBl }}></div>
          <div style={{ ...styles.camCorner, ...styles.camCornerBr }}></div>
          <div style={styles.scanLine}></div>
          
          <video
            ref={videoRef}
            style={styles.videoElement}
            playsInline
          />
          
          {!scanning && (
            <div style={styles.cameraPlaceholder}>
              <div style={styles.cameraPlaceholderText}>CAMERA FEED</div>
              <div style={styles.cameraSubtext}>AWAITING DEVICE PERMISSION</div>
            </div>
          )}
        </div>

        <div style={styles.btnRow}>
          <button
            onClick={toggleScanner}
            style={{...styles.btnCtrl, ...styles.btnCtrlDanger}}
          >
            ⏸ PAUSE
          </button>
          <button
            onClick={restartScanner}
            style={styles.btnCtrl}
          >
            ↺ RESTART
          </button>
          <button
            onClick={() => setManualInputOpen(!manualInputOpen)}
            style={{...styles.btnCtrl, ...styles.btnCtrlActive}}
          >
            ⌨ MANUAL INPUT
          </button>
        </div>

        <div style={styles.cameraHint}>POINT CAMERA AT QR CODE — F12 FOR SCAN LOGS</div>
      </div>

      {/* MANUAL INPUT MODAL */}
      {manualInputOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Manual QR Input</div>
              <button
                onClick={() => setManualInputOpen(false)}
                style={styles.modalClose}
              >
                ✕
              </button>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Paste QR Base64 Data</label>
              <textarea
                value={manualQRData}
                onChange={(e) => setManualQRData(e.target.value)}
                placeholder="Paste the QR code data here..."
                style={styles.textarea}
              />
            </div>

            <div style={styles.divider}></div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Or Upload QR File</label>
              <input
                ref={fileUploadRef}
                type="file"
                accept=".json,.txt"
                onChange={handleFileUpload}
                style={styles.fileInput}
              />
            </div>

            <button
              onClick={handleManualSubmit}
              style={styles.btnPrimary}
            >
              ⚡ PROCESS DATA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  layoutContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px',
    minHeight: 'calc(100vh - 200px)'
  },
  mainColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  sidebarColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  
  /* SCANNER HEADER */
  scannerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px'
  },
  scannerTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '18px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#d4d8dc'
  },
  statusChip: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    padding: '6px 12px',
    border: '1px solid #1a6628',
    color: '#39d353',
    backgroundColor: 'rgba(57,211,83,0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderRadius: '2px'
  },
  statusChipDot: {
    width: '5px',
    height: '5px',
    backgroundColor: '#39d353',
    borderRadius: '50%',
    animation: 'pulse 2s infinite'
  },
  
  /* CAMERA FRAME */
  cameraFrame: {
    width: '100%',
    aspectRatio: '4/3',
    backgroundColor: '#0d0e0f',
    border: '1px solid #1e2124',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '16px'
  },
  camCorner: {
    position: 'absolute',
    width: '20px',
    height: '20px',
    borderColor: '#39d353',
    borderStyle: 'solid',
    opacity: 0.8
  },
  camCornerTl: {
    top: '12px',
    left: '12px',
    borderWidth: '2px 0 0 2px'
  },
  camCornerTr: {
    top: '12px',
    right: '12px',
    borderWidth: '2px 2px 0 0'
  },
  camCornerBl: {
    bottom: '12px',
    left: '12px',
    borderWidth: '0 0 2px 2px'
  },
  camCornerBr: {
    bottom: '12px',
    right: '12px',
    borderWidth: '0 2px 2px 0'
  },
  scanLine: {
    position: 'absolute',
    left: '12px',
    right: '12px',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, #39d353, transparent)',
    animation: 'scan 2.5s ease-in-out infinite'
  },
  videoElement: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  cameraPlaceholder: {
    textAlign: 'center',
    zIndex: 10
  },
  cameraPlaceholderText: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.15em',
    color: '#3d4248',
    textTransform: 'uppercase',
    display: 'block'
  },
  cameraSubtext: {
    fontSize: '8px',
    color: '#3d4248',
    marginTop: '8px',
    display: 'block',
    letterSpacing: '0.1em'
  },
  
  /* BUTTONS */
  btnRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '8px',
    marginTop: '12px',
    marginBottom: '8px'
  },
  btnCtrl: {
    padding: '10px 12px',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontWeight: 600,
    border: '1px solid #2e3338',
    background: '#0d0e0f',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.15s',
    outline: 'none'
  },
  btnCtrlDanger: {
    borderColor: '#5a1a1a',
    color: '#e03c3c',
    boxShadow: '0 0 0 0 transparent'
  },
  btnCtrlActive: {
    backgroundColor: 'rgba(57,211,83,0.08)',
    borderColor: '#39d353',
    color: '#39d353',
    boxShadow: '0 0 8px rgba(57,211,83,0.15)'
  },
  cameraHint: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '9px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#3d4248',
    textAlign: 'center',
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid #1e2124'
  },
  
  /* SIDEBAR STATS */
  statGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px'
  },
  statBox: {
    backgroundColor: '#161819',
    border: '1px solid #1e2124',
    padding: '12px',
    textAlign: 'center'
  },
  statVal: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '28px',
    color: '#39d353',
    lineHeight: '1',
    marginBottom: '4px',
    fontWeight: 600
  },
  statKey: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '9px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#3d4248'
  },
  
  /* INSTRUCTIONS */
  instructionSection: {
    backgroundColor: '#161819',
    border: '1px solid #1e2124',
    padding: '16px'
  },

  sectionLabel: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#3d4248',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  stepList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  stepItem: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
    alignItems: 'flex-start'
  },
  stepNum: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '10px',
    color: '#39d353',
    backgroundColor: 'rgba(57,211,83,0.06)',
    border: '1px solid #1a6628',
    width: '26px',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: '2px'
  },
  stepText: {
    fontSize: '11px',
    color: '#6b7280',
    lineHeight: '1.5',
    paddingTop: '2px'
  },
  
  /* IMPORT METHODS */
  importSection: {
    backgroundColor: '#161819',
    border: '1px solid #1e2124',
    padding: '16px'
  },
  importMethod: {
    display: 'flex',
    gap: '12px',
    paddingBottom: '10px',
    marginBottom: '10px',
    borderBottom: '1px solid #1e2124',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  importIcon: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '9px',
    letterSpacing: '0.1em',
    color: '#3d4248',
    textTransform: 'uppercase',
    border: '1px solid #2e3338',
    padding: '4px 6px',
    whiteSpace: 'nowrap',
    height: 'fit-content'
  },
  importInfo: {
    flex: 1
  },
  importName: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: '12px',
    fontWeight: 600,
    color: '#d4d8dc',
    marginBottom: '2px'
  },
  importDesc: {
    fontSize: '10px',
    color: '#6b7280',
    lineHeight: '1.4'
  },
  
  /* MODAL */
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: '#161819',
    border: '1px solid #1e2124',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px'
  },
  modalTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '16px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#d4d8dc'
  },
  modalClose: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0',
    transition: 'color 0.15s'
  },
  
  /* FORM */
  formGroup: {
    marginBottom: '16px'
  },
  formLabel: {
    display: 'block',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#6b7280',
    marginBottom: '8px'
  },
  textarea: {
    width: '100%',
    minHeight: '100px',
    background: '#0d0e0f',
    border: '1px solid #2e3338',
    color: '#d4d8dc',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '11px',
    padding: '10px 12px',
    outline: 'none',
    transition: 'border-color 0.15s',
    resize: 'vertical',
    lineHeight: '1.6',
    boxSizing: 'border-box'
  },
  fileInput: {
    width: '100%',
    padding: '10px 12px',
    fontFamily: "'Barlow', sans-serif",
    fontSize: '12px',
    border: '1px solid #2e3338',
    backgroundColor: '#0d0e0f',
    color: '#d4d8dc',
    boxSizing: 'border-box',
    cursor: 'pointer'
  },
  divider: {
    height: '1px',
    background: '#1e2124',
    margin: '16px 0'
  },
  btnPrimary: {
    width: '100%',
    background: 'rgba(57,211,83,0.06)',
    border: '1px solid #1a6628',
    color: '#39d353',
    padding: '12px 20px',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.15s'
  }
};
