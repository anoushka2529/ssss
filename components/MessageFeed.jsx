/**
 * MessageFeed - React Component
 * 
 * Displays all messages stored locally
 * Shows message details including hop count, trust score, and AI data
 * 
 * USAGE:
 * <MessageFeed messages={messages} onDelete={handleDelete} />
 */

import React, { useState, useEffect } from 'react';
import { getAllMessages, deleteMessage } from '../utils/storage';

/**
 * MessageFeed Component
 * 
 * Props:
 *   - refresh: (boolean) Trigger to refresh messages
 *   - onDelete: (Function) Callback when message is deleted
 */
export default function MessageFeed({ refresh = false, onDelete = () => {} }) {
  const [messages, setMessages] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadMessages();
  }, [refresh]);

  /**
   * Load messages from storage
   */
  function loadMessages() {
    const allMessages = getAllMessages();
    setMessages(allMessages);
  }

  /**
   * Delete a message
   */
  function handleDeleteMessage(id) {
    if (!window.confirm('Delete this message?')) return;

    deleteMessage(id);
    loadMessages();
    onDelete(id);
  }

  /**
   * Toggle message expansion
   */
  function toggleExpand(id) {
    setExpandedId(expandedId === id ? null : id);
  }

  /**
   * Filter messages by type
   */
  const filteredMessages = filterType === 'all'
    ? messages
    : messages.filter((m) => m.type === filterType);

  return (
    <div style={styles.layoutContainer}>
      {/* MAIN COLUMN */}
      <div style={styles.mainColumn}>
        <div style={styles.sectionLabel}>
          <span>// MESSAGE FEED [{filteredMessages.length}]</span>
        </div>

        <div style={styles.filterRow}>
          <span style={styles.filterLabel}>FILTER</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Types</option>
            <option value="medical">Medical</option>
            <option value="safety">Safety</option>
            <option value="missing">Missing</option>
            <option value="aid">Aid</option>
            <option value="rumor">Rumor</option>
          </select>
        </div>

        <div style={styles.feedContainer}>
          {filteredMessages.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyText}>NO MESSAGES</div>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <MessageCard
                key={msg.id}
                message={msg}
                expanded={expandedId === msg.id}
                onToggle={() => toggleExpand(msg.id)}
                onDelete={() => handleDeleteMessage(msg.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* SIDEBAR COLUMN */}
      <div style={styles.sidebarColumn}>
        {/* SYSTEM STATUS */}
        <div style={styles.systemSection}>
          <div style={styles.sectionLabel}>// SYSTEM</div>
          <div style={styles.systemRow}>
            <span style={styles.systemKey}>INTERNET</span>
            <span style={{...styles.systemVal, color: '#e03c3c'}}>DISCONNECTED</span>
          </div>
          <div style={styles.systemRow}>
            <span style={styles.systemKey}>LOCAL STORAGE</span>
            <span style={{...styles.systemVal, color: '#39d353'}}>ACTIVE</span>
          </div>
          <div style={styles.systemRow}>
            <span style={styles.systemKey}>DB ENTRIES</span>
            <span style={styles.systemVal}>READY</span>
          </div>
          <div style={styles.systemRow}>
            <span style={styles.systemKey}>AI LOCAL</span>
            <span style={{...styles.systemVal, color: '#f5a623'}}>LIMITED</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * MessageCard - Individual Message Display
 */
function MessageCard({ message, expanded, onToggle, onDelete }) {
  const typeLabels = {
    medical: 'MEDICAL',
    safety: 'SAFETY',
    missing: 'MISSING',
    aid: 'AID',
    rumor: 'RUMOR'
  };

  const getBorderColor = (label) => {
    if (label === 'urgent') return '#e03c3c';
    if (label === 'safe') return '#39d353';
    return '#f5a623';
  };

  const timeAgo = getTimeAgo(message.timestamp);
  const label = message.ai?.label || 'unverified';
  const borderColor = getBorderColor(label);

  return (
    <div 
      style={{
        ...styles.feedItem,
        borderLeftColor: borderColor
      }}
      onClick={onToggle}
    >
      <div style={styles.feedHeader}>
        <div style={styles.feedTitleSection}>
          <div style={styles.feedTitle}>{message.content.slice(0, 50)}</div>
          <div style={styles.feedMeta}>
            <span style={styles.metaRow}>
              <span style={styles.metaKey}>TYPE</span>
              <span style={styles.metaVal}>{typeLabels[message.type] || 'UNKNOWN'}</span>
            </span>
            <span style={styles.metaRow}>
              <span style={styles.metaKey}>TIME</span>
              <span style={styles.metaVal}>{timeAgo}</span>
            </span>
          </div>
        </div>
        
        <div style={styles.feedBadges}>
          {label === 'urgent' && (
            <span style={{...styles.badge, ...styles.badgeUrgent}}>URGENT</span>
          )}
          {label === 'safe' && (
            <span style={{...styles.badge, ...styles.badgeSafe}}>SAFE</span>
          )}
          {label === 'unverified' && (
            <span style={{...styles.badge, ...styles.badgeAmber}}>CHECKING</span>
          )}
        </div>
      </div>

      {message.ai?.confidence !== undefined && (
        <div style={styles.confidenceBar}>
          <div 
            style={{
              ...styles.confidenceFill,
              width: `${message.ai.confidence * 100}%`,
              backgroundColor: borderColor
            }}
          ></div>
        </div>
      )}

      {expanded && (
        <div style={styles.cardExpanded}>
          <div style={styles.expandedRow}>
            <span style={styles.expandedKey}>ID</span>
            <code style={styles.expandedVal}>{message.id.slice(0, 16)}...</code>
          </div>

          <div style={styles.expandedRow}>
            <span style={styles.expandedKey}>AUTHOR</span>
            <span style={styles.expandedVal}>{message.author_role || 'Unknown'}</span>
          </div>

          <div style={styles.expandedRow}>
            <span style={styles.expandedKey}>LOCATION</span>
            <span style={styles.expandedVal}>{message.location || 'Not specified'}</span>
          </div>

          <div style={styles.expandedRow}>
            <span style={styles.expandedKey}>HOP COUNT</span>
            <span style={styles.expandedVal}>{message.hop_count || 0}</span>
          </div>

          <div style={styles.expandedRow}>
            <span style={styles.expandedKey}>TRUST SCORE</span>
            <span style={styles.expandedVal}>{message.trust_score || 0}</span>
          </div>

          <div style={styles.divider}></div>

          <div style={styles.expandedRow}>
            <span style={styles.expandedKey}>CONTENT</span>
          </div>
          <div style={styles.contentBlock}>{message.content}</div>

          {message.ai && (
            <>
              <div style={styles.divider}></div>
              <div style={styles.aiSection}>
                <div style={styles.aiLabel}>AI</div>
                <div style={styles.expandedRow}>
                  <span style={styles.expandedKey}>LABEL</span>
                  <span style={{
                    ...styles.expandedVal,
                    color: getBorderColor(message.ai.label),
                    fontWeight: 600
                  }}>{message.ai.label.toUpperCase()}</span>
                </div>
                <div style={styles.expandedRow}>
                  <span style={styles.expandedKey}>CONFIDENCE</span>
                  <span style={styles.expandedVal}>{(message.ai.confidence * 100).toFixed(1)}%</span>
                </div>
                <div style={styles.expandedRow}>
                  <span style={styles.expandedKey}>SUMMARY</span>
                </div>
                <div style={styles.summaryBlock}>{message.ai.summary}</div>
              </div>
            </>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={styles.deleteBtn}
          >
            🗑 DELETE
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Get human-readable time difference
 */
function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

const styles = {
  layoutContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
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

  /* SECTION LABEL */
  sectionLabel: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#3d4248',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  /* FILTER ROW */
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px'
  },
  filterLabel: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#6b7280',
    whiteSpace: 'nowrap'
  },
  filterSelect: {
    padding: '6px 32px 6px 10px',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '11px',
    border: '1px solid #2e3338',
    backgroundColor: '#0d0e0f',
    color: '#d4d8dc',
    cursor: 'pointer',
    appearance: 'none',
    webkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236b7280'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    paddingRight: '28px',
    outline: 'none',
    transition: 'border-color 0.15s'
  },

  /* FEED CONTAINER */
  feedContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    backgroundColor: '#161819',
    border: '1px solid #1e2124',
    padding: '40px'
  },
  emptyText: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '11px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#3d4248'
  },

  /* FEED ITEMS */
  feedItem: {
    backgroundColor: '#161819',
    border: '1px solid #1e2124',
    borderLeft: '3px solid #39d353',
    padding: '14px 16px',
    cursor: 'pointer',
    transition: 'border-color 0.15s'
  },
  feedHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px'
  },
  feedTitleSection: {
    flex: 1
  },
  feedTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '16px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: '#d4d8dc',
    marginBottom: '8px'
  },
  feedMeta: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px'
  },
  metaRow: {
    display: 'flex',
    gap: '8px',
    fontSize: '10px'
  },
  metaKey: {
    fontFamily: "'Share Tech Mono', monospace",
    color: '#3d4248',
    textTransform: 'uppercase',
    fontSize: '9px',
    letterSpacing: '0.08em',
    minWidth: '45px'
  },
  metaVal: {
    fontFamily: "'Share Tech Mono', monospace",
    color: '#6b7280',
    fontSize: '9px'
  },

  /* BADGES */
  feedBadges: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    maxWidth: '120px'
  },
  badge: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '8px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '3px 7px',
    border: '1px solid',
    whiteSpace: 'nowrap'
  },
  badgeUrgent: {
    color: '#e03c3c',
    borderColor: '#5a1a1a',
    backgroundColor: 'rgba(224,60,60,0.06)'
  },
  badgeSafe: {
    color: '#39d353',
    borderColor: '#1a6628',
    backgroundColor: 'rgba(57,211,83,0.06)'
  },
  badgeAmber: {
    color: '#f5a623',
    borderColor: '#5a4a1a',
    backgroundColor: 'rgba(245,166,35,0.06)'
  },

  /* CONFIDENCE BAR */
  confidenceBar: {
    height: '2px',
    backgroundColor: '#1e2124',
    marginTop: '6px',
    overflow: 'hidden'
  },
  confidenceFill: {
    height: '100%',
    transition: 'width 0.3s'
  },

  /* EXPANDED SECTION */
  cardExpanded: {
    borderTop: '1px solid #1e2124',
    paddingTop: '14px',
    marginTop: '10px'
  },
  expandedRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '8px',
    fontSize: '10px'
  },
  expandedKey: {
    fontFamily: "'Share Tech Mono', monospace",
    color: '#3d4248',
    textTransform: 'uppercase',
    fontSize: '9px',
    letterSpacing: '0.08em',
    minWidth: '70px',
    flexShrink: 0
  },
  expandedVal: {
    fontFamily: "'Share Tech Mono', monospace",
    color: '#6b7280',
    fontSize: '9px',
    flex: 1,
    wordBreak: 'break-all'
  },
  contentBlock: {
    backgroundColor: '#0d0e0f',
    border: '1px solid #2e3338',
    padding: '10px',
    borderRadius: '2px',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '10px',
    color: '#6b7280',
    lineHeight: '1.6',
    marginBottom: '10px'
  },
  divider: {
    height: '1px',
    backgroundColor: '#1e2124',
    margin: '10px 0'
  },
  aiSection: {
    backgroundColor: '#0d0e0f',
    border: '1px solid #2e3338',
    padding: '10px',
    position: 'relative',
    marginBottom: '10px'
  },
  aiLabel: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '8px',
    letterSpacing: '0.1em',
    color: '#f5a623',
    position: 'absolute',
    top: '-8px',
    left: '12px',
    backgroundColor: '#161819',
    padding: '0 6px'
  },
  summaryBlock: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '9px',
    color: '#6b7280',
    padding: '6px',
    backgroundColor: '#161819',
    borderRadius: '2px',
    lineHeight: '1.5',
    marginBottom: '8px'
  },
  deleteBtn: {
    width: '100%',
    padding: '8px',
    backgroundColor: 'rgba(224,60,60,0.06)',
    border: '1px solid #5a1a1a',
    color: '#e03c3c',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '9px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },

  /* SIDEBAR SECTIONS */
  statsSection: {
    backgroundColor: '#161819',
    border: '1px solid #1e2124',
    padding: '16px'
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px'
  },
  statBox: {
    backgroundColor: '#0d0e0f',
    border: '1px solid #2e3338',
    padding: '12px',
    textAlign: 'center'
  },
  statVal: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '24px',
    color: '#39d353',
    lineHeight: '1',
    marginBottom: '4px',
    fontWeight: 600
  },
  statKey: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '8px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#3d4248'
  },

  /* INSTRUCTIONS */
  instructionSection: {
    backgroundColor: '#161819',
    border: '1px solid #1e2124',
    padding: '16px'
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
    fontSize: '9px',
    color: '#39d353',
    backgroundColor: 'rgba(57,211,83,0.06)',
    border: '1px solid #1a6628',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: '2px',
    fontWeight: 600
  },
  stepText: {
    fontSize: '10px',
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
    gap: '10px',
    paddingBottom: '10px',
    marginBottom: '10px',
    borderBottom: '1px solid #1e2124'
  },
  importIcon: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: '8px',
    letterSpacing: '0.1em',
    color: '#3d4248',
    textTransform: 'uppercase',
    border: '1px solid #2e3338',
    padding: '3px 5px',
    whiteSpace: 'nowrap',
    height: 'fit-content'
  },
  importInfo: {
    flex: 1
  },
  importName: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: '11px',
    fontWeight: 600,
    color: '#d4d8dc',
    marginBottom: '2px'
  },
  importDesc: {
    fontSize: '9px',
    color: '#6b7280',
    lineHeight: '1.3'
  },

  /* SYSTEM STATUS */
  systemSection: {
    backgroundColor: '#161819',
    border: '1px solid #1e2124',
    padding: '16px'
  },
  systemRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '6px',
    marginBottom: '6px',
    borderBottom: '1px solid #1e2124',
    fontSize: '9px'
  },
  systemKey: {
    fontFamily: "'Share Tech Mono', monospace",
    color: '#3d4248',
    textTransform: 'uppercase',
    letterSpacing: '0.08em'
  },
  systemVal: {
    fontFamily: "'Share Tech Mono', monospace",
    color: '#6b7280',
    textTransform: 'uppercase',
    fontSize: '8px',
    letterSpacing: '0.1em',
    fontWeight: 600
  }
};
