/**
 * App.jsx - Integration Example
 * 
 * Complete QR-based message propagation system
 * 
 * FLOW:
 * 1. Create message with MessageCreator
 * 2. Generate QR with QRGenerator
 * 3. Scan QR with QRScanner (on another device)
 * 4. Message appears in MessageFeed
 * 
 * All fully offline, localStorage-based
 */

import React, { useState, useCallback } from 'react';
import MessageCreator from './MessageCreator';
import QRGenerator from './QRGenerator';
import QRScanner from './QRScanner';
import QRDataExtractor from './QRDataExtractor';
import MessageFeed from './MessageFeed';

export default function App() {
  const [currentMessage, setCurrentMessage] = useState(null);
  const [feedRefresh, setFeedRefresh] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [activeTab, setActiveTab] = useState('create');

  /**
   * Handle message creation
   */
  const handleMessageCreated = useCallback((message) => {
    setCurrentMessage(message);
    setFeedRefresh((prev) => !prev);
    addToast(`✅ Message created: ${message.id.slice(0, 8)}...`, 'success');
  }, []);

  /**
   * Handle message scanned
   */
  const handleMessageScanned = useCallback((message) => {
    setCurrentMessage(message);
    setFeedRefresh((prev) => !prev);
    addToast(`📍 Message scanned! Hop count: ${message.hop_count}`, 'success');
  }, []);

  /**
   * Handle error
   */
  const handleError = useCallback((error) => {
    addToast(`⚠️ ${error}`, 'error');
    console.error(error);
  }, []);

  /**
   * Handle duplicate
   */
  const handleDuplicate = useCallback((message) => {
    addToast(`📌 Duplicate message (ID: ${message.id.slice(0, 8)}...)`, 'info');
  }, []);

  /**
   * Add toast notification
   */
  function addToast(message, type = 'info') {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }

  return (
    <div style={styles.app}>
      {/* HEADER */}
      <header style={styles.header}>
        <h1>🌐 Emergency Communication Network</h1>
        <p>Offline-First QR-Based Message Propagation</p>
      </header>

      {/* TAB NAVIGATION */}
      <nav style={styles.tabNav}>
        <button
          onClick={() => setActiveTab('create')}
          style={{
            ...styles.tabButton,
            backgroundColor: activeTab === 'create' ? '#007bff' : '#ddd',
            color: activeTab === 'create' ? 'white' : '#333'
          }}
        >
          ✍️ Create
        </button>
        <button
          onClick={() => setActiveTab('generate')}
          style={{
            ...styles.tabButton,
            backgroundColor: activeTab === 'generate' ? '#007bff' : '#ddd',
            color: activeTab === 'generate' ? 'white' : '#333'
          }}
        >
          📱 Generate QR
        </button>
        <button
          onClick={() => setActiveTab('scan')}
          style={{
            ...styles.tabButton,
            backgroundColor: activeTab === 'scan' ? '#007bff' : '#ddd',
            color: activeTab === 'scan' ? 'white' : '#333'
          }}
        >
          📸 Scan QR
        </button>
        <button
          onClick={() => setActiveTab('feed')}
          style={{
            ...styles.tabButton,
            backgroundColor: activeTab === 'feed' ? '#007bff' : '#ddd',
            color: activeTab === 'feed' ? 'white' : '#333'
          }}
        >
          📨 Feed
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <div style={styles.content}>
        {/* CREATE TAB */}
        {activeTab === 'create' && (
          <div style={styles.section}>
            <MessageCreator
              onMessageCreated={handleMessageCreated}
              onError={handleError}
            />
            <div style={styles.info}>
              <h4>📝 How to Use</h4>
              <ol>
                <li>Fill in message details</li>
                <li>Click "Create & Save Message"</li>
                <li>Go to "Generate QR" tab</li>
              </ol>
            </div>
          </div>
        )}

        {/* GENERATE QR TAB */}
        {activeTab === 'generate' && (
          <div style={styles.section}>
            <QRGenerator
              message={currentMessage}
              onError={handleError}
              size={300}
            />
            <QRDataExtractor message={currentMessage} />
            <div style={styles.info}>
              <h4>📱 Export Options</h4>
              <ul>
                <li>📥 Download QR as PNG</li>
                <li>📝 Copy QR Base64 data</li>
                <li>📄 Save as JSON file</li>
                <li>📄 Save as Base64 text</li>
                <li>📋 Copy to clipboard</li>
              </ul>
            </div>
          </div>
        )}

        {/* SCAN QR TAB */}
        {activeTab === 'scan' && (
          <div style={styles.section}>
            <QRScanner
              onMessageScanned={handleMessageScanned}
              onError={handleError}
              onDuplicate={handleDuplicate}
            />
            <div style={styles.info}>
              <h4>📸 Import Methods</h4>
              <ul>
                <li>📷 <strong>Camera</strong> - Point at QR code</li>
                <li>📝 <strong>Manual Input</strong> - Paste Base64 data</li>
                <li>📁 <strong>File Upload</strong> - Upload .json or .txt files</li>
                <li>⚙️ <strong>Debugging</strong> - Open F12 console for logs</li>
              </ul>
            </div>
          </div>
        )}

        {/* FEED TAB */}
        {activeTab === 'feed' && (
          <div style={styles.section}>
            <MessageFeed refresh={feedRefresh} onDelete={handleError} />
            <div style={styles.info}>
              <h4>📨 Message Feed</h4>
              <ul>
                <li>All scanned messages appear here</li>
                <li>Sorted by timestamp (newest first)</li>
                <li>Filter by message type</li>
                <li>View full details including AI data</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* TOASTS */}
      <div style={styles.toastContainer}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              ...styles.toast,
              backgroundColor: {
                success: '#28a745',
                error: '#d32f2f',
                info: '#007bff'
              }[toast.type] || '#333'
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p>
          🔒 Fully offline | 📱 Device-to-device | 🔄 QR-based propagation
        </p>
        <p style={{ fontSize: '11px', color: '#999' }}>
          This system uses localStorage for local persistence and html5-qrcode +
          qrcode libraries for QR operations.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '30px 20px',
    textAlign: 'center'
  },
  tabNav: {
    display: 'flex',
    gap: '10px',
    padding: '10px 20px',
    backgroundColor: 'white',
    borderBottom: '1px solid #ddd'
  },
  tabButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.3s'
  },
  content: {
    flex: 1,
    padding: '20px',
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%'
  },
  section: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  info: {
    flex: 1,
    padding: '20px',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    minWidth: '250px'
  },
  toastContainer: {
    position: 'fixed',
    bottomRight: [10, 10],
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  toast: {
    color: 'white',
    padding: '12px 20px',
    borderRadius: '4px',
    fontSize: '14px',
    animation: 'slideIn 0.3s ease-out'
  },
  footer: {
    backgroundColor: '#f0f0f0',
    padding: '20px',
    textAlign: 'center',
    borderTop: '1px solid #ddd',
    fontSize: '12px',
    color: '#666'
  }
};
