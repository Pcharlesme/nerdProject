"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { isValidTrackingNumberFormat } from "@/constant/mockData";

interface TrackingSearchProps {
  onSearch: (trackingNumber: string) => void;
  loading?: boolean;
}

const HINT_ID = "tracking-number-hint";
const ERROR_ID = "tracking-number-error";

export function TrackingSearch({ onSearch, loading = false }: TrackingSearchProps) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-xl text-left">
      <label htmlFor="tracking-number" className="mb-2 block text-sm font-medium text-text">
        Tracking number
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
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
          className="min-h-14 flex-1 rounded-lg border border-border bg-surface px-4 text-base text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

        <Button
          type="submit"
          size="lg"
          loading={loading}
          disabled={loading}
          icon={<Search className="size-4" aria-hidden="true" />}
          className="w-full sm:w-auto"
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
