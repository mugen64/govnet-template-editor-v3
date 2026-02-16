import { EditorConfig } from "./editor-types"

export function updateDocifyTemplateVariable(template: any, editor: EditorConfig) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = template.data as any
            const jsonFormData = new FormData()
            jsonFormData.append("templateId", data.id)
            jsonFormData.append("name", data.name)
            jsonFormData.append("pageSettings", JSON.stringify(data.pageSettings))
            jsonFormData.append("sampleJsonData", data.sampleJsonData)
            jsonFormData.append("folderName", data.folderName)
            jsonFormData.append("tags", JSON.stringify(data.tags))

            const headers: HeadersInit = {}
            if (editor.credentialsType === 'header') {
                editor.credentials.forEach((cred) => {
                    if (cred.key && cred.value) {
                        headers[cred.key] = cred.value
                    }
                })
            }

            const response = await fetch(`${editor.apiUrl}/templates/edit-page-settings/${template.templateId}`, {
                method: "PUT",
                body: jsonFormData,
                headers,
            })

            if (!response.ok) {
                throw new Error(`Failed to update template ${template.templateId}: ${response.statusText}`)
            }

            resolve(true)
        } catch (err) {
            console.error(`Failed to update docify template ${template.templateId}:`, err)
            reject(err)
        }
    })
}

export function updateDocifyTemplate(template: any, editor: EditorConfig) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = template.data as any

            const headers: HeadersInit = {}
            if (editor.credentialsType === 'header') {
                editor.credentials.forEach((cred) => {
                    if (cred.key && cred.value) {
                        headers[cred.key] = cred.value
                    }
                })
            }

            const htmlContent = (template.data as any).htmlContent || ''
            const name = (template.data as any).name || `template-${template.templateId}`
            const file = new File([htmlContent], 'template.html', {
                type: 'text/html',
            })

            const formData = new FormData()
            const htmlBlob = new Blob([htmlContent], { type: "text/html" })
            formData.append("file", htmlBlob, `${name.toUpperCase().replace(/[^A-Z0-9_]/g, '_')}.html`)
            formData.append("templateId", template.templateId)

            const response = await fetch(`${editor.apiUrl}/templates/${template.templateId}`, {
                method: "PUT",
                body: formData,
                headers,
            })

            if (!response.ok) {
                throw new Error(`Failed to prepare HTML content for template ${template.templateId}: ${response.statusText}`)
            }

            resolve(true)
        } catch (err) {
            console.error(`Failed to update docify template ${template.templateId}:`, err)
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
            const data = template.data as any

            const headers: HeadersInit = {}
            if (editor.credentialsType === 'header') {
                editor.credentials.forEach((cred) => {
                    if (cred.key && cred.value) {
                        headers[cred.key] = cred.value
                    }
                })
            }

            const payload: EmailTemplatePayload = {
                key: data.key,
                sender: data.sender,
                subject: data.subject,
                email: data.email,
                sms: data.sms,
                cc: data.cc || [],
                bcc: data.bcc || [],
                data: data.data || {},
            }

            const response = await fetch(`${editor.apiUrl}/templates/${template.templateId}`, {
                method: "PUT",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                    ...headers,
                },
            })

            if (!response.ok) {
                throw new Error(`Failed to update notify template ${template.templateId}: ${response.statusText}`)
            }

            resolve(true)
        } catch (err) {
            console.error(`Failed to update notify template ${template.templateId}:`, err)
            reject(err)
        }
    })
}