'use client'

import { useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { useTheme } from 'next-themes'
import { attachEditorKeyboardHandler } from '@/lib/editor-shortcuts'

export interface HtmlEditorProps {
  htmlContent: string
  onHtmlChange: (value: string) => void
  zoom: number
}

export function HtmlEditor({ htmlContent, onHtmlChange, zoom }: HtmlEditorProps) {
  const editorRef = useRef<any>(null)
  const { resolvedTheme } = useTheme()

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    editor.focus()
  }

  useEffect(() => {
    if (!editorRef.current) return
    const cleanup = attachEditorKeyboardHandler(editorRef.current, 'html')
    return cleanup
  }, [])

  const getEditorTheme = () => {
    return resolvedTheme === 'dark' ? 'vs-dark' : 'vs'
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-muted/50 px-4 py-2 border-b border-border">
        <p className="text-xs font-medium text-muted-foreground">HTML Template</p>
      </div>
      <div className="flex-1 overflow-hidden" style={{ zoom: `${zoom}%` }}>
        <Editor
          height="100%"
          defaultLanguage="html"
          value={htmlContent}
          onChange={(value) => onHtmlChange(value || '')}
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
            // bracketMatching: 'always',
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
