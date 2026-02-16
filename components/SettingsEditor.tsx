'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'

export interface PageSettings {
  pageSize?: string
  orientation?: string
  marginLeft?: number
  marginRight?: number
  marginTop?: number
  marginBottom?: number
}

export interface SettingsEditorProps {
  pageSettings: PageSettings
  onPageSettingsChange: (settings: PageSettings) => void
  onSyncMetadata?: () => void
}

export function SettingsEditor({
  pageSettings,
  onPageSettingsChange,
  onSyncMetadata,
}: SettingsEditorProps) {
  const handleNumberChange = (key: keyof PageSettings, value: string) => {
    const nextValue = value === '' ? undefined : Number(value)
    onPageSettingsChange({
      ...pageSettings,
      [key]: Number.isNaN(nextValue) ? undefined : nextValue,
    })
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Page Settings</p>
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
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="page-size">Page Size</Label>
            <select
              id="page-size"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={pageSettings.pageSize || ''}
              onChange={(event) =>
                onPageSettingsChange({
                  ...pageSettings,
                  pageSize: event.target.value || undefined,
                })
              }
            >
              <option value="">Select size</option>
              <option value="A4">A4</option>
              <option value="A5">A5</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
              <option value="A3">A3</option>
              <option value="A2">A2</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="page-orientation">Orientation</Label>
            <select
              id="page-orientation"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={pageSettings.orientation || ''}
              onChange={(event) =>
                onPageSettingsChange({
                  ...pageSettings,
                  orientation: event.target.value || undefined,
                })
              }
            >
              <option value="">Select orientation</option>
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="margin-top">Top Margin (mm)</Label>
            <Input
              id="margin-top"
              type="number"
              value={pageSettings.marginTop ?? ''}
              onChange={(event) => handleNumberChange('marginTop', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="margin-bottom">Bottom Margin (mm)</Label>
            <Input
              id="margin-bottom"
              type="number"
              value={pageSettings.marginBottom ?? ''}
              onChange={(event) => handleNumberChange('marginBottom', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="margin-left">Left Margin (mm)</Label>
            <Input
              id="margin-left"
              type="number"
              value={pageSettings.marginLeft ?? ''}
              onChange={(event) => handleNumberChange('marginLeft', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="margin-right">Right Margin (mm)</Label>
            <Input
              id="margin-right"
              type="number"
              value={pageSettings.marginRight ?? ''}
              onChange={(event) => handleNumberChange('marginRight', event.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
