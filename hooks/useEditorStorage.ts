'use client'

import { useState, useEffect } from 'react'
import type { EditorConfig } from '@/lib/editor-types'

export const EDITOR_STORAGE_KEY = 'template-editors'

export function useEditorStorage() {
  const [editors, setEditors] = useState<EditorConfig[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(EDITOR_STORAGE_KEY)
    if (stored) {
      try {
        setEditors(JSON.parse(stored))
      } catch (err) {
        console.error('Failed to parse editors from storage:', err)
      }
    }
    setIsLoaded(true)
  }, [])

  const saveEditor = (editor: EditorConfig) => {
    setEditors((prev) => {
      const existing = prev.find((e) => e.id === editor.id)
      const updated = existing
        ? prev.map((e) => (e.id === editor.id ? editor : e))
        : [...prev, editor]
      localStorage.setItem(EDITOR_STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const deleteEditor = (editorId: string) => {
    setEditors((prev) => {
      const updated = prev.filter((e) => e.id !== editorId)
      localStorage.setItem(EDITOR_STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const getEditor = (editorId: string) => {
    console.log(editors, 'Current editors in storage')
    return editors.find((e) => e.id === editorId)
  }

  return {
    editors,
    isLoaded,
    saveEditor,
    deleteEditor,
    getEditor,
  }
}
