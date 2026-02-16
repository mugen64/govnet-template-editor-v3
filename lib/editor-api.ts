import { EditorConfig } from "./editor-types"

export function updateDocifyTemplateVariable(template: any, editor: EditorConfig) {
    return new Promise(async (resolve, reject) => {
        try {
           
            const jsonFormData = new FormData()
            jsonFormData.append("templateId", template.id)
            jsonFormData.append("name", template.name)
            jsonFormData.append("pageSettings", JSON.stringify(template.pageSettings))
            jsonFormData.append("sampleJsonData", template.sampleJsonData)
            jsonFormData.append("folderName", template.folderName)
            jsonFormData.append("tags", JSON.stringify(template.tags))

            const headers: HeadersInit = {}
            if (editor.credentialsType === 'header') {
                editor.credentials.forEach((cred) => {
                    if (cred.key && cred.value) {
                        headers[cred.key] = cred.value
                    }
                })
            }

            const response = await fetch(`${editor.apiUrl}/templates/edit-page-settings/${template.id}`, {
                method: "PUT",
                body: jsonFormData,
                headers,
            })

            if (!response.ok) {
                throw new Error(`Failed to update template ${template.id}: ${response.statusText}`)
            }

            resolve(true)
        } catch (err) {
            console.error(`Failed to update docify template ${template.id}:`, err)
            reject(err)
        }
    })
}

export function updateDocifyTemplate(template: any, editor: EditorConfig) {
    return new Promise(async (resolve, reject) => {
        try {

            const headers: HeadersInit = {}
            if (editor.credentialsType === 'header') {
                editor.credentials.forEach((cred) => {
                    if (cred.key && cred.value) {
                        headers[cred.key] = cred.value
                    }
                })
            }

            const htmlContent = template.htmlContent || ''
            const name = template.name || `template-${template.id}`
            const file = new File([htmlContent], 'template.html', {
                type: 'text/html',
            })

            const formData = new FormData()
            const htmlBlob = new Blob([htmlContent], { type: "text/html" })
            formData.append("file", htmlBlob, `${name.toUpperCase().replace(/[^A-Z0-9_]/g, '_')}.html`)
            formData.append("templateId", template.id)

            const response = await fetch(`${editor.apiUrl}/templates/${template.id}`, {
                method: "PUT",
                body: formData,
                headers,
            })

            if (!response.ok) {
                throw new Error(`Failed to prepare HTML content for template ${template.id}: ${response.statusText}`)
            }

            resolve(true)
        } catch (err) {
            console.error(`Failed to update docify template ${template.id}:`, err)
            reject(err)
        }
    })
}

const appendQueryCredentials = (url: string, editor: EditorConfig): string => {
    if (editor.credentialsType === 'query') {
        const params = new URLSearchParams()
        editor.credentials.forEach((cred) => {
            if (cred.key && cred.value) {
                params.append(cred.key, cred.value)
            }
        })
        if (Array.from(params.keys()).length > 0) {
            return `${url}?${params.toString()}`
        }
    }

    return url
}

export function createDocifyTemplate(template: any, editor: EditorConfig) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!editor.apiUrl) {
                throw new Error('Missing API URL for editor')
            }

            const headers: HeadersInit = {}
            if (editor.credentialsType === 'header') {
                editor.credentials.forEach((cred) => {
                    if (cred.key && cred.value) {
                        headers[cred.key] = cred.value
                    }
                })
            }

            const sampleHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Sample Template</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
      h1 { font-size: 20px; margin: 0 0 12px; }
      p { margin: 0 0 8px; }
    </style>
  </head>
  <body>
    <h1>Sample PDF Template</h1>
    <p>This is a placeholder HTML file for a new PDF template.</p>
    <p>Replace this content with your actual template markup.</p>
  </body>
</html>
`

            const htmlContent = template.htmlContent || sampleHtml
            const name = template.name || template.fileName || `template-${Date.now()}`
            const fileName = `${name.toUpperCase().replace(/[^A-Z0-9_]/g, '_')}.html`
            const htmlBlob = new Blob([htmlContent], { type: 'text/html' })

            const formData = new FormData()
            formData.append('name', name)
            formData.append('file', htmlBlob, fileName)
            formData.append('folderName', template.folderName || '')
            formData.append('tags', JSON.stringify(template.tags || []))
            formData.append(
                'pageSettings',
                JSON.stringify(
                    template.pageSettings || {
                        pageSize: 'A4',
                        orientation: 'portrait',
                        marginTop: 15,
                        marginBottom: 15,
                        marginLeft: 15,
                        marginRight: 15,
                    }
                )
            )
            formData.append('sampleJsonData', template.sampleJsonData || JSON.stringify({}))

            const url = appendQueryCredentials(`${editor.apiUrl}templates`, editor)

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: formData,
            })

            if (!response.ok) {
                throw new Error(`Failed to create template: ${response.statusText}`)
            }

            resolve(true)
        } catch (err) {
            console.error('Failed to create docify template:', err)
            reject(err)
        }
    })
}

export interface EmailTemplatePayload {
  key: string
  sender: string
  subject: string
  email: string
  sms: string
  cc?: string[]
  bcc?: string[]
  data?: Record<string, string>
}


export function updateNotifyTemplate(template: any, editor: EditorConfig) {
    return new Promise(async (resolve, reject) => {
        try {

            const headers: HeadersInit = {}
            if (editor.credentialsType === 'header') {
                editor.credentials.forEach((cred) => {
                    if (cred.key && cred.value) {
                        headers[cred.key] = cred.value
                    }
                })
            }

            const payload: EmailTemplatePayload = {
                key: template.key,
                sender: template.sender,
                subject: template.subject,
                email: template.email,
                sms: template.sms,
                cc: template.cc || [],
                bcc: template.bcc || [],
                data: template.data || {},
            }

            const response = await fetch(`${editor.apiUrl}/templates/${template.id}`, {
                method: "PUT",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                    ...headers,
                },
            })

            if (!response.ok) {
                throw new Error(`Failed to update notify template ${template.id}: ${response.statusText}`)
            }

            resolve(true)
        } catch (err) {
            console.error(`Failed to update notify template ${template.id}:`, err)
            reject(err)
        }
    })
}

export function createNotifyTemplate(template: any, editor: EditorConfig) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!editor.apiUrl) {
                throw new Error('Missing API URL for editor')
            }

            const headers: HeadersInit = {}
            if (editor.credentialsType === 'header') {
                editor.credentials.forEach((cred) => {
                    if (cred.key && cred.value) {
                        headers[cred.key] = cred.value
                    }
                })
            }

            const payload: EmailTemplatePayload = {
                key: template.key || template.subject || '',
                sender: template.sender || '',
                subject: template.subject || template.key || '',
                email: template.email || '',
                sms: template.sms || '',
                cc: template.cc || [],
                bcc: template.bcc || [],
                data: template.data || {},
            }

            const url = appendQueryCredentials(`${editor.apiUrl}/templates`, editor)

            const response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
            })

            if (!response.ok) {
                throw new Error(`Failed to create notify template: ${response.statusText}`)
            }

            resolve(true)
        } catch (err) {
            console.error('Failed to create notify template:', err)
            reject(err)
        }
    })
}