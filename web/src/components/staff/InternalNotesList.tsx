import { Lock, StickyNote } from "lucide-react";
import { formatDateTime } from "@/lib/formatDate";
import type { InternalNote } from "@/types";

interface InternalNotesListProps {
  notes: InternalNote[];
}

/**
 * Deliberately styled nothing like `TrackingTimeline` (dashed borders, a muted note
 * icon, no connecting line, an explicit "Staff only" pill) — the critical rule is that
 * this must never be mistaken for a customer-visible tracking event.
 */
export function InternalNotesList({ notes }: InternalNotesListProps) {
  if (notes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <StickyNote className="mx-auto size-6 text-muted" aria-hidden="true" />
        <p className="mt-2 text-sm text-muted">No internal notes yet.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {[...notes].reverse().map((note) => (
        <li key={note.id} className="rounded-lg border border-dashed border-border bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-0.5 text-xs font-medium text-muted">
              <Lock className="size-3" aria-hidden="true" />
              Staff only
            </span>
            <span className="text-xs text-muted">
              {note.author} · {formatDateTime(note.createdAt)}
            </span>
          </div>
          <p className="mt-2 text-sm text-text">{note.message}</p>
        </li>
      ))}
    </ul>
  );
}
