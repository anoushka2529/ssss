/**
 * QR Data Export & Import Utilities
 * 
 * Handles exporting QR data in various formats and importing from files
 */

import { encodeMessageForQR } from './qrCodec';

/**
 * Export message as QR Base64 data
 * @param {Object} message - Message to export
 * @returns {string} Base64 encoded QR data
 */
export function exportMessageAsQRData(message) {
  try {
    return encodeMessageForQR(message);
  } catch (error) {
    throw new Error(`Failed to export QR data: ${error.message}`);
  }
}

/**
 * Export message as JSON file
 * @param {Object} message - Message to export
 * @returns {string} JSON string
 */
export function exportMessageAsJSON(message) {
  try {
    return JSON.stringify(message, null, 2);
  } catch (error) {
    throw new Error(`Failed to export JSON: ${error.message}`);
  }
}

/**
 * Download message as JSON file
 * @param {Object} message - Message to download
 */
export function downloadMessageJSON(message) {
  try {
    const jsonData = exportMessageAsJSON(message);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `message-${message.id.slice(0, 8)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

/**
 * Download QR data as Base64 text file
 * @param {Object} message - Message to download
 */
export function downloadQRDataAsText(message) {
  try {
    const qrData = exportMessageAsQRData(message);
    const blob = new Blob([qrData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-data-${message.id.slice(0, 8)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

/**
 * Copy QR data to clipboard
 * @param {Object} message - Message to copy
 * @returns {Promise<void>}
 */
export function copyQRDataToClipboard(message) {
  try {
    const qrData = exportMessageAsQRData(message);
    return navigator.clipboard.writeText(qrData).then(() => {
      console.log('✅ QR data copied to clipboard');
    });
  } catch (error) {
    console.error('Copy error:', error);
    throw error;
  }
}

/**
 * Copy message JSON to clipboard
 * @param {Object} message - Message to copy
 * @returns {Promise<void>}
 */
export function copyMessageToClipboard(message) {
  try {
    const json = exportMessageAsJSON(message);
    return navigator.clipboard.writeText(json).then(() => {
      console.log('✅ Message JSON copied to clipboard');
    });
  } catch (error) {
    console.error('Copy error:', error);
    throw error;
  }
}

/**
 * Generate a test message for demonstration
 * @returns {Object} Sample message
 */
export function generateTestMessage() {
  const { v4: uuidv4 } = require('uuid');
  
  return {
    id: uuidv4(),
    content: 'TEST: This is a sample emergency message for demonstration',
    type: 'medical',
    author_role: 'doctor',
    timestamp: Date.now(),
    location: 'Test Location',
    hop_count: 0,
    trust_score: 0,
    vouches: [],
    ai: {
      label: 'urgent',
      summary: 'Test message - demonstrates QR propagation',
      confidence: 0.85,
      classified_by: 'local'
    }
  };
}

/**
 * Get downloadable format info
 * @returns {Object} Format descriptions
 */
export function getExportFormats() {
  return {
    'QR Base64': {
      desc: 'Raw Base64 encoded QR data (smallest)',
      ext: '.txt',
      use: 'Import into scanner or share as text'
    },
    'JSON': {
      desc: 'Full message object as readable JSON',
      ext: '.json',
      use: 'Archive, backup, or inspection'
    },
    'PNG': {
      desc: 'QR code as PNG image',
      ext: '.png',
      use: 'Print, email, or screenshot'
    }
  };
}
