import { useCallback, useState } from 'react'

export type TemplateType = 'notification' | 'document'

export interface ApiConfig {
  url: string
  auth?: {
    type: 'bearer' | 'api-key' | 'none'
    token?: string
    header?: string
  }
}

export interface Template {
  id: string
  name: string
  type: TemplateType
  content: string
  lastModified: Date
}

const defaultConfigs: Record<TemplateType, ApiConfig> = {
  notification: {
    url: process.env.NEXT_PUBLIC_NOTIFICATION_API_URL || '',
    auth: {
      type: 'none',
    },
  },
  document: {
    url: process.env.NEXT_PUBLIC_DOCUMENT_API_URL || '',
    auth: {
      type: 'none',
    },
  },
}

export function useTemplateApi(type: TemplateType) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState<ApiConfig>(defaultConfigs[type])

  const updateConfig = useCallback((newConfig: Partial<ApiConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }))
  }, [])

  const fetchTemplate = useCallback(
    async (templateId: string) => {
      setLoading(true)
      setError(null)
      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }

        if (config.auth?.type === 'bearer' && config.auth?.token) {
          headers['Authorization'] = `Bearer ${config.auth.token}`
        } else if (config.auth?.type === 'api-key' && config.auth?.token) {
          headers[config.auth.header || 'X-API-Key'] = config.auth.token
        }

        const response = await fetch(
          `${config.url}/templates/${templateId}`,
          { headers }
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch template: ${response.statusText}`)
        }

        const data = await response.json()
        return data
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown error occurred'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [config]
  )

  const saveTemplate = useCallback(
    async (template: Template) => {
      setLoading(true)
      setError(null)
      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }

        if (config.auth?.type === 'bearer' && config.auth?.token) {
          headers['Authorization'] = `Bearer ${config.auth.token}`
        } else if (config.auth?.type === 'api-key' && config.auth?.token) {
          headers[config.auth.header || 'X-API-Key'] = config.auth.token
        }

        const method = template.id ? 'PUT' : 'POST'
        const url = template.id
          ? `${config.url}/templates/${template.id}`
          : `${config.url}/templates`

        const response = await fetch(url, {
          method,
          headers,
          body: JSON.stringify(template),
        })

        if (!response.ok) {
          throw new Error(`Failed to save template: ${response.statusText}`)
        }

        const data = await response.json()
        return data
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown error occurred'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [config]
  )

  return {
    config,
    updateConfig,
    fetchTemplate,
    saveTemplate,
    loading,
    error,
  }
}
