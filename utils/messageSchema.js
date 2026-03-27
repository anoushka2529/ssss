/**
 * Message Schema Validator & Creator
 * 
 * This module defines the strict schema for all messages in the system.
 * Every message MUST conform to this structure.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Message types allowed in the system
 */
export const MESSAGE_TYPES = {
  MEDICAL: 'medical',
  SAFETY: 'safety',
  MISSING: 'missing',
  AID: 'aid',
  RUMOR: 'rumor'
};

/**
 * Author roles in the system
 */
export const AUTHOR_ROLES = {
  DOCTOR: 'doctor',
  AID_WORKER: 'aid_worker',
  CIVILIAN: 'civilian',
  UNKNOWN: 'unknown'
};

/**
 * AI classification labels
 */
export const AI_LABELS = {
  URGENT: 'urgent',
  SAFE: 'safe',
  UNVERIFIED: 'unverified'
};

/**
 * AI classification sources
 */
export const AI_SOURCES = {
  CLAUDE: 'claude',
  LOCAL: 'local'
};

/**
 * Validates a message object against the schema
 * @param {Object} message - The message to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateMessage(message) {
  const errors = [];

  // Check required fields
  if (!message.id || typeof message.id !== 'string') {
    errors.push('Missing or invalid id');
  }

  if (!message.content || typeof message.content !== 'string' || message.content.trim() === '') {
    errors.push('Missing or invalid content');
  }

  if (!Object.values(MESSAGE_TYPES).includes(message.type)) {
    errors.push(`Invalid type. Must be one of: ${Object.values(MESSAGE_TYPES).join(', ')}`);
  }

  if (!Object.values(AUTHOR_ROLES).includes(message.author_role)) {
    errors.push(`Invalid author_role. Must be one of: ${Object.values(AUTHOR_ROLES).join(', ')}`);
  }

  if (typeof message.timestamp !== 'number' || message.timestamp <= 0) {
    errors.push('Invalid timestamp (must be positive number)');
  }

  if (!message.location || typeof message.location !== 'string' || message.location.trim() === '') {
    errors.push('Missing or invalid location');
  }

  // Check hop tracking
  if (typeof message.hop_count !== 'number' || message.hop_count < 0) {
    errors.push('Invalid hop_count');
  }

  if (typeof message.trust_score !== 'number' || message.trust_score < 0) {
    errors.push('Invalid trust_score');
  }

  if (!Array.isArray(message.vouches)) {
    errors.push('vouches must be an array');
  }

  // Check AI block
  if (!message.ai || typeof message.ai !== 'object') {
    errors.push('Missing or invalid ai block');
  } else {
    if (!Object.values(AI_LABELS).includes(message.ai.label)) {
      errors.push(`Invalid ai.label. Must be one of: ${Object.values(AI_LABELS).join(', ')}`);
    }
    if (typeof message.ai.summary !== 'string') {
      errors.push('Invalid ai.summary');
    }
    if (typeof message.ai.confidence !== 'number' || message.ai.confidence < 0 || message.ai.confidence > 1) {
      errors.push('Invalid ai.confidence (must be 0-1)');
    }
    if (!Object.values(AI_SOURCES).includes(message.ai.classified_by)) {
      errors.push(`Invalid ai.classified_by. Must be one of: ${Object.values(AI_SOURCES).join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create a new message with all required fields
 * @param {Object} data - Partial message data
 * @returns {Object} Complete message object
 */
export function createMessage(data) {
  const message = {
    id: data.id || uuidv4(),
    content: data.content,
    type: data.type,
    author_role: data.author_role || AUTHOR_ROLES.CIVILIAN,
    timestamp: data.timestamp || Date.now(),
    location: data.location,

    hop_count: data.hop_count ?? 0,
    trust_score: data.trust_score ?? 0,
    vouches: data.vouches ?? [],

    ai: {
      label: data.ai?.label || AI_LABELS.UNVERIFIED,
      summary: data.ai?.summary || '',
      confidence: data.ai?.confidence ?? 0,
      classified_by: data.ai?.classified_by || AI_SOURCES.LOCAL
    }
  };

  const validation = validateMessage(message);
  if (!validation.valid) {
    throw new Error(`Invalid message: ${validation.errors.join(', ')}`);
  }

  return message;
}

/**
 * Increment hop count (called when message is scanned)
 * @param {Object} message - The message to update
 * @returns {Object} Updated message
 */
export function incrementHopCount(message) {
  return {
    ...message,
    hop_count: message.hop_count + 1
  };
}

/**
 * Add a vouch to a message
 * @param {Object} message - The message to update
 * @param {string} voucherId - ID of person vouching
 * @returns {Object} Updated message
 */
export function addVouch(message, voucherId) {
  if (!message.vouches.includes(voucherId)) {
    return {
      ...message,
      vouches: [...message.vouches, voucherId]
    };
  }
  return message;
}
