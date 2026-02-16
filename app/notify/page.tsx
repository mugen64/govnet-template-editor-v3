"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MoreHorizontal,
  Calendar,
  Pencil,
  Copy,
  Trash2,
  Search,
} from "lucide-react";
import { useEditorStorage } from "@/hooks/useEditorStorage";
import type { EditorConfig } from "@/lib/editor-types";

interface NotificationTemplate {
  id: string;
  key?: string;
  subject?: string;
  sender?: string;
  sms?: string;
  email?: string;
  bcc?: string[];
  cc?: string[];
  data?: unknown;
  createdAt: string;
  updatedAt?: string;
  type?: "SMS" | "EMAIL" | "PUSH" | string;
  channel?: string;
}

interface TemplatesResponse {
  data?: NotificationTemplate[];
  meta?: {
    limit: number;
    total: number;
  };
}

const ITEMS_PER_PAGE = 6;

export default function NotifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editorId = searchParams.get("editorId");
  const { getEditor, isLoaded } = useEditorStorage();

  const [editor, setEditor] = useState<EditorConfig | null>(null);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") ?? "",
  );
  const [refreshing, setRefreshing] = useState(false);

  // Load editor config once storage is ready
  useEffect(() => {
    if (isLoaded && editorId) {
      const editorConfig = getEditor(editorId);
      if (editorConfig) {
        setEditor(editorConfig);
      } else {
        setError("Editor not found. Please select a valid editor.");
        setLoading(false);
      }
    } else if (isLoaded && !editorId) {
      setError(
        "No editor ID provided. Please select an editor from the home page.",
      );
      setLoading(false);
    }
  }, [isLoaded, editorId, getEditor]);

  const buildAuthHeaders = useCallback(
    (editorConfig: EditorConfig): HeadersInit => {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (
        editorConfig.syncMode === "online" &&
        editorConfig.credentials.length > 0
      ) {
        if (editorConfig.credentialsType === "header") {
          editorConfig.credentials.forEach((cred) => {
            if (cred.key && cred.value) {
              headers[cred.key] = cred.value;
            }
          });
        }
      }

      return headers;
    },
    [],
  );

  const buildUrl = useCallback(
    (baseUrl: string, editorConfig: EditorConfig): string => {
      let url = `${baseUrl}/templates?page=${currentPage}&limit=${ITEMS_PER_PAGE}`;

      if (searchQuery.trim()) {
        url += `&q=${encodeURIComponent(searchQuery.trim())}`;
      }

      if (
        editorConfig.syncMode === "online" &&
        editorConfig.credentialsType === "query"
      ) {
        editorConfig.credentials.forEach((cred) => {
          if (cred.key && cred.value) {
            url += `&${encodeURIComponent(cred.key)}=${encodeURIComponent(cred.value)}`;
          }
        });
      }

      return url;
    },
    [currentPage, searchQuery],
  );

  const fetchTemplates = useCallback(
    async (editorConfig: EditorConfig) => {
      if (!editorConfig.apiUrl) {
        setError("API URL not configured for this editor.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const headers = buildAuthHeaders(editorConfig);
        const url = buildUrl(editorConfig.apiUrl, editorConfig);

        const response = await fetch(url, { headers });

        if (!response.ok) {
          throw new Error(`Failed to fetch templates: ${response.statusText}`);
        }

        const data: TemplatesResponse = await response.json();
        setTemplates(data?.data || []);
        setTotalPages(
          Math.ceil((data?.meta?.total || 0) / ITEMS_PER_PAGE),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    },
    [buildAuthHeaders, buildUrl],
  );

  // Fetch templates when editor is loaded
  useEffect(() => {
    if (editor) {
      fetchTemplates(editor);
    }
  }, [editor, currentPage, fetchTemplates]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleRefresh = async () => {
    if (!editor) return;
    setRefreshing(true);
    await fetchTemplates(editor);
    setRefreshing(false);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const truncateContent = (content: string, length: number = 80) => {
    if (!content) return "";
    if (content.length <= length) return content;
    return content.substring(0, length) + "...";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTemplateType = (template: NotificationTemplate): string => {
    if (template.type || template.channel) {
      return template.type || template.channel || "SMS";
    }

    if (template.email) {
      return "EMAIL";
    }

    if (template.sms) {
      return "SMS";
    }

    return "SMS";
  };

  const getTemplateIdentifier = (template: NotificationTemplate): string => {
    return template.key || "";
  };

  const getTemplateSender = (template: NotificationTemplate): string => {
    return template.sender || "System";
  };

  const getTemplateContent = (template: NotificationTemplate): string => {
    return template.sms || template.email || "";
  };

  const handleTemplateClick = (template: NotificationTemplate, editorId: string) => {
    const expiry = Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
    const data = {
      expiry,
      template,
      type: 'notify',
      lastOpened: Date.now(),
      editorId: editorId || '',
    }
    localStorage.setItem(`template-${template.id}`, JSON.stringify(data))
    router.push(`/notify/editor?editorId=${editorId || ''}&templateId=${template.id}`)
  };

  const getTemplateTitle = (template: NotificationTemplate): string => {
    return template.subject || template.key || "Untitled";
  };

  // Loading state while storage loads
  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header Section */}
        <div className="mb-4">
          <Link href="/" className="flex gap-2 items-center text-sm">
            <ChevronLeft className="h-4 w-4" />
            Back to editors
          </Link>
        </div>

        {/* Notification Templates Section */}
        <div className="mb-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Notification Templates</h2>
              <p className="text-sm text-muted-foreground">
                Manage notification templates synced with the API
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing || loading || !editor}
                className="gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button className="gap-2" disabled={!editor}>
                <Plus className="h-4 w-4" />
                New Notification Template
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search notification templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md pl-9"
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
          {loading && !error && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-sm text-muted-foreground">
                  Loading notification templates...
                </p>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && templates.length === 0 && !error && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-sm text-muted-foreground">
                  {searchQuery
                    ? "No templates match your search. Try a different query."
                    : "No notification templates found. Create your first template to get started."}
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
                    onClick={() => handleTemplateClick(template, editorId || '')}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0 space-y-1">
                          <CardTitle className="text-base font-semibold leading-tight">
                            {getTemplateTitle(template)}
                          </CardTitle>
                          {getTemplateIdentifier(template) && (
                            <CardDescription className="text-xs text-muted-foreground">
                              {getTemplateIdentifier(template)}
                            </CardDescription>
                          )}
                        </div>
                        <CardAction>
                          <DropdownMenu>
                            <DropdownMenuTrigger >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardAction>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Sender Info */}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">From:</span>
                        <span className="font-medium">
                          {getTemplateSender(template)}
                        </span>
                      </div>

                      {/* Content Preview */}
                      <div className="rounded-md bg-muted/30 p-3 text-xs text-muted-foreground max-h-20 overflow-hidden">
                        {truncateContent(getTemplateContent(template))}
                      </div>

                      {/* Footer with Date and Type Badge */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {formatDate(
                              template.updatedAt || template.createdAt,
                            )}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {getTemplateType(template)}
                        </Badge>
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
  );
}
