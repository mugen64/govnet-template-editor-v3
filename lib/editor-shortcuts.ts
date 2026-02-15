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
 * Creates keyboard shortcut handler for editor
 * Ctrl/Cmd + Shift + C: Insert comment block
 */
export function createEditorShortcutHandler(
  editor: any,
  language: EditorLanguage,
  callbacks?: {
    onCommentInsert?: (comment: string) => void
  }
) {
  return (e: KeyboardEvent) => {
    // Ctrl/Cmd + Shift + C: Insert comment block
    if ((isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.code === 'KeyC') {
      e.preventDefault()
      const comment = generateCommentBlock(language)
      
      // Insert at cursor position
      const position = editor.getPosition()
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      }
      
      editor.executeEdits('insert-comment', [
        {
          range,
          text: comment,
          forceMoveMarkers: true,
        },
      ])
      
      callbacks?.onCommentInsert?.(comment)
    }

    // Ctrl/Cmd + Shift + /: Toggle comment for selected lines
    if ((isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === '?') {
      e.preventDefault()
      // Use Monaco's built-in toggle comment command
      editor.trigger('keyboard', 'editor.action.commentLine', {})
    }
  }
}

/**
 * Attach keyboard event listener to editor
 */
export function attachEditorKeyboardHandler(
  editor: any,
  language: EditorLanguage,
  callbacks?: {
    onCommentInsert?: (comment: string) => void
  }
) {
  if (!editor) return

  const handler = createEditorShortcutHandler(editor, language, callbacks)
  const domNode = editor.getDomNode()

  if (domNode) {
    domNode.addEventListener('keydown', handler)
    
    // Return cleanup function
    return () => {
      domNode.removeEventListener('keydown', handler)
    }
  }
}
