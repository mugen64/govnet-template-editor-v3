# Template Sync Worker

A complete template synchronization system that collects all templates from localStorage and prepares them for online syncing.

## Architecture

The system consists of three main components:

### 1. **template-sync-worker.ts** (Core Worker)
Handles template collection and preparation for sync.

**Key Functions:**
- `getAllTemplatesFromStorage()` - Finds all templates in localStorage
- `prepareSyncPayload()` - Creates a sync-ready payload
- `getTemplatesByType(type)` - Filter templates by type (docify/notify)
- `getTemplateById(id)` - Get specific template
- `getTemplatesNeedingSync(lastSyncTime)` - Get only modified templates
- `clearSyncedTemplates(ids)` - Remove templates after successful sync

### 2. **template-sync-service.ts** (Sync Manager)
Manages sync execution and metadata.

**Key Functions:**
- `initializeTemplateSync()` - Initialize service (call at app startup)
- `syncTemplatesOnline(config)` - Execute sync with API endpoint
- `getLastSyncTime()` - Get last successful sync timestamp
- `resetSyncMetadata()` - Clear sync history

### 3. **useTemplateSync.ts** (React Hook)
React hook for component integration.

**Hook Return:**
```typescript
{
  syncStatus: SyncStatus           // Current sync state
  triggerSync: () => Promise       // Execute sync
  getSyncPayload: () => object     // Get current payload
  getTemplateCount: () => number   // Get total templates
}
```

## Usage

### Basic Setup
```tsx
import { initializeTemplateSync, syncTemplatesOnline } from '@/lib/template-sync-service'

// In your app initialization
useEffect(() => {
  initializeTemplateSync()
}, [])
```

### In Components
```tsx
import { useTemplateSync } from '@/hooks/useTemplateSync'

export function SyncButton() {
  const { syncStatus, triggerSync } = useTemplateSync()

  return (
    <div>
      <button onClick={triggerSync} disabled={syncStatus.status === 'syncing'}>
        Sync Templates {syncStatus.status === 'syncing' && '...'}
      </button>
      {syncStatus.error && <p className="text-red-500">{syncStatus.error}</p>}
      <p>{syncStatus.message}</p>
    </div>
  )
}
```

### Manual Sync
```tsx
import { syncTemplatesOnline } from '@/lib/template-sync-service'

const result = await syncTemplatesOnline({
  apiEndpoint: '/api/templates/sync',
  headers: {
    'Authorization': 'Bearer token'
  }
})

console.log(`Synced ${result.synced} templates`)
```

### Getting Sync Data
```tsx
import { prepareSyncPayload, getAllTemplatesFromStorage } from '@/lib/template-sync-worker'

// Get all templates
const allTemplates = getAllTemplatesFromStorage()
console.log(`Total templates: ${allTemplates.length}`)

// Get sync payload
const payload = prepareSyncPayload()
console.log(payload)
// {
//   templates: [ ... ],
//   timestamp: "2026-02-16T10:30:00Z",
//   count: 3
// }
```

## Data Structure

### TemplateData (per template)
```typescript
{
  templateId: string          // Unique template ID
  data: object               // Template content
  expiry: number            // Expiration timestamp
  type: 'docify' | 'notify' // Template type
  lastModified: string      // Last modification time (ISO string)
}
```

### SyncPayload (for transmission)
```typescript
{
  templates: TemplateData[]  // All templates ready to sync
  timestamp: string          // Current sync timestamp
  count: number             // Number of templates
}
```

## localStorage Keys

Templates are stored with keys: `template-{templateId}`

Example:
```
template-abc123 = { expiry: 1708086600000, template: {...} }
template-def456 = { expiry: 1708086600000, template: {...} }
```

Sync metadata is stored at: `template-sync-meta`

## Features

✅ Auto-detects template type (docify/notify)
✅ Collects all localStorage templates
✅ Prepares sync-ready payloads
✅ Tracks sync history with timestamps
✅ Filters modified-only templates
✅ Error handling with retry support (ready for implementation)
✅ Template cleanup after sync
✅ React hook integration

## TODO: Sync Endpoint Implementation

The actual API endpoint for syncing will be implemented when the backend is ready.

Expected endpoint format:
```
POST /api/templates/sync
Content-Type: application/json

{
  "templates": [...],
  "timestamp": "2026-02-16T10:30:00Z",
  "count": 3
}
```
