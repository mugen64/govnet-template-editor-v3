/**
 * Template Sync Service
 * Manages the registration and execution of template syncing
 */

import { prepareSyncPayload, getTemplatesNeedingSync } from '@/lib/template-sync-worker'

export interface SyncConfig {
  apiEndpoint: string
  headers?: Record<string, string>
  retryAttempts?: number
  retryDelay?: number
}

export interface SyncResult {
  success: boolean
  synced: number
  failed: number
  message: string
  timestamp: string
}

let lastSyncTime: string | null = null

/**
 * Initialize template sync service
 * Should be called once at app startup
 */
export function initializeTemplateSync(): void {
  // Retrieve last sync time from localStorage
  const stored = localStorage.getItem('template-sync-meta')
  if (stored) {
    try {
      const { lastSync } = JSON.parse(stored)
      lastSyncTime = lastSync
    } catch (err) {
      console.error('Failed to parse sync metadata:', err)
    }
  }

  console.log('Template sync service initialized')
}

/**
 * Execute template sync
 * Sends all pending templates to the sync endpoint
 */
export async function syncTemplatesOnline(config: SyncConfig): Promise<SyncResult> {
  try {
    // Get templates that need syncing
    const templatesNeedingSync = getTemplatesNeedingSync(lastSyncTime)

    if (templatesNeedingSync.length === 0) {
      return {
        success: true,
        synced: 0,
        failed: 0,
        message: 'No templates to sync',
        timestamp: new Date().toISOString(),
      }
    }

    // Prepare payload
    const payload = prepareSyncPayload()

    console.log(`Syncing ${payload.count} template(s)...`)

    // Send to server
    const response = await fetch(config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Sync failed with status ${response.status}`)
    }

    // Update last sync time
    lastSyncTime = new Date().toISOString()
    localStorage.setItem(
      'template-sync-meta',
      JSON.stringify({ lastSync: lastSyncTime })
    )

    return {
      success: true,
      synced: payload.count,
      failed: 0,
      message: `Successfully synced ${payload.count} template(s)`,
      timestamp: lastSyncTime,
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('Template sync error:', err)

    return {
      success: false,
      synced: 0,
      failed: 1,
      message: `Sync failed: ${errorMessage}`,
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Get last sync time
 */
export function getLastSyncTime(): string | null {
  return lastSyncTime
}

/**
 * Reset sync metadata
 */
export function resetSyncMetadata(): void {
  lastSyncTime = null
  localStorage.removeItem('template-sync-meta')
}
