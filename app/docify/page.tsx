'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'

interface PdfTemplate {
  id: string
  title: string
  createdAt: string
  content: string
  variables?: number
  format?: string
}

interface TemplatesResponse {
  templates: PdfTemplate[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const ITEMS_PER_PAGE = 6

export default function DocifyPage() {
  const [templates, setTemplates] = useState<PdfTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchTemplates(currentPage)
  }, [currentPage])

  const fetchTemplates = async (page: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(
        `/api/templates?page=${page}&pageSize=${ITEMS_PER_PAGE}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }
      
      const data: TemplatesResponse = await response.json()
      setTemplates(data.templates)
      setTotalPages(data.totalPages || Math.ceil(data.total / ITEMS_PER_PAGE))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  const truncateContent = (content: string, length: number = 100) => {
    if (content.length <= length) return content
    return content.substring(0, length) + '...'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Link href="/" className="flex gap-2 items-center text-sm">
            <ChevronLeft className="h-4 w-4" />
            Back to editors
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">PDF Management</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your PDF document templates and global assets
          </p>
        </div>

        {/* Tabs Section */}
        <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
          <Button variant="outline" className="gap-2">
            📋 Templates
          </Button>
          <Button variant="ghost" className="gap-2">
            🌐 Global Assets
          </Button>
        </div>

        {/* PDF Templates Section */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">PDF Templates</h2>
              <p className="text-sm text-muted-foreground">
                Create and manage your PDF document templates
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New PDF Template
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search PDF templates..."
              className="w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* Error State */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/5 mb-6">
              <CardContent className="pt-6">
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-sm text-muted-foreground">
                  Loading templates...
                </p>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && templates.length === 0 && !error && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-sm text-muted-foreground">
                  No templates found. Create your first PDF template to get started.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Templates Grid */}
          {!loading && templates.length > 0 && (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer transition-all hover:shadow-md hover:ring-2 hover:ring-ring/50"
                  >
                    <CardHeader>
                      <div className="space-y-2">
                        <CardTitle className="text-lg truncate">
                          {template.title}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {formatDate(template.createdAt)}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Content Preview */}
                      <div className="rounded-sm bg-muted/30 p-3 font-mono text-xs text-muted-foreground max-h-24 overflow-hidden">
                        <code>{truncateContent(template.content)}</code>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-2">
                        {template.variables !== undefined && (
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {template.variables} variables
                          </Badge>
                        )}
                        {template.format && (
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400">
                            {template.format}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-border pt-6">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
