/**
 * QR Codec - Encoding/Decoding for QR Payloads
 * 
 * Handles Base64 encoding to manage packet size
 * QR codes have payload limits, so we encode to Base64 for efficiency
 */

/**
 * Encode message object to Base64 string
 * This reduces QR code size complexity
 * @param {Object} message - Message object to encode
 * @returns {string} Base64 encoded message
 */
export function encodeMessageForQR(message) {
  try {
    const jsonString = JSON.stringify(message);
    const base64String = btoa(unescape(encodeURIComponent(jsonString)));
    return base64String;
  } catch (error) {
    console.error('Error encoding message:', error);
    throw new Error('Failed to encode message for QR');
  }
}

/**
 * Decode Base64 string back to message object
 * @param {string} base64String - Base64 encoded message
 * @returns {Object} Decoded message object
 */
export function decodeMessageFromQR(base64String) {
  try {
    const jsonString = decodeURIComponent(escape(atob(base64String)));
    const message = JSON.parse(jsonString);
    return message;
  } catch (error) {
    console.error('Error decoding message:', error);
    throw new Error('Failed to decode QR payload');
  }
}

/**
 * Calculate approximate QR code version needed for payload
 * QR versions: 1 (21x21) to 40 (177x177)
 * Rough estimates:
 * - Version 1-5: ~25-200 bytes
 * - Version 6-10: ~200-500 bytes
 * - Version 11-20: ~500-2000 bytes
 * - Version 21-30: ~2000-5000 bytes
 * 
 * Since we're Base64 encoding, we account for ~33% size increase
 * @param {Object} message - Message to estimate
 * @returns {number} Estimated QR version (1-40)
 */
export function estimateQRVersion(message) {
  try {
    const jsonString = JSON.stringify(message);
    const base64String = btoa(unescape(encodeURIComponent(jsonString)));
    const sizeBytes = base64String.length;

    if (sizeBytes < 200) return 5;
    if (sizeBytes < 500) return 10;
    if (sizeBytes < 2000) return 20;
    if (sizeBytes < 5000) return 30;
    
    // Anything larger might be problematic
    console.warn(`Message payload is large (${sizeBytes} bytes). Consider compression.`);
    return 40;
  } catch (error) {
    console.error('Error estimating QR version:', error);
    return 20; // Default to safe middle ground
  }
}

/**
 * Get payload size information
 * @param {Object} message - Message to analyze
 * @returns {Object} { original: number, encoded: number, efficiency: string }
 */
export function getPayloadInfo(message) {
  try {
    const original = JSON.stringify(message).length;
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(message)))).length;
    const efficiency = ((original / encoded) * 100).toFixed(1);

    return {
      originalBytes: original,
      encodedBytes: encoded,
      encodingEfficiency: `${efficiency}%`
    };
  } catch (error) {
    return {
      originalBytes: 0,
      encodedBytes: 0,
      encodingEfficiency: '0%',
      error: error.message
    };
  }
}
