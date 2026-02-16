'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import {
    getAllTemplatesFromStorage,
    prepareSyncPayload,
    getTemplatesByType,
    getTemplatesNeedingSync,
    clearSyncedTemplates,
} from '@/lib/template-sync-worker'
import { EDITOR_STORAGE_KEY, useEditorStorage } from './useEditorStorage'
import { EditorConfig } from '@/lib/editor-types'
import { updateDocifyTemplate, updateDocifyTemplateVariable } from '@/lib/editor-api'

interface SyncStatus {
    status: 'idle' | 'syncing' | 'success' | 'error'
    message: string
    progress: number
    totalTemplates: number
    syncedTemplates: number
    error: string | null
}

interface UseSyncTemplatesReturn {
    syncStatus: SyncStatus
    triggerSync: (options?: { source?: 'manual' | 'auto' }) => Promise<void>
    getSyncPayload: () => unknown
    getTemplateCount: () => number
}

/**
 * Hook for managing template synchronization
 * Finds all templates in localStorage and prepares them for syncing
 */
export function useTemplateSync(): UseSyncTemplatesReturn {
    const { getEditor } = useEditorStorage()
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        status: 'idle',
        message: 'Ready to sync',
        progress: 0,
        totalTemplates: 0,
        syncedTemplates: 0,
        error: null,
    })
    const syncInFlightRef = useRef(false)

    // Get total template count
    const getTemplateCount = useCallback(() => {
        const templates = getAllTemplatesFromStorage()
        return templates.length
    }, [])


    // Get sync payload
    const getSyncPayload = useCallback(() => {
        return prepareSyncPayload()
    }, [])


    // Trigger sync
    const triggerSync = useCallback(async (options?: { source?: 'manual' | 'auto' }) => {
        const source = options?.source ?? 'manual'
        if (syncInFlightRef.current) {
            if (source === 'manual') {
                toast.info('Sync already running')
            }
            return
        }

        syncInFlightRef.current = true
        let toastId: string | number | undefined
        try {
            // Get all templates ready for sync
            const payload = prepareSyncPayload()

            if (payload.count === 0) {
                setSyncStatus({
                    status: 'idle',
                    message: 'No templates to sync',
                    progress: 0,
                    totalTemplates: 0,
                    syncedTemplates: 0,
                    error: null,
                })
                if (source === 'manual') {
                    toast.info('No templates to sync')
                }
                return
            }

            toastId = toast.loading(
                source === 'auto' ? 'Auto-syncing templates...' : 'Syncing templates...'
            )

            setSyncStatus({
                status: 'syncing',
                message: 'Preparing templates for sync...',
                progress: 0,
                totalTemplates: 0,
                syncedTemplates: 0,
                error: null,
            })

            setSyncStatus((prev) => ({
                ...prev,
                totalTemplates: payload.count,
                message: `Found ${payload.count} template(s) to sync`,
                progress: 25,
            }))

            for (let index = 0; index < payload.count; index++) {
                const template = payload.templates[index]
                const editors: EditorConfig[] = JSON.parse(localStorage.getItem(EDITOR_STORAGE_KEY) || '[]')
                const editor = editors.find((e) => e.id === template.editorId)
                if (!editor) {
                    continue
                }
                setSyncStatus((prev) => ({
                    ...prev,
                    syncedTemplates: index + 1,
                    message: `Prepared ${index + 1} of ${payload.count} template(s)`,
                    progress: 25 + Math.round(((index + 1) / payload.count) * 50),
                }))
                await new Promise((resolve) => setTimeout(resolve, 1000))
                if (template.type === 'docify') {
                    try {
                        await updateDocifyTemplateVariable(template, editor)
                        setSyncStatus((prev) => ({
                            ...prev,
                            syncedTemplates: prev.syncedTemplates + 1,
                            message: `Prepared ${prev.syncedTemplates} of ${payload.count} template(s)`,
                            progress: 25 + Math.round((prev.syncedTemplates / payload.count) * 50),
                        }))
                    } catch (err) {
                        console.error(`Failed to prepare docify template ${template.templateId}:`, err)
                        setSyncStatus((prev) => ({
                            ...prev,
                            message: `Error preparing template ${template.templateId}`,
                            error: err instanceof Error ? err.message : 'Unknown error',
                        }))
                    }

                    try {
                        await updateDocifyTemplateVariable(template, editor)
                        setSyncStatus((prev) => ({
                            ...prev,
                            syncedTemplates: prev.syncedTemplates + 1,
                            message: `Prepared ${prev.syncedTemplates} of ${payload.count} template(s)`,
                            progress: 25 + Math.round((prev.syncedTemplates / payload.count) * 50),
                        }))
                    } catch (err) {
                        console.error(`Failed to prepare notify template ${template.templateId}:`, err)
                        setSyncStatus((prev) => ({
                            ...prev,
                            message: `Error preparing template ${template.templateId}`,
                            error: err instanceof Error ? err.message : 'Unknown error',
                        }))
                    }
                } else if (template.type === 'notify') {
                    try {
                        await updateDocifyTemplateVariable(template, editor)
                        setSyncStatus((prev) => ({
                            ...prev,
                            syncedTemplates: prev.syncedTemplates + 1,
                            message: `Prepared ${prev.syncedTemplates} of ${payload.count} template(s)`,
                            progress: 75 + Math.round((prev.syncedTemplates / payload.count) * 25),
                        }))
                    } catch (err) {
                        console.error(`Failed to prepare docify template ${template.templateId}:`, err)
                        setSyncStatus((prev) => ({
                            ...prev,
                            message: `Error preparing template ${template.templateId}`,
                            error: err instanceof Error ? err.message : 'Unknown error',
                        }))
                    }
                }
            }

            setSyncStatus({
                status: 'success',
                message: `Ready to sync ${payload.count} template(s)`,
                progress: 100,
                totalTemplates: payload.count,
                syncedTemplates: payload.count,
                error: null,
            })
            toast.success(`Synced ${payload.count} template(s)`, { id: toastId })
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
            setSyncStatus({
                status: 'error',
                message: 'Failed to prepare templates for sync',
                progress: 0,
                totalTemplates: 0,
                syncedTemplates: 0,
                error: errorMessage,
            })
            if (toastId) {
                toast.error(`Sync failed: ${errorMessage}`, { id: toastId })
            } else {
                toast.error(`Sync failed: ${errorMessage}`)
            }
            console.error('Sync error:', err)
        } finally {
            syncInFlightRef.current = false
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            void triggerSync({ source: 'auto' })
        }, 30000)

        return () => clearInterval(interval)
    }, [triggerSync])

    return {
        syncStatus,
        triggerSync,
        getSyncPayload,
        getTemplateCount,
    }
}
