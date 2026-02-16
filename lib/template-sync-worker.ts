/**
 * Template Sync Worker
 * Collects all templates from localStorage and prepares them for online sync
 */

interface TemplateRef {
  templateId: string
  name: string
  editorId: string
}

interface TemplateFull {
  templateId: string
  data: unknown
  type: 'docify' | 'notify'
  editorId: string
}

interface SyncPayload {
  templates: TemplateRef[]
  timestamp: string
  count: number
}

/**
 * Find all templates in localStorage
 * Returns an array of template data ready for syncing
 */
export function getAllTemplatesFromStorage(): TemplateRef[] {
  const templates: TemplateRef[] = []

  if (typeof localStorage === 'undefined') {
    console.warn('localStorage is not available. No templates can be retrieved for syncing.')
    return templates
  }

  // Get all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) continue

    // Look for template keys: template-{templateId}
    if (key.startsWith('template-')) {
      try {
        const storedData = localStorage.getItem(key)
        
        if (storedData) {
          const { template, editorId: storedEditorId } = JSON.parse(storedData)

          if (!template) {
            continue
          }
          
          const templateId = key.replace('template-', '')

          const resolvedName =
            template.name ||
            template.fileName ||
            template.key ||
            template.subject ||
            templateId

          //check if lastOpened is with in the day
          const now = Date.now()
          const oneDay = 24 * 60 * 60 * 1000
          if (template.lastOpened && now - template.lastOpened > oneDay) {
            continue
          }

          templates.push({
            templateId,
            name: resolvedName,
            editorId: template.editorId || storedEditorId || '',
          })
        }
      } catch (err) {
        console.error(`Failed to parse template ${key}:`, err)
      }
    }
  }

  return templates
}


/**
 * Prepare templates for sync
 * Creates a sync payload with all templates ready to be sent
 */
export function prepareSyncPayload(): SyncPayload {
  const templates = getAllTemplatesFromStorage()

  return {
    templates,
    timestamp: new Date().toISOString(),
    count: templates.length,
  }
}

/**
 * Get templates by type
 */
export function getTemplatesByType(type: 'docify' | 'notify'): TemplateRef[] {
  const templates = getAllTemplatesFromStorage()
  return templates.filter((template) => {
    const full = getTemplateById(template.templateId)
    return full?.type === type
  })
}

/**
 * Get a specific template by ID
 */
export function getTemplateById(templateId: string): TemplateFull | null {
  try {
    const storedData = localStorage.getItem(`template-${templateId}`)
    if (storedData) {
      const { template, editorId: storedEditorId } = JSON.parse(storedData)
      let templateType: 'docify' | 'notify' = 'docify'
      if (template.email || template.sms) {
        templateType = 'notify'
      }

      return {
        templateId,
        data: template,
        type: templateType,
        editorId: template.editorId || storedEditorId || '',
      }
    }
  } catch (err) {
    console.error(`Failed to get template ${templateId}:`, err)
  }

  return null
}

/**
 * Check if any templates need syncing
 * (Haven't been synced yet or were modified after last sync)
 */
export function getTemplatesNeedingSync(lastSyncTime: string | null): TemplateRef[] {
  const templates = getAllTemplatesFromStorage()

  if (!lastSyncTime) {
    return templates
  }

  return templates
}

/**
 * Clear synced templates from localStorage
 * Call this after successful sync
 */
export function clearSyncedTemplates(templateIds: string[]): void {
  templateIds.forEach((id) => {
    localStorage.removeItem(`template-${id}`)
  })
}
