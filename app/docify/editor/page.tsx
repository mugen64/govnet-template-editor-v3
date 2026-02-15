'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { HtmlEditor } from '@/components/HtmlEditor'
import { VariableEditor } from '@/components/VariableEditor'
import { SettingsEditor } from '@/components/SettingsEditor'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import {
  ChevronLeft,
  Code,
  Eye,
  Settings,
  Download,
  Copy,
  RefreshCw,
  Save,
  ZoomIn,
  ZoomOut,
  Variable,
  Home,
} from 'lucide-react'

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
  const currentEditor = searchParams.get('editor') || 'code'

  const [template, setTemplate] = useState<PdfTemplate | null>(null)
  const [htmlContent, setHtmlContent] = useState('')
  const [variablesContent, setVariablesContent] = useState('{}')
  const [loading, setLoading] = useState(true)
  const [previewMode, setPreviewMode] = useState<'html' | 'pdf'>('html')
  const [zoom, setZoom] = useState(100)

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

  const handleEditorChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('editor', value)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handleHtmlChange = useCallback((value: string) => {
    setHtmlContent(value)
  }, [])

  const handleVariablesChange = useCallback((value: string) => {
    setVariablesContent(value)
  }, [])

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
      <div className="border-b border-border p-2">
        <div className="mx-aut flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleBack} className="h-10 w-10">
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
        {/* Sidebar with Tabs */}
        <Tabs
          value={currentEditor}
          onValueChange={handleEditorChange}
          orientation="vertical"
          className="w-full bg-muted border-r border-border"
        >
          <TabsList variant="default" className="flex-col items-center h-full w-12 p-2 gap-4 bg-muted border-0 rounded-none">
            <TabsTrigger value="code" title="Code View" className="w-full cursor-pointer hover:bg-accent">
              <Code className="h-10 w-10" />
            </TabsTrigger>
            <TabsTrigger value="variables" title="Variables" className="w-full cursor-pointer hover:bg-accent">
              <Variable className="h-10 w-10" />
            </TabsTrigger>
            <TabsTrigger value="settings" title="Settings" className="w-full cursor-pointer hover:bg-accent">
              <Settings className="h-10 w-10" />
            </TabsTrigger>
          </TabsList>

          <ResizablePanelGroup orientation="horizontal" className="flex-1 w-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <TabsContent value="code" className="flex-1 flex-col overflow-hidden flex h-full">
                <HtmlEditor
                  htmlContent={htmlContent}
                  onHtmlChange={handleHtmlChange}
                  zoom={zoom}
                />
              </TabsContent>
              <TabsContent value="variables" className="flex-1 flex-col overflow-hidden flex h-full">
                <VariableEditor
                  variablesContent={variablesContent}
                  onVariablesChange={handleVariablesChange}
                  zoom={zoom}
                />
              </TabsContent>
              <TabsContent value="settings" className="flex-1 flex-col overflow-hidden flex h-full">
                <SettingsEditor />
              </TabsContent>
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={50} minSize={30} className="flex flex-col border-l border-border">
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
            </ResizablePanel>
          </ResizablePanelGroup>
        </Tabs>
      </div>
    </main>
  )
}
