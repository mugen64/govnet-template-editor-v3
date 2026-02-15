'use client'

import Link from 'next/link'
import { useState, useEffect, useContext } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

interface PdfTemplate {
  id: string
  name: string
  refNumber?: string
  fileName?: string
  folderName?: string
  sampleJsonData?: string
  pageSettings?: {
    pageSize?: string
    orientation?: string
    marginLeft?: number
    marginRight?: number
    marginTop?: number
    marginBottom?: number
  }
  createdAt: string
  updatedAt?: string
  deletedAt?: string | null
}

export default function DocifyEditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editorId = searchParams.get('editorId')
  const templateId = searchParams.get('templateId')

  const [template, setTemplate] = useState<PdfTemplate | null>(null)
  const [htmlContent, setHtmlContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [previewMode, setPreviewMode] = useState<'html' | 'pdf'>('html')

  useEffect(() => {
    if (!templateId) {
      setLoading(false)
      return
    }

    const storedData = localStorage.getItem(`template-${templateId}`)
    if (storedData) {
      try {
        const { expiry, template: storedTemplate } = JSON.parse(storedData)
        
        // Check if expired
        if (expiry && Date.now() > expiry) {
        //   localStorage.removeItem(`template-${templateId}`)
        //   setLoading(false)
            alert('The template data has expired. Please select the template again from the list.')
          return
        }
        
        setTemplate(storedTemplate)
        setHtmlContent('') // Initialize with empty content
        setLoading(false)
      } catch (err) {
        console.error('Failed to parse stored template:', err)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [templateId])

  const handleBack = () => {
    if (templateId) {
      localStorage.removeItem(`template-${templateId}`)
    }
    router.push(`/docify?editorId=${editorId}`)
  }

  const getTemplateName = (): string => {
    if (!template) return 'Unknown Template'
    return template.name || template.fileName || 'Untitled'
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </main>
    )
  }

  if (!template) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-destructive">Template not found. Please select a template from the list.</p>
          <Button onClick={handleBack} className="mt-4">
            Back to Templates
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{getTemplateName()}</h1>
              <p className="text-xs text-muted-foreground">{template.refNumber || 'No reference'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={previewMode === 'html' ? 'default' : 'outline'} onClick={() => setPreviewMode('html')}>
              HTML
            </Button>
            <Button variant={previewMode === 'pdf' ? 'default' : 'outline'} onClick={() => setPreviewMode('pdf')}>
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Section */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: HTML Editor */}
        <div className="flex-1 flex flex-col border-r border-border">
          <div className="bg-muted/50 px-4 py-2 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground">HTML Template</p>
          </div>
          <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            placeholder="Enter your HTML template here..."
            className="flex-1 p-4 font-mono text-sm bg-background text-foreground resize-none focus:outline-none border-0"
            spellCheck="false"
          />
        </div>

        {/* Right: Live Preview */}
        <div className="flex-1 flex flex-col">
          <div className="bg-muted/50 px-4 py-2 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground">Live Preview</p>
          </div>
          <div className="flex-1 overflow-auto bg-white">
            {previewMode === 'html' ? (
              htmlContent ? (
                <iframe
                  title="Preview"
                  srcDoc={htmlContent}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Enter HTML to see preview</p>
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">PDF preview would render here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
