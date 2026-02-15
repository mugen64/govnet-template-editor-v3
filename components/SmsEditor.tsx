'use client'

import dynamic from 'next/dynamic'

const Editor = dynamic(() => import('@monaco-editor/react'), {
  loading: () => <div className="flex items-center justify-center h-full text-muted-foreground">Loading editor...</div>,
  ssr: false,
})

export interface SmsEditorProps {
  smsContent: string
  onSmsChange: (value: string) => void
  zoom: number
}

export function SmsEditor({ smsContent, onSmsChange, zoom }: SmsEditorProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-muted/50 px-4 py-2 border-b border-border">
        <p className="text-xs font-medium text-muted-foreground">SMS Content (Plain Text)</p>
        <p className="text-xs text-muted-foreground">Write plain text for SMS notifications (160 chars recommended)</p>
      </div>
      <div className="flex-1 overflow-hidden" style={{ zoom: `${zoom}%` }}>
        <Editor
          height="100%"
          defaultLanguage="plaintext"
          value={smsContent}
          onChange={(value) => onSmsChange(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineNumbers: 'on',
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  )
}
