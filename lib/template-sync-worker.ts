/**
 * Template Sync Worker
 * Collects all templates from localStorage and prepares them for online sync
 */

interface TemplateData {
  templateId: string
  data: unknown
  expiry: number
  type: 'docify' | 'notify'
  lastModified: string
  editorId: string
}

interface SyncPayload {
  templates: TemplateData[]
  timestamp: string
  count: number
}

/**
 * Find all templates in localStorage
 * Returns an array of template data ready for syncing
 */
export function getAllTemplatesFromStorage(): TemplateData[] {
  const templates: TemplateData[] = []

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
          const { expiry, template, ...rest } = JSON.parse(storedData)

          if (!template) {
            continue
          }
          
          const templateId = key.replace('template-', '')

          // Determine template type based on properties
          let templateType: 'docify' | 'notify' = 'docify'
          if (template.email || template.sms) {
            templateType = 'notify'
          }

          //check if lastOpened is with in the day
          const now = Date.now()
          const oneDay = 24 * 60 * 60 * 1000
          if (template.lastOpened && now - template.lastOpened > oneDay) {
            continue
          }

          templates.push({
            ...rest,
            templateId,
            data: template,
            expiry,
            type: templateType,
            lastModified: new Date().toISOString(),
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
export function getTemplatesByType(type: 'docify' | 'notify'): TemplateData[] {
  return getAllTemplatesFromStorage().filter((t) => t.type === type)
}

/**
 * Get a specific template by ID
 */
export function getTemplateById(templateId: string): TemplateData | null {
  try {
    const storedData = localStorage.getItem(`template-${templateId}`)
    if (storedData) {
      const { expiry, template } = JSON.parse(storedData)
      let templateType: 'docify' | 'notify' = 'docify'
      if (template.email || template.sms) {
        templateType = 'notify'
      }

      return {
        templateId,
        data: template,
        expiry,
        type: templateType,
        lastModified: new Date().toISOString(),
        editorId: template.editorId || '',
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
export function getTemplatesNeedingSync(lastSyncTime: string | null): TemplateData[] {
  const templates = getAllTemplatesFromStorage()

  if (!lastSyncTime) {
    // If no last sync time, all templates need syncing
    return templates
  }

  const lastSyncDate = new Date(lastSyncTime).getTime()

  return templates.filter((template) => {
    const modifiedDate = new Date(template.lastModified).getTime()
    return modifiedDate > lastSyncDate
  })
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
