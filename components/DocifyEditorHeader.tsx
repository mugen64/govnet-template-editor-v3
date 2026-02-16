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

                {/* Sync Status Indicator */}
                {syncStatus && (
                    <div className="flex items-center gap-2">
                        {syncStatus.status === 'idle' && (
                            <>
                                <Cloud className="h-4 w-4 text-muted-foreground" />
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={onSync}
                                >
                                    Sync
                                </Button>
                            </>
                        )}
                        {syncStatus.status === 'syncing' && (
                            <>
                                <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                                <span className="text-xs text-blue-500">Syncing...</span>
                            </>
                        )}
                        {syncStatus.status === 'success' && (
                            <>
                                <CloudCheck className="h-4 w-4 text-green-500" />
                                <span className="text-xs text-green-500">Synced</span>
                            </>
                        )}
                        {syncStatus.status === 'error' && (
                            <>
                                <CloudOff className="h-4 w-4 text-red-500" />
                                <span className="text-xs text-red-500">Failed</span>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
