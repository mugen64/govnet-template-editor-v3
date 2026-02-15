"use client";

import { useState, useEffect } from "react";
import { AddEditorForm } from "@/components/AddEditorForm";
import { EditorList } from "@/components/EditorList";
import { useEditorStorage } from "@/hooks/useEditorStorage";
import { NotificationTemplateEditor } from "@/components/NotificationTemplateEditor";
import { DocumentTemplateEditor } from "@/components/DocumentTemplateEditor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus } from "lucide-react";
import type { EditorConfig } from "@/lib/editor-types";

export default function Page() {
  const { editors, isLoaded, saveEditor, deleteEditor } = useEditorStorage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEditor, setSelectedEditor] = useState<EditorConfig | null>(
    null,
  );

  useEffect(() => {
    if (selectedEditor) {
      const updated = editors.find((e) => e.id === selectedEditor.id);
      if (updated) {
        setSelectedEditor(updated);
      }
    }
  }, [editors, selectedEditor]);

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  if (selectedEditor) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => setSelectedEditor(null)}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Editors
          </Button>

          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">
              {selectedEditor.name}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {selectedEditor.type === "notify"
                ? "Notify Template"
                : "Docify Template"}{" "}
              Editor
            </p>
          </div>

          {selectedEditor.type === "notify" ? (
            <NotificationTemplateEditor config={selectedEditor} />
          ) : (
            <DocumentTemplateEditor config={selectedEditor} />
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to Govnet Template Editor
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create and manage template editors with flexible API integration
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your Editors</h2>
            <p className="text-sm text-muted-foreground">
              {editors.length} editor{editors.length !== 1 ? "s" : ""}{" "}
              configured
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Editor
          </Button>
        </div>

        <EditorList
          editors={editors}
          onDeleteEditor={deleteEditor}
          onSelectEditor={setSelectedEditor}
        />

        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="w-full max-w-2xl  max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Editor</DialogTitle>
            </DialogHeader>
            <AddEditorForm
              existingEditors={editors}
              onSave={(editor) => {
                saveEditor(editor);
                setShowAddForm(false);
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
