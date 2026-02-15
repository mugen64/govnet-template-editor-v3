import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Home } from 'lucide-react'

interface DocifyEditorHeaderProps {
    templateName: string
    refNumber?: string
    onBack: () => void
}

export function DocifyEditorHeader({
    templateName,
    refNumber,
    onBack,
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
            </div>
        </div>
    )
}
