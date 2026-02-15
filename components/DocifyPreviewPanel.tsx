import { Button } from '@/components/ui/button'

interface DocifyPreviewPanelProps {
    htmlContent: string
    previewMode: 'html' | 'pdf'
    onPreviewModeChange: (mode: 'html' | 'pdf') => void
}

export function DocifyPreviewPanel({
    htmlContent,
    previewMode,
    onPreviewModeChange,
}: DocifyPreviewPanelProps) {
    return (
        <div className="flex flex-col border-l border-border h-full">
            <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Live Preview</p>
                <div className="flex items-center gap-2">
                    <Button
                        variant={previewMode === 'html' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onPreviewModeChange('html')}
                    >
                        HTML
                    </Button>
                    <Button
                        variant={previewMode === 'pdf' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onPreviewModeChange('pdf')}
                    >
                        PDF
                    </Button>
                </div>
            </div>
            <div className="flex-1 overflow-auto bg-white">
                {previewMode === 'html' ? (
                    htmlContent ? (
                        <iframe
                            title="Preview"
                            srcDoc={htmlContent}
                            className="w-full h-full border-0"
                            sandbox="allow-scripts"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">Enter HTML to see preview</p>
                        </div>
                    )
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">PDF preview would render here</p>
                    </div>
                )}
            </div>
        </div>
    )
}
