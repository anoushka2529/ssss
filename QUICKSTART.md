# QUICK START GUIDE

**QR-based Offline-First Message Propagation System**

---

## ⚡ 60-Second Setup

### 1. Install Dependencies
```bash
npm install
```

This installs:
- `react` - UI framework
- `react-dom` - DOM rendering
- `qrcode` - QR generation
- `html5-qrcode` - QR scanning
- `uuid` - Message IDs

### 2. Start Dev Server
```bash
npm run dev
```

Opens browser to `http://localhost:5173`

### 3. Test the System

**On Same Device (1 Browser):**
1. Go to **✍️ Create** tab
2. Fill message form, click "Create & Save Message"
3. Go to **📱 Generate QR** tab
4. Download QR code as PNG
5. Go to **📸 Scan QR** tab
6. Open PNG file in new browser tab, position in front of camera
7. Wait for scan (or use online QR scanner on your phone)
8. Go to **📨 Feed** tab
9. Message appears with `hop_count=1` ✅

---

## 📱 What Each Tab Does

### ✍️ Create
- Fill message form
- Select message type (medical/safety/missing/aid/rumor)
- Select your role (doctor/aid_worker/civilian/unknown)
- Specify location
- Add AI classification (optional)
- Click "Create & Save Message"
- Message stored in localStorage, ready for QR

### 📱 Generate QR
- Shows the message you just created
- Generates scannable QR code
- **Download** - Save QR as PNG image
- **Copy** - Copy QR data URL to clipboard
- Displays message metadata (ID, type, hop count, etc.)

### 📸 Scan QR
- Open camera
- Point at QR code
- Automatically detects and processes
- Increments `hop_count`
- Prevents duplicates
- Shows status: Ready, Scanned, Duplicate, or Error
- **Pause/Resume** - Control scanner
- **Restart** - Reinitialize camera

### 📨 Feed
- Shows all messages received/scanned
- Sorted newest first
- Filter by message type
- Click to expand for full details
- Shows AI classification block
- Delete messages individually
- Displays storage stats

---

## 🔄 Typical Workflow

### Scenario: Emergency Message Propagation

```
Device A (Hospital):
1. Doctor creates "Need insulin, Ward A"
2. Generates QR code
3. Takes photo of QR

Device B (Clinic):
1. Scans QR photo from Device A
2. Message received with hop_count=1
3. Creates new QR from scanned message
4. Takes photo of new QR

Device C (First Aid Camp):
1. Scans QR photo from Device B
2. Message received with hop_count=2
3. Sees original message + propagation history
4. Can respond with own message
```

**All offline. Zero network calls.**

---

## 💾 Data Storage

- All messages stored in browser **localStorage**
- Key: `qr_messages_v1`
- Limit: ~10 MB (enough for ~20,000 messages)
- Persists across page refreshes
- Clear with: `localStorage.removeItem('qr_messages_v1')`

To see stored data:
```javascript
// In DevTools console:
console.log(JSON.parse(localStorage.getItem('qr_messages_v1')));
```

---

## 🧪 Quick Tests

### Test 1: Does tap work?
```
1. Create message "Test 123"
2. Generate QR
3. Scan QR
4. Check Feed for message with hop_count=1
```

### Test 2: Can I filter messages?
```
1. Create 3 messages: medical, safety, aid types
2. Scan all 3
3. Go to Feed
4. Select filter "Safety"
5. Only safety message shows
```

### Test 3: Do duplicates get caught?
```
1. Create message, generate QR, scan it
2. Scan same QR again
3. Status shows "Duplicate"
4. Feed still has 1 message (not 2)
```

### Test 4: Does AI data persist?
```
1. Create message with AI label "urgent"
2. Scan the QR
3. Expand message in Feed
4. Check AI block: label should still be "urgent"
```

---

## 🔧 File Structure

```
/
├── package.json              # Dependencies
├── vite.config.js            # Build config
├── index.html                # Entry point
├── README.md                 # Full documentation
├── ARCHITECTURE.md           # Design details
├── TESTING.md                # Test scenarios
│
├── /src
│   └── main.jsx              # React bootstrap
│
├── /utils
│   ├── messageSchema.js       # Message validation
│   ├── storage.js             # localStorage CRUD
│   └── qrCodec.js             # Base64 encoding
│
└── /components
    ├── App.jsx                # Main app + tabs
    ├── MessageCreator.jsx      # Create message form
    ├── QRGenerator.jsx         # Generate QR codes
    ├── QRScanner.jsx           # Scan QR codes
    └── MessageFeed.jsx         # Display messages
```

---

## 📚 Message Schema

Every message has this exact structure:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Patient needs insulin",
  "type": "medical",
  "author_role": "doctor",
  "timestamp": 1711555000000,
  "location": "Ward A",
  "hop_count": 0,
  "trust_score": 0,
  "vouches": [],
  "ai": {
    "label": "urgent",
    "summary": "Critical medical need",
    "confidence": 0.9,
    "classified_by": "local"
  }
}
```

**Key Fields:**
- `id` - Unique identifier (UUID)
- `hop_count` - Starting at 0, increments on each scan
- `ai` - AI classification (preserved across devices)
- `timestamp` - When created (not updated on scan)

---

## ⚠️ Common Issues

### Issue: "QR Scanner not working"
**Fix:**
1. Check browser permissions (allow camera access)
2. Try different browser (Chrome/Edge work best)
3. Check console for errors (F12)

### Issue: "Camera permission denied"
**Fix:**
1. Check URL is HTTPS (localhost OK)
2. Go to Settings → Site Permissions → Camera → Allow
3. Reload page

### Issue: "Storage is full"
**Fix:**
1. Clear old messages: `localStorage.clear()`
2. Or delete individual messages from Feed
3. Typical: ~10 MB limit, ~20,000 messages

### Issue: "QR code won't scan"
**Fix:**
1. Ensure good lighting
2. Try moving camera closer/farther
3. Use png image instead of screenshot
4. Try online QR scanner: https://qrcode.com/qr-code-scanner

---

## 🚀 For Production

### Before Deploying:

```bash
# Build optimized bundle
npm run build

# Output in /dist folder
# Deploy dist/ to your hosting
```

### Add to HTML5 Manifest:
```html
<link rel="manifest" href="/manifest.json">
```

For offline-first, add service worker:
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

---

## 📖 More Information

- **README.md** - Complete system documentation
- **ARCHITECTURE.md** - Design philosophy and data flows
- **TESTING.md** - Test scenarios and edge cases

---

## 🎯 Key Features

✅ Offline-first (no backend needed)
✅ Peer-to-peer QR propagation
✅ Hop count tracking
✅ Duplicate detection
✅ AI metadata preserved
✅ LocalStorage persistence
✅ Graceful error handling
✅ TypeScript-ready (add .ts files)

---

## 📞 Need Help?

Check browser console for errors:
```javascript
// In DevTools console:
1. See all messages:
   localStorage.getItem('qr_messages_v1')

2. Clear storage:
   localStorage.removeItem('qr_messages_v1')

3. Check payload size:
   new Blob([localStorage.getItem('qr_messages_v1')]).size + ' bytes'
```

---

**Happy messaging! 🌐**
