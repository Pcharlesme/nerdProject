"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { isValidTrackingNumberFormat } from "@/lib/trackingNumber";

interface TrackingSearchProps {
  onSearch: (trackingNumber: string) => void;
  loading?: boolean;
}

const HINT_ID = "tracking-number-hint";
const ERROR_ID = "tracking-number-error";

export function TrackingSearch({
  onSearch,
  loading = false,
}: TrackingSearchProps) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isEmpty = trackingNumber.trim().length === 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = trackingNumber.trim();

    if (!value) {
      setError("Enter a tracking number to continue.");
      return;
    }

    if (!isValidTrackingNumberFormat(value)) {
      setError("That doesn't look like a valid tracking number.");
      return;
    }

    setError(null);
    onSearch(value);
  };

  const handleClear = () => {
    setTrackingNumber("");
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-2xl text-left"
    >
      <label
        htmlFor="tracking-number"
        className="mb-2 block text-sm font-medium text-text"
      >
        Tracking number
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            id="tracking-number"
            name="trackingNumber"
            type="text"
            value={trackingNumber}
            onChange={(event) => {
              setTrackingNumber(event.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. TRK-DEMO-001"
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? ERROR_ID : HINT_ID}
            className="min-h-14 w-full rounded-lg border border-border bg-surface px-4 pr-11 text-base text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />

          {!isEmpty && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear tracking number"
              className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-primary-soft hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          loading={loading}
          disabled={loading}
          icon={<Search className="size-4" aria-hidden="true" />}
          className="w-full sm:w-auto cursor-pointer md:px-12"
        >
          {loading ? "Searching…" : "Track"}
        </Button>
      </div>

      <p
        id={error ? ERROR_ID : HINT_ID}
        role={error ? "alert" : undefined}
        className={`mt-2 text-sm ${error ? "text-danger" : "text-muted"}`}
      >
        {error ?? "Enter the tracking number from your delivery confirmation."}
      </p>
    </form>
  );
}
