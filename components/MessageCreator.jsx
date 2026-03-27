/**
 * MessageCreator - React Component
 * 
 * Form to create a new message
 * Creates message for QR generation - NOT saved to feed until scanned
 * 
 * USAGE:
 * <MessageCreator onMessageCreated={handleNewMessage} />
 */

import React, { useState } from 'react';
import { createMessage, MESSAGE_TYPES, AUTHOR_ROLES } from '../utils/messageSchema';

/**
 * MessageCreator Component
 * 
 * Props:
 *   - onMessageCreated: (Function) Callback when message is created
 *   - onError: (Function) Callback for errors
 */
export default function MessageCreator({ onMessageCreated = () => {}, onError = () => {} }) {
  const [formData, setFormData] = useState({
    content: '',
    type: MESSAGE_TYPES.MEDICAL,
    author_role: AUTHOR_ROLES.CIVILIAN,
    location: '',
    aiLabel: 'unverified',
    aiSummary: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /**
   * Handle form input change
   */
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  /**
   * Handle form submission
   */
  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // Validate required fields
      if (!formData.content.trim()) {
        throw new Error('Message content is required');
      }
      if (!formData.location.trim()) {
        throw new Error('Location is required');
      }

      // Create message object
      const message = createMessage({
        content: formData.content,
        type: formData.type,
        author_role: formData.author_role,
        location: formData.location,
        ai: {
          label: formData.aiLabel,
          summary: formData.aiSummary,
          confidence: 0.5, // Default confidence
          classified_by: 'local'
        }
      });

      // DO NOT save to storage here
      // Message will be saved when scanned via QR code

      // Callback - used for QR generation
      onMessageCreated(message);

      // Show success
      setSuccess(true);

      // Reset form
      setFormData({
        content: '',
        type: MESSAGE_TYPES.MEDICAL,
        author_role: AUTHOR_ROLES.CIVILIAN,
        location: '',
        aiLabel: 'unverified',
        aiSummary: ''
      });

      // Hide success after 2 seconds
      setTimeout(() => setSuccess(false), 2000);

      setLoading(false);
    } catch (error) {
      onError(error.message);
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <h3>✍️ Create Message</h3>

      {success && (
        <div style={styles.success}>
          ✅ Message created! 
          <br />
          <span style={{ fontSize: '12px', marginTop: '5px', display: 'block' }}>
            👉 Go to "Generate QR" tab to create a QR code, then scan it to add to feed
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Content */}
        <div style={styles.formGroup}>
          <label htmlFor="content">Message Content *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Describe the situation..."
            style={styles.textarea}
            required
          />
        </div>

        {/* Type */}
        <div style={styles.formGroup}>
          <label htmlFor="type">Message Type *</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            style={styles.select}
            required
          >
            {Object.entries(MESSAGE_TYPES).map(([key, value]) => (
              <option key={value} value={value}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Author Role */}
        <div style={styles.formGroup}>
          <label htmlFor="author_role">Your Role *</label>
          <select
            id="author_role"
            name="author_role"
            value={formData.author_role}
            onChange={handleChange}
            style={styles.select}
            required
          >
            {Object.entries(AUTHOR_ROLES).map(([key, value]) => (
              <option key={value} value={value}>
                {value.replace('_', ' ').charAt(0).toUpperCase() + value.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div style={styles.formGroup}>
          <label htmlFor="location">Location *</label>
          <input
            id="location"
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Building A, Zone 2"
            style={styles.input}
            required
          />
        </div>

        {/* AI Classification */}
        <div style={styles.section}>
          <h4>🤖 AI Classification</h4>

          <div style={styles.formGroup}>
            <label htmlFor="aiLabel">Initial Label</label>
            <select
              id="aiLabel"
              name="aiLabel"
              value={formData.aiLabel}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="urgent">Urgent</option>
              <option value="safe">Safe</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="aiSummary">Summary</label>
            <input
              id="aiSummary"
              type="text"
              name="aiSummary"
              value={formData.aiSummary}
              onChange={handleChange}
              placeholder="Brief AI summary (optional)"
              style={styles.input}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.submitButton,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating...' : '📤 Create & Save Message'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#161819',
    border: '1px solid #1e2124',
    paddingTop: '1px',
    paddingBottom: '20px',
    paddingLeft: '20px',
    paddingRight: '20px',
    borderRadius: '4px',
    maxWidth: '100%'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  section: {
    padding: '14px',
    backgroundColor: '#0d0e0f',
    borderRadius: '4px',
    border: '1px solid #1e2124',
    position: 'relative'
  },
  label: {
    fontWeight: '500',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#6b7280',
    fontFamily: "'Share Tech Mono', monospace"
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #2e3338',
    borderRadius: '4px',
    fontFamily: 'inherit',
    fontSize: '13px',
    backgroundColor: '#0d0e0f',
    color: '#d4d8dc',
    outline: 'none',
    transition: 'border-color 0.15s'
  },
  textarea: {
    padding: '10px 12px',
    border: '1px solid #2e3338',
    borderRadius: '4px',
    fontFamily: 'inherit',
    fontSize: '13px',
    minHeight: '90px',
    resize: 'vertical',
    backgroundColor: '#0d0e0f',
    color: '#d4d8dc',
    outline: 'none',
    lineHeight: '1.6',
    transition: 'border-color 0.15s'
  },
  select: {
    padding: '10px 12px',
    border: '1px solid #2e3338',
    borderRadius: '4px',
    fontFamily: 'inherit',
    fontSize: '13px',
    backgroundColor: '#0d0e0f',
    color: '#d4d8dc',
    outline: 'none',
    cursor: 'pointer',
    transition: 'border-color 0.15s'
  },
  submitButton: {
    padding: '13px 20px',
    backgroundColor: '#39d353',
    color: '#050c07',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    fontFamily: "'Barlow Condensed', sans-serif",
    transition: 'all 0.15s',
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  success: {
    color: '#39d353',
    backgroundColor: '#1a6628',
    border: '1px solid #39d353',
    padding: '10px 14px',
    borderRadius: '4px',
    marginBottom: '15px',
    fontSize: '11px',
    fontFamily: "'Share Tech Mono', monospace",
    letterSpacing: '0.08em'
  }
};
