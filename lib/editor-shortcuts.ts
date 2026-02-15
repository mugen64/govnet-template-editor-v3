/**
 * Editor keyboard shortcuts utility
 */

export interface KeyboardShortcutHandler {
  onKeyDown: (e: KeyboardEvent) => void
}

export type EditorLanguage = 'html' | 'json' | 'text'

const isMac = typeof window !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)

/**
 * Generates a comment based on the editor language
 */
export function generateCommentBlock(language: EditorLanguage): string {
  switch (language) {
    case 'html':
      return '<!-- TODO: Add description here -->'
    case 'json':
      return '// TODO: Add description here'
    case 'text':
      return '// TODO: Add description here'
    default:
      return '// TODO: Add description here'
  }
}

/**
 * Attach keyboard shortcuts using Monaco's command API
 * This prevents interference with normal editor functionality
 */
export function attachEditorKeyboardHandler(
  editor: any,
  monaco: any,
  language: EditorLanguage,
  callbacks?: {
    onCommentInsert?: (comment: string) => void
  }
) {
  if (!editor || !monaco) return

  // Register Ctrl/Cmd + Shift + C: Insert comment block
  const commandId = `insert-comment-${Math.random().toString(36).substr(2, 9)}`
  
  editor.addCommand(
    isMac ? monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyC : 
           monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyC,
    () => {
      const comment = generateCommentBlock(language)
      const position = editor.getPosition()
      
      editor.executeEdits('insert-comment', [
        {
          range: new monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
          ),
          text: comment,
          forceMoveMarkers: true,
        },
      ])
      
      callbacks?.onCommentInsert?.(comment)
    },
    commandId
  )
  
  // Return cleanup function
  return () => {
    try {
      editor.removeCommand(commandId)
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}
