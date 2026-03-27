/**
 * Storage Layer (localStorage)
 * 
 * Handles persistence of messages locally.
 * Deduplicates by message ID.
 * Provides CRUD operations for messages.
 */

const STORAGE_KEY = 'qr_messages_v1';

/**
 * Get value from localStorage, return empty array if not found
 * @returns {Array} Array of stored messages
 */
function getStoredMessages() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

/**
 * Write messages to localStorage
 * @param {Array} messages - Array of messages to store
 */
function writeStoredMessages(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Consider archiving old messages.');
    }
  }
}

/**
 * Save a single message to storage
 * Deduplicates by ID - if message with same ID exists, updates it
 * @param {Object} message - Message to save
 */
export function saveMessage(message) {
  const messages = getStoredMessages();
  
  // Check if message with this ID already exists
  const existingIndex = messages.findIndex((m) => m.id === message.id);
  
  if (existingIndex >= 0) {
    // Update existing message (e.g., hop_count was incremented)
    messages[existingIndex] = message;
  } else {
    // Add new message
    messages.push(message);
  }

  // Keep messages sorted by timestamp (newest first)
  messages.sort((a, b) => b.timestamp - a.timestamp);

  writeStoredMessages(messages);
  return message;
}

/**
 * Get all stored messages
 * @returns {Array} All messages sorted by timestamp (newest first)
 */
export function getAllMessages() {
  const messages = getStoredMessages();
  return messages.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Get a single message by ID
 * @param {string} id - Message ID
 * @returns {Object|null} Message or null if not found
 */
export function getMessageById(id) {
  const messages = getStoredMessages();
  return messages.find((m) => m.id === id) || null;
}

/**
 * Check if a message with given ID already exists
 * Used to prevent duplicate processing
 * @param {string} id - Message ID
 * @returns {boolean}
 */
export function messageExists(id) {
  const messages = getStoredMessages();
  return messages.some((m) => m.id === id);
}

/**
 * Delete a message by ID
 * @param {string} id - Message ID
 * @returns {boolean} True if deleted, false if not found
 */
export function deleteMessage(id) {
  const messages = getStoredMessages();
  const filtered = messages.filter((m) => m.id !== id);

  if (filtered.length < messages.length) {
    writeStoredMessages(filtered);
    return true;
  }

  return false;
}

/**
 * Clear all messages from storage
 * WARNING: This is destructive
 */
export function clearAllMessages() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get storage statistics
 * @returns {Object} { totalMessages, storageSize }
 */
export function getStorageStats() {
  const messages = getStoredMessages();
  const storageSize = new Blob([JSON.stringify(messages)]).size; // in bytes

  return {
    totalMessages: messages.length,
    storageSizeBytes: storageSize,
    storageSizeKB: (storageSize / 1024).toFixed(2)
  };
}

/**
 * Export all messages as JSON (for backup)
 * @returns {string} JSON string of all messages
 */
export function exportMessagesAsJSON() {
  const messages = getStoredMessages();
  return JSON.stringify(messages, null, 2);
}

/**
 * Import messages from JSON
 * Merges with existing messages, deduplicates by ID
 * @param {string} jsonString - JSON string to import
 * @returns {Object} { success: boolean, imported: number, errors: string[] }
 */
export function importMessagesFromJSON(jsonString) {
  const errors = [];
  let imported = 0;

  try {
    const importedMessages = JSON.parse(jsonString);

    if (!Array.isArray(importedMessages)) {
      throw new Error('Imported data must be an array');
    }

    const existing = getStoredMessages();

    importedMessages.forEach((msg) => {
      // Check if message with this ID already exists
      if (!existing.find((m) => m.id === msg.id)) {
        existing.push(msg);
        imported++;
      }
    });

    existing.sort((a, b) => b.timestamp - a.timestamp);
    writeStoredMessages(existing);

    return {
      success: true,
      imported,
      errors
    };
  } catch (error) {
    return {
      success: false,
      imported: 0,
      errors: [error.message]
    };
  }
}
