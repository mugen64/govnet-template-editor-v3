'use client'

import { useRef, useEffect, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { useTheme } from 'next-themes'
import { attachEditorKeyboardHandler } from '@/lib/editor-shortcuts'
import { Button } from '@/components/ui/button'
import { Download, Upload } from 'lucide-react'

export interface VariableEditorProps {
  variablesContent: string
  onVariablesChange: (value: string) => void
  zoom: number
  onSyncMetadata?: () => void
}

export function VariableEditor({
  variablesContent,
  onVariablesChange,
  zoom,
  onSyncMetadata,
}: VariableEditorProps) {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const { resolvedTheme } = useTheme()

  const handleDownload = useCallback(() => {
    const blob = new Blob([variablesContent || '{}'], {
      type: 'application/json;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'sample-data.json'
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }, [variablesContent])

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    monacoRef.current = monaco
    editor.focus()
  }

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return
    const cleanup = attachEditorKeyboardHandler(editorRef.current, monacoRef.current, 'json')
    return cleanup
  }, [])

  const getEditorTheme = () => {
    return resolvedTheme === 'dark' ? 'vs-dark' : 'vs'
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Sample JSON Data</p>
        <div className="flex items-center gap-2">
          {onSyncMetadata && (
            <Button
              variant="outline"
              size="icon"
              onClick={onSyncMetadata}
              title="Sync metadata"
              aria-label="Sync metadata"
            >
              <Upload className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
            title="Download JSON"
            aria-label="Download JSON"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden" style={{ zoom: `${zoom}%` }}>
        <Editor
          height="100%"
          defaultLanguage="json"
          value={variablesContent}
          onChange={(value) => onVariablesChange(value || '')}
          theme={getEditorTheme()}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineNumbers: 'on',
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
            automaticLayout: true,
            folding: true,
            bracketMatching: 'always',
            autoIndent: 'full',
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            parameterHints: { enabled: true },
            hover: { enabled: true },
          }}
        />
      </div>
    </div>
  )
}
