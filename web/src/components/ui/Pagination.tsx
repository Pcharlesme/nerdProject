import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Prev/Next pager for the server-paginated staff shipment/enquiry lists. */
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-5">
      <p className="text-sm font-medium text-muted">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-4 text-sm font-medium text-text transition-colors hover:border-primary/40 hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Prev
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-4 text-sm font-medium text-text transition-colors hover:border-primary/40 hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
