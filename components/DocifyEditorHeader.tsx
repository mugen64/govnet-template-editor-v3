import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Home, Cloud, CloudOff, CloudCheck, Loader2 } from 'lucide-react'

interface DocifyEditorHeaderProps {
    templateName: string
    refNumber?: string
    onBack: () => void
    syncStatus?: {
        status: 'idle' | 'syncing' | 'success' | 'error'
        syncedTemplates: number
    }
    onSync?: () => void
}

export function DocifyEditorHeader({
    templateName,
    refNumber,
    onBack,
    syncStatus,
    onSync,
}: DocifyEditorHeaderProps) {
    const statusText =
        syncStatus?.status === 'idle'
            ? 'Idle'
            : syncStatus?.status === 'syncing'
              ? 'Syncing...'
              : syncStatus?.status === 'success'
                ? 'Synced'
                : 'Failed'
    const statusClass =
        syncStatus?.status === 'idle'
            ? 'text-muted-foreground'
            : syncStatus?.status === 'syncing'
              ? 'text-blue-500'
              : syncStatus?.status === 'success'
                ? 'text-green-500'
                : 'text-red-500'

    return (
        <div className="border-b border-border p-2">
            <div className="mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="h-10 w-10">
                            <Home className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-semibold">{templateName}</h1>
                        <p className="text-xs text-muted-foreground">{refNumber || 'No reference'}</p>
                    </div>
                </div>

                {syncStatus && (
                    <div className="flex items-center gap-2">
                        {syncStatus.status === 'idle' && (
                            <Cloud className="h-4 w-4 text-muted-foreground" />
                        )}
                        {syncStatus.status === 'syncing' && (
                            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                        )}
                        {syncStatus.status === 'success' && (
                            <CloudCheck className="h-4 w-4 text-green-500" />
                        )}
                        {syncStatus.status === 'error' && (
                            <CloudOff className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-xs ${statusClass}`}>{statusText}</span>
                        {onSync && (
                            <Button size="sm" variant="outline" onClick={onSync}>
                                Sync
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
