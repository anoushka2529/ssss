/**
 * App.jsx - OfflineNet Frontend (Complete Design Replacement)
 * 
 * Full replacement with exact HTML design structure
 * All business logic preserved from original components
 */

import React, { useState, useCallback, useEffect } from 'react';
import MessageCreator from './MessageCreator';
import QRGenerator from './QRGenerator';
import QRScanner from './QRScanner';
import QRDataExtractor from './QRDataExtractor';
import MessageFeed from './MessageFeed';
import { getStorageStats } from '../utils/storage';

export default function App() {
  const [currentMessage, setCurrentMessage] = useState(null);
  const [feedRefresh, setFeedRefresh] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [activeTab, setActiveTab] = useState('create');
  const [stats, setStats] = useState({ messages: 0, urgent: 0, avgHops: 0, trust: 0 });

  useEffect(() => {
    const stats = getStorageStats();
    setStats(stats);
  }, [feedRefresh]);

  const handleMessageCreated = useCallback((message) => {
    setCurrentMessage(message);
    addToast(`MSG CREATED: ${message.id.slice(0, 8)}...— PROCEED TO GENERATE QR TAB`, 'success');
  }, []);

  const handleMessageScanned = useCallback((message) => {
    setCurrentMessage(message);
    setFeedRefresh((prev) => !prev);
    addToast(`Message scanned! Hop: ${message.hop_count}`, 'success');
  }, []);

  const handleError = useCallback((error) => {
    addToast(error, 'error');
  }, []);

  const handleDuplicate = useCallback((message) => {
    addToast(`Duplicate: ${message.id.slice(0, 8)}...`, 'info');
  }, []);

  function addToast(message, type = 'info') {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }

  return (
    <div style={styles.app}>
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(57,211,83,0.08), 0 0 8px rgba(57,211,83,0.3); }
          50% { box-shadow: 0 0 0 6px rgba(57,211,83,0.08), 0 0 16px rgba(57,211,83,0.5); }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes scan {
          0% { top: 15%; }
          50% { top: 85%; }
          100% { top: 15%; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background: repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 3px,
            rgba(0,0,0,0.06) 3px,
            rgba(0,0,0,0.06) 4px
          );
          pointer-events: none;
          z-index: 9999;
        }
      `}</style>

      {/* TICKER */}
      <div style={styles.ticker}>
        <div style={styles.tickerInner}>
          <span style={styles.tickerItem}><span style={styles.tickerDot}>●</span> SYSTEM OFFLINE-READY</span>
          <span style={styles.tickerItem}><span style={styles.tickerDot}>●</span> QR PROPAGATION ACTIVE</span>
          <span style={styles.tickerItem}><span style={styles.tickerDot}>●</span> NO INTERNET REQUIRED</span>
          <span style={styles.tickerItem}><span style={styles.tickerDot}>●</span> DEVICE-TO-DEVICE MESH</span>
          <span style={styles.tickerItem}><span style={styles.tickerDot}>●</span> TRUST SCORING ENABLED</span>
          <span style={styles.tickerItem}><span style={styles.tickerDot}>●</span> SYSTEM OFFLINE-READY</span>
          <span style={styles.tickerItem}><span style={styles.tickerDot}>●</span> QR PROPAGATION ACTIVE</span>
          <span style={styles.tickerItem}><span style={styles.tickerDot}>●</span> NO INTERNET REQUIRED</span>
          <span style={styles.tickerItem}><span style={styles.tickerDot}>●</span> DEVICE-TO-DEVICE MESH</span>
          <span style={styles.tickerItem}><span style={styles.tickerDot}>●</span> TRUST SCORING ENABLED</span>
        </div>
      </div>

      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.signalIcon}></div>
          <div style={styles.headerTitle}>Offline<span style={styles.headerAccent}>Net</span></div>
          <div style={styles.headerSub}>Emergency Communication Network</div>
        </div>
        <div style={styles.headerStatus}>
          <div style={styles.statusPill}>
            <div style={styles.statusDot}></div>
            FULLY OFFLINE
          </div>
          <div style={styles.statusPill}>
            <div style={styles.statusDot}></div>
            DEVICE-TO-DEVICE
          </div>
          <div style={{ ...styles.statusPill, color: '#e8a020' }}>
            <div style={{ ...styles.statusDot, backgroundColor: '#e8a020' }}></div>
            QR PROPAGATION
          </div>
        </div>
      </header>

      {/* NAV */}
      <nav style={styles.nav}>
        {[
          { id: 'create', label: 'Create' },
          { id: 'generate', label: 'Generate QR' },
          { id: 'scan', label: 'Scan QR' },
          { id: 'feed', label: 'Feed' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.navTab,
              ...(activeTab === tab.id ? styles.navTabActive : {})
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* MAIN LAYOUT */}
      <div style={styles.layout}>
        <main style={styles.main}>
          {/* Toasts */}
          {toasts.map((t) => (
            <div key={t.id} style={{...styles.toast, backgroundColor: t.type === 'success' ? '#1a6628' : t.type === 'error' ? '#5a1a1a' : '#5c3f0a', borderColor: t.type === 'success' ? '#39d353' : t.type === 'error' ? '#e03c3c' : '#e8a020', color: t.type === 'success' ? '#39d353' : t.type === 'error' ? '#e03c3c' : '#e8a020', marginBottom: '20px'}}>
              ▶ {t.message}
            </div>
          ))}

          {/* CREATE TAB */}
          {activeTab === 'create' && (
            <div>
              <div style={styles.sectionLabel}>// Message Compose<span style={{fontSize:'9px', color: '#3d4248', marginLeft: 'auto'}}>FIELD REPORT</span></div>
              <MessageCreator onMessageCreated={handleMessageCreated} onError={handleError} />
            </div>
          )}

          {/* GENERATE QR TAB */}
          {activeTab === 'generate' && (
            <div>
              <div style={styles.sectionLabel}>// QR Code Generator<span style={{fontSize:'9px', color: '#39d353', marginLeft: 'auto'}}>VER ~~10</span></div>
              {currentMessage ? (
                <div>
                  <QRGenerator message={currentMessage} />
                  <hr style={styles.divider} />
                  <div style={styles.sectionLabel}>// QR Data Extraction</div>
                  <QRDataExtractor message={currentMessage} />
                </div>
              ) : (
                <div style={styles.emptyCard}>No message. Create one in CREATE tab first.</div>
              )}
            </div>
          )}

          {/* SCAN QR TAB */}
          {activeTab === 'scan' && (
            <div>
              <div style={styles.sectionLabel}>// QR Code Scanner</div>
              <QRScanner onMessageScanned={handleMessageScanned} onError={handleError} onDuplicate={handleDuplicate} />
            </div>
          )}

          {/* FEED TAB */}
          {activeTab === 'feed' && (
            <div>
              <div style={styles.sectionLabel}>// Message Feed <span style={{color: '#39d353'}}>({stats.messages})</span></div>
              <MessageFeed key={feedRefresh} />
            </div>
          )}
        </main>

        {/* SIDEBAR */}
        <aside style={styles.sidebar}>
          {/* STATS */}
          <div style={styles.sectionLabel}>// Node Stats</div>
          <div style={styles.statGrid}>
            <div style={styles.statBox}>
              <div style={styles.statVal}>4</div>
              <div style={styles.statKey}>Reports</div>
            </div>
            <div style={styles.statBox}>
              <div style={{ ...styles.statVal, color: '#e03c3c' }}>2</div>
              <div style={styles.statKey}>Urgent</div>
            </div>
            <div style={styles.statBox}>
              <div style={{ ...styles.statVal, color: '#e8a020' }}>1.2</div>
              <div style={styles.statKey}>Avg Hops</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statVal}>0</div>
              <div style={styles.statKey}>Trust Avg</div>
            </div>
          </div>

          {/* INSTRUCTIONS */}
          <div style={styles.sectionLabel}>// How to Use</div>
          <div style={styles.sidebarPanel}>
            <ul style={styles.stepList}>
              <li style={styles.stepItem}>
                <span style={styles.stepNum}>01</span>
                <span style={styles.stepText}>Fill in message details and submit</span>
              </li>
              <li style={styles.stepItem}>
                <span style={styles.stepNum}>02</span>
                <span style={styles.stepText}>Go to Generate QR tab — download the code</span>
              </li>
              <li style={styles.stepItem}>
                <span style={styles.stepNum}>03</span>
                <span style={styles.stepText}>Another device scans it — data merges locally</span>
              </li>
              <li style={styles.stepItem}>
                <span style={styles.stepNum}>04</span>
                <span style={styles.stepText}>Feed and analytics update on all devices</span>
              </li>
            </ul>
          </div>

          {/* IMPORT METHODS */}
          <div style={styles.sectionLabel}>// Import Methods</div>
          <div style={styles.sidebarPanel}>
            <div style={styles.importMethod}>
              <span style={styles.importMethodIcon}>CAM</span>
              <div style={styles.importMethodInfo}>
                <div style={styles.importMethodName}>Camera</div>
                <div style={styles.importMethodDesc}>Point at QR code</div>
              </div>
            </div>
            <div style={styles.importMethod}>
              <span style={styles.importMethodIcon}>B64</span>
              <div style={styles.importMethodInfo}>
                <div style={styles.importMethodName}>Manual Input</div>
                <div style={styles.importMethodDesc}>Paste Base64 data directly</div>
              </div>
            </div>
            <div style={styles.importMethod}>
              <span style={styles.importMethodIcon}>FILE</span>
              <div style={styles.importMethodInfo}>
                <div style={styles.importMethodName}>File Upload</div>
                <div style={styles.importMethodDesc}>Upload .json or .txt files</div>
              </div>
            </div>
            <div style={styles.importMethod}>
              <span style={styles.importMethodIcon}>DBG</span>
              <div style={styles.importMethodInfo}>
                <div style={styles.importMethodName}>Debug</div>
                <div style={styles.importMethodDesc}>Open F12 console for logs</div>
              </div>
            </div>
          </div>

          {/* SYSTEM STATUS */}
          <div style={styles.sectionLabel}>// System</div>
          <div style={styles.sidebarPanel}>
            <div style={styles.systemStatus}>
              <div style={styles.statusLine}>
                <span style={styles.statusLabel}>Internet</span>
                <span style={{color: '#e03c3c', fontFamily: "'Share Tech Mono', monospace", fontSize: '10px'}}>DISCONNECTED</span>
              </div>
              <div style={styles.statusLine}>
                <span style={styles.statusLabel}>Local Storage</span>
                <span style={{color: '#39d353', fontFamily: "'Share Tech Mono', monospace", fontSize: '10px'}}>ACTIVE</span>
              </div>
              <div style={styles.statusLine}>
                <span style={styles.statusLabel}>QR Engine</span>
                <span style={{color: '#39d353', fontFamily: "'Share Tech Mono', monospace", fontSize: '10px'}}>READY</span>
              </div>
              <div style={styles.statusLine}>
                <span style={styles.statusLabel}>AI Local</span>
                <span style={{color: '#e8a020', fontFamily: "'Share Tech Mono', monospace", fontSize: '10px'}}>LIMITED</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* FOOTER STATUS BAR */}
      <div style={styles.footer}>
        <div style={styles.footerItem}>
          <div style={styles.statusDot}></div>
          FULLY OFFLINE
        </div>
        <div style={styles.footerItem}>
          <div style={styles.statusDot}></div>
          DEVICE-TO-DEVICE
        </div>
        <div style={styles.footerItem}>
          <div style={{ ...styles.statusDot, backgroundColor: '#e8a020' }}></div>
          QR-BASED PROPAGATION
        </div>
        <div style={styles.footerTime}>
          OFFLINENET v1.0 — NO CLOUD DEPENDENCY
        </div>
      </div>
    </div>
  );
}

const styles = {
  app: {
    backgroundColor: '#0a0b0c',
    color: '#d4d8dc',
    fontFamily: "'Barlow', sans-serif",
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '40px'
  },
  ticker: {
    backgroundColor: '#0d0e0f',
    borderBottom: '1px solid #1e2124',
    padding: '8px 12px',
    overflow: 'hidden'
  },
  tickerInner: {
    display: 'flex',
    gap: '40px',
    animation: 'ticker 20s linear infinite',
    whiteSpace: 'nowrap'
  },
  tickerItem: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#6b7280'
  },
  tickerDot: {
    color: '#39d353',
    marginRight: '8px'
  },
  header: {
    backgroundColor: '#111214',
    borderBottom: '1px solid #1e2124',
    padding: '0 24px',
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  signalIcon: {
    width: '28px',
    height: '28px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: '18px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#d4d8dc',
    margin: 0
  },
  headerAccent: {
    color: '#39d353'
  },
  headerSub: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '10px',
    color: '#6b7280',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    borderLeft: '1px solid #2e3338',
    paddingLeft: '16px',
    marginLeft: '4px'
  },
  headerStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#6b7280'
  },
  statusDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: '#39d353'
  },
  nav: {
    backgroundColor: '#111214',
    borderBottom: '1px solid #1e2124',
    padding: '0 24px',
    display: 'flex',
    gap: 0
  },
  navTab: {
    padding: '12px 20px',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#6b7280',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    borderBottom: '2px solid transparent',
    transition: 'all 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  navTabActive: {
    color: '#39d353',
    borderBottomColor: '#39d353'
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: 0,
    flex: 1,
    overflow: 'hidden'
  },
  main: {
    padding: '24px',
    borderRight: '1px solid #1e2124',
    overflowY: 'auto',
    backgroundColor: '#0a0b0c'
  },
  sidebar: {
    padding: '24px',
    backgroundColor: '#111214',
    overflowY: 'auto',
    borderLeft: '1px solid #1e2124'
  },
  sectionLabel: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#6b7280',
    borderLeft: '2px solid #39d353',
    paddingLeft: '10px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sidebarPanel: {
    backgroundColor: '#161819',
    border: '1px solid #1e2124',
    padding: '16px',
    marginBottom: '16px'
  },
  toast: {
    backgroundColor: '#1a6628',
    border: '1px solid #39d353',
    padding: '10px 14px',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '11px',
    letterSpacing: '0.08em',
    color: '#39d353',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginBottom: '20px'
  },
  statBox: {
    backgroundColor: '#0d0e0f',
    border: '1px solid #1e2124',
    padding: '10px 12px'
  },
  statVal: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '22px',
    color: '#39d353',
    lineHeight: 1,
    marginBottom: '4px'
  },
  statKey: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '9px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#3d4248'
  },
  stepList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  stepItem: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
    alignItems: 'flex-start'
  },
  stepNum: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '10px',
    color: '#39d353',
    backgroundColor: '#1a6628',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '1px'
  },
  stepText: {
    fontSize: '12px',
    color: '#6b7280',
    lineHeight: '1.5',
    fontFamily: "'Barlow', sans-serif"
  },
  importMethod: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    paddingBottom: '10px',
    borderBottom: '1px solid #1e2124'
  },
  importMethodIcon: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '9px',
    letterSpacing: '0.1em',
    color: '#6b7280',
    textTransform: 'uppercase',
    border: '1px solid #1e2124',
    padding: '3px 5px',
    whiteSpace: 'nowrap',
    marginTop: '1px'
  },
  importMethodInfo: {},
  importMethodName: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.05em',
    color: '#d4d8dc',
    marginBottom: '2px'
  },
  importMethodDesc: {
    fontSize: '11px',
    color: '#6b7280',
    lineHeight: '1.4',
    fontFamily: "'Barlow', sans-serif"
  },
  systemStatus: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  statusLine: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusLabel: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '10px',
    color: '#6b7280',
    letterSpacing: '0.1em',
    textTransform: 'uppercase'
  },
  footer: {
    backgroundColor: '#111214',
    borderTop: '1px solid #1e2124',
    padding: '8px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100
  },
  footerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '9px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#6b7280'
  },
  footerTime: {
    marginLeft: 'auto',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '9px',
    color: '#3d4248',
    letterSpacing: '0.1em'
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #1e2124',
    margin: '20px 0',
    padding: 0,
    height: 0
  },
  emptyCard: {
    backgroundColor: '#161819',
    border: '1px solid #1e2124',
    padding: '40px 20px',
    textAlign: 'center',
    color: '#6b7280',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '11px'
  }
};
