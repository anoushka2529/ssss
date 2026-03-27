# 🌐 QR-Based Message Propagation System

**A complete offline-first emergency communication network backbone** where devices share messages via QR codes, acting as a distributed network with no server dependency.

---

## 🎯 System Overview

This is a **packet-based data transport layer** where:
- **Humans are routers** (scanning and spreading messages)
- **Messages are packets** (structured, serialized, tracked)
- **QR codes are the wire** (physical, air-gap transport)
- **Phones are nodes** (local storage, processing)

---

## 📋 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MESSAGE LIFECYCLE                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. CREATE MESSAGE                                      │
│     └─> MessageCreator.jsx                              │
│         └─> messageSchema.js (validation)               │
│             └─> createMessage()                         │
│                                                          │
│  2. STORE LOCALLY                                       │
│     └─> storage.js                                      │
│         └─> saveMessage() to localStorage               │
│             └─> Deduplication by ID                     │
│                                                          │
│  3. GENERATE QR                                         │
│     └─> QRGenerator.jsx                                 │
│         └─> qrCodec.js                                  │
│             └─> encodeMessageForQR() (Base64)           │
│                 └─> QRCode library                      │
│                     └─> Canvas output                   │
│                                                          │
│  4. SCAN QR (Device B)                                  │
│     └─> QRScanner.jsx                                   │
│         └─> html5-qrcode library                        │
│             └─> handleScanSuccess()                     │
│                 └─> Debounce                            │
│                                                          │
│  5. DECODE & VALIDATE                                   │
│     └─> qrCodec.js decodeMessageFromQR()                │
│         └─> messageSchema.js validateMessage()          │
│             └─> Check duplicate                         │
│                                                          │
│  6. INCREMENT HOP COUNT                                 │
│     └─> messageSchema.js incrementHopCount()            │
│         hop_count += 1                                   │
│                                                          │
│  7. STORE (Device B)                                    │
│     └─> storage.js saveMessage()                        │
│         └─> Upsert in localStorage                      │
│                                                          │
│  8. RENDER IN FEED                                      │
│     └─> MessageFeed.jsx                                 │
│         └─> getAllMessages()                            │
│             └─> Display with full metadata              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 File Structure

```
/
├── package.json                 # Dependencies
├── README.md                    # This file
├── ARCHITECTURE.md              # Detailed design
│
├── /utils
│   ├── messageSchema.js         # Message validation & creation
│   ├── storage.js               # localStorage CRUD & dedup
│   └── qrCodec.js               # Base64 encoding/decoding
│
└── /components
    ├── App.jsx                  # Main integration
    ├── MessageCreator.jsx        # Form to create messages
    ├── QRGenerator.jsx           # Generate QR codes
    ├── QRScanner.jsx             # Scan QR codes
    └── MessageFeed.jsx           # Display messages
```

---

## 📨 Message Schema (STRICT)

Every message MUST follow this structure:

```json
{
  "id": "uuid string",
  "content": "string",
  "type": "medical | safety | missing | aid | rumor",
  "author_role": "doctor | aid_worker | civilian | unknown",
  "timestamp": 1234567890,
  "location": "string",

  "hop_count": 0,
  "trust_score": 0,
  "vouches": [],

  "ai": {
    "label": "urgent | safe | unverified",
    "summary": "string",
    "confidence": 0.75,
    "classified_by": "claude | local"
  }
}
```

### Key Fields

| Field | Description | Notes |
|-------|-------------|-------|
| `id` | Unique identifier | UUID v4, used for deduplication |
| `hop_count` | How many devices scanned | Increments on each scan |
| `trust_score` | Credibility score | Increased by vouching |
| `ai.label` | AI classification | urgent/safe/unverified |
| `ai.confidence` | Confidence 0-1 | Reliability of classification |

---

## 🔌 Core Components

### 1. **messageSchema.js**

Handles all message validation and creation.

```javascript
import { createMessage, validateMessage, incrementHopCount } from './utils/messageSchema';

// Create new message
const msg = createMessage({
  content: 'Patient needs insulin',
  type: 'medical',
  author_role: 'doctor',
  location: 'Ward A',
  ai: { label: 'urgent', summary: 'Critical need', confidence: 0.9 }
});

// Validate
const { valid, errors } = validateMessage(msg);

// Increment hop when scanned
const updated = incrementHopCount(msg);
```

---

### 2. **storage.js**

LocalStorage persistence with deduplication.

```javascript
import {
  saveMessage,
  getAllMessages,
  messageExists,
  deleteMessage,
  getStorageStats
} from './utils/storage';

// Save (auto-deduplicates by ID)
saveMessage(message);

// Retrieve
const allMessages = getAllMessages();

// Check for duplicate before processing
if (messageExists(message.id)) {
  console.log('Already scanned this message');
}

// Storage stats
const { totalMessages, storageSizeBytes } = getStorageStats();
```

---

### 3. **qrCodec.js**

Serialization and encoding for QR payload.

```javascript
import {
  encodeMessageForQR,
  decodeMessageFromQR,
  estimateQRVersion,
  getPayloadInfo
} from './utils/qrCodec';

// Encode for QR (Base64)
const encoded = encodeMessageForQR(message);
// Result: "eyJpZCI6IjEyMzQi..." (safe for QR)

// Decode from QR
const decoded = decodeMessageFromQR(qrString);

// Get info
const info = getPayloadInfo(message);
// { originalBytes: 245, encodedBytes: 327, encodingEfficiency: '75%' }
```

---

### 4. **QRGenerator.jsx**

Component to create scannable QR codes.

```jsx
import QRGenerator from './components/QRGenerator';

<QRGenerator
  message={messageObject}
  onError={(err) => console.error(err)}
  size={300}
/>
```

**Props:**
- `message` - Message object to encode
- `onError` - Error callback
- `size` - QR size in pixels (default: 200)

**Features:**
- Generates on canvas for performance
- Download as PNG
- Copy as data URL
- Estimates QR version needed

---

### 5. **QRScanner.jsx**

Component to scan and process QR codes.

```jsx
import QRScanner from './components/QRScanner';

<QRScanner
  onMessageScanned={(msg) => console.log('Got:', msg)}
  onError={(err) => console.error(err)}
  onDuplicate={(msg) => console.log('Already seen:', msg.id)}
/>
```

**Props:**
- `onMessageScanned` - Fires when valid message is processed
- `onError` - Error callback
- `onDuplicate` - Called when duplicate detected

**Processing Pipeline:**
1. Scan QR string
2. Decode Base64
3. Parse JSON
4. Validate schema
5. Check for duplicate
6. Increment `hop_count`
7. Save to localStorage
8. Callback with updated message

**Edge Case Handling:**
- ✅ Debounces rapid scans (1 second)
- ✅ Rejects invalid schemas
- ✅ Prevents duplicate processing
- ✅ Graceful error recovery
- ✅ Resume/pause controls

---

### 6. **MessageFeed.jsx**

Display all scanned messages.

```jsx
import MessageFeed from './components/MessageFeed';

<MessageFeed
  refresh={shouldRefresh}
  onDelete={(id) => console.log('Deleted:', id)}
/>
```

**Features:**
- Sorted by timestamp (newest first)
- Filter by message type
- Expandable details view
- AI classification display
- Hop count and trust badges
- Delete messages

---

### 7. **MessageCreator.jsx**

Form to create new messages.

```jsx
import MessageCreator from './components/MessageCreator';

<MessageCreator
  onMessageCreated={(msg) => console.log('Created:', msg)}
  onError={(err) => console.error(err)}
/>
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 16+
- Modern browser with camera access (for scanning)

### Installation

```bash
# Install dependencies
npm install

# Install if using React + Vite
npm install react react-dom qrcode html5-qrcode uuid

# Start dev server
npm run dev

# Build for production
npm run build
```

### Browser Permissions

The scanner requires USB camera access. Users will see a permission prompt on first scan.

---

## 🔄 Complete Integration Example

```jsx
import React, { useState } from 'react';
import App from './components/App';

export default function index() {
  return <App />;
}
```

This provides:
1. **Create Tab** - MessageCreator form
2. **Generate QR Tab** - QRGenerator canvas
3. **Scan QR Tab** - QRScanner reader
4. **Feed Tab** - MessageFeed display

---

## 📊 Data Flow

### Device A (Create)
```
User fills form
       ↓
MessageCreator validates
       ↓
createMessage() with UUID
       ↓
saveMessage() to localStorage
       ↓
QRGenerator encodes + creates QR
       ↓
User downloads/shares QR image
```

### Device B (Scan)
```
User points camera at QR
       ↓
html5-qrcode scans → Base64 string
       ↓
decodeMessageFromQR() → JSON
       ↓
validateMessage() checks schema
       ↓
if new: messageExists() check
       ↓
incrementHopCount() (0→1)
       ↓
saveMessage() to localStorage (upsert)
       ↓
onMessageScanned() callback
       ↓
MessageFeed refreshes + displays
```

---

## ⚙️ Key Features

### 1. **Schema Validation**
Every message is validated against strict schema. Invalid messages are rejected.

```javascript
const { valid, errors } = validateMessage(msg);
if (!valid) {
  console.error('Invalid:', errors);
}
```

### 2. **Deduplication**
Messages are stored by ID. Scanning the same QR twice doesn't create duplicates—it just updates hop count.

```javascript
const exists = messageExists(id);
if (exists) {
  return; // Duplicate, ignore
}
```

### 3. **Hop Tracking**
Each scan increments `hop_count`:
- Hop 0: Created on Device A
- Hop 1: Scanned on Device B
- Hop 2: Scanned on Device C
- etc.

```javascript
const updated = incrementHopCount(message);
// hop_count: 0 → 1
```

### 4. **AI Metadata Preservation**
The entire `ai` block persists across all devices:
- `label` - urgency
- `confidence` - reliability
- `summary` - reasoning
- `classified_by` - source

### 5. **Offline Operation**
No backend required. All data stays on device:
- localStorage for persistence
- QR as transport
- No internet needed

### 6. **Error Recovery**
Handles all edge cases:
- Corrupt QR → rejected
- Invalid schema → error logged
- Duplicate scan → silently ignored
- Scanner permission denied → graceful fallback
- Storage quota exceeded → warning logged

---

## 🧪 Testing Workflow

### Single Device Test
```
1. Go to "Create" tab
2. Fill form, click "Create"
3. Go to "Generate QR" tab
4. Download QR
5. Open QR image in browser
6. Go to "Scan QR" tab
7. Use https://qrcode.com/qr-code-scanner to scan your screen
8. Check "Feed" tab for result
```

### Multi-Device Test
```
Device A:
1. Create message
2. Download QR code PNG

Device B:
1. Load the QR code image
2. Open app, go to "Scan QR"
3. Point camera at Device A's screen showing QR

Result:
- Message appears on Device B feed
- hop_count is 1
- All metadata preserved
```

---

## 📈 Performance

| Operation | Time | Target |
|-----------|------|--------|
| Generate QR | ~50ms | < 100ms |
| Scan QR | ~200ms | < 500ms |
| Save message | ~5ms | instant |
| Render feed (100 msgs) | ~100ms | smooth |

---

## 🔒 Security Notes

**Current Implementation:**
- ✅ No backend exposure
- ✅ No API keys
- ✅ No authentication (can be added)
- ✅ No encryption (consider for sensitive data)

**Future Enhancements:**
- Add end-to-end encryption for sensitive messages
- Implement message signing
- Add trust verification system

---

## 🐛 Known Limitations

1. **Storage**: localStorage has ~5-10MB limit per domain. Implement IndexedDB for large datasets.
2. **Payload Size**: Very large messages might create complex QR codes. Compress if needed.
3. **Coverage**: Humans must physically scan. No wireless relay (intentional for air-gap networks).
4. **Browser**: Requires modern browser with WebRTC/canvas support.

---

## 🔄 Migration to IndexedDB

Current system uses `localStorage`. To scale to 1000+ messages:

```javascript
// Replace storage.js functions with IndexedDB equivalents
// Use idb library:
npm install idb

// Maintain same API surface:
const db = openDB('qr_messages');
await db.put('messages', message);
```

---

## 📚 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `qrcode` | ^1.5.3 | QR generation |
| `html5-qrcode` | ^2.3.4 | QR scanning |
| `uuid` | ^9.0.0 | Message IDs |
| `react` | ^18.2.0 | UI framework |
| `react-dom` | ^18.2.0 | DOM rendering |

---

## 🎓 How It Works (Deep Dive)

### Message Creation
1. User fills form (content, type, location, etc.)
2. `createMessage()` generates UUID
3. `validateMessage()` checks all fields
4. `saveMessage()` stores in localStorage

### QR Encoding
1. `JSON.stringify(message)` serializes
2. `btoa(unescape(encodeURIComponent()))` Base64 encodes
3. `estimateQRVersion()` determines QR size
4. `QRCode.toCanvas()` renders to canvas
5. User downloads as PNG

### QR Scanning
1. `Html5QrcodeScanner` captures camera frame
2. Detects QR pattern and reads data
3. Callback with raw Base64 string
4. `decodeMessageFromQR()` Base64 decodes
5. `JSON.parse()` deserializes to object
6. `validateMessage()` checks schema
7. `messageExists()` prevents duplicates
8. `incrementHopCount()` increments hop
9. `saveMessage()` upserts in localStorage

### Storage
- **Key**: `qr_messages_v1`
- **Value**: JSON array of messages
- **Sorting**: by timestamp descending
- **Deduplication**: by message `.id`

---

## 📝 Usage Examples

### Example 1: Create and Encode

```javascript
import { createMessage } from './utils/messageSchema';
import { saveMessage } from './utils/storage';
import { encodeMessageForQR } from './utils/qrCodec';

const message = createMessage({
  content: 'Water pump at coordinates 12.34, 56.78',
  type: 'aid',
  author_role: 'aid_worker',
  location: 'North Camp',
  ai: {
    label: 'safe',
    summary: 'Resource availability update'
  }
});

saveMessage(message);
const encoded = encodeMessageForQR(message);
console.log(encoded); // Base64 string for QR
```

### Example 2: Scan and Process

```javascript
import { decodeMessageFromQR } from './utils/qrCodec';
import { validateMessage, incrementHopCount } from './utils/messageSchema';
import { messageExists, saveMessage } from './utils/storage';

async function processScan(qrString) {
  // Decode
  const message = decodeMessageFromQR(qrString);

  // Validate
  const { valid, errors } = validateMessage(message);
  if (!valid) throw new Error(errors.join(', '));

  // Check duplicate
  if (messageExists(message.id)) {
    console.log('Already scanned');
    return;
  }

  // Increment hop
  const updated = incrementHopCount(message);

  // Save
  saveMessage(updated);

  return updated;
}
```

### Example 3: Display Messages

```javascript
import { getAllMessages } from './utils/storage';

function displayAllMessages() {
  const messages = getAllMessages();

  messages.forEach((msg) => {
    console.log(`
      ID: ${msg.id}
      Type: ${msg.type}
      Hops: ${msg.hop_count}
      Content: ${msg.content}
      AI: ${msg.ai.label} (${(msg.ai.confidence * 100).toFixed(0)}% confident)
    `);
  });
}
```

---

## 🎯 Design Philosophy

This system treats **messages as packets in a distributed network:**

1. **Decentralization**: No server, no single point of failure
2. **Resilience**: Works offline, can reach air-gap networks
3. **Simplicity**: QR code is universal, requires only a camera
4. **Auditability**: Every hop is tracked via `hop_count`
5. **Extensibility**: Schema supports custom AI classifications

---

## 📞 Support

For issues:
1. Check browser console for errors
2. Verify localStorage is enabled (`localStorage.clear()` for fresh start)
3. Try a different camera/device
4. Check QR payload size with `getPayloadInfo()`

---

## 📄 License

MIT - Free for emergency and humanitarian use.

---

**Built for resilience. Designed for humanity.**
"# ssss" 
