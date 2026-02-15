'use client'

import { useRef } from 'react'
import Editor from '@monaco-editor/react'
import { useTheme } from 'next-themes'

export interface EmailEditorProps {
  emailContent: string
  onEmailChange: (value: string) => void
  zoom: number
}

export function EmailEditor({ emailContent, onEmailChange, zoom }: EmailEditorProps) {
  const editorRef = useRef<any>(null)
  const { resolvedTheme } = useTheme()

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
  }

  const getEditorTheme = () => {
    return resolvedTheme === 'dark' ? 'vs-dark' : 'vs'
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-muted/50 px-4 py-2 border-b border-border">
        <p className="text-xs font-medium text-muted-foreground">Email Content (HTML)</p>
        <p className="text-xs text-muted-foreground">Write HTML optimized for email clients</p>
      </div>
      <div className="flex-1 overflow-hidden" style={{ zoom: `${zoom}%` }}>
        <Editor
          height="100%"
          defaultLanguage="html"
          value={emailContent}
          onChange={(value) => onEmailChange(value || '')}
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
