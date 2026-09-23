"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { CustomButton } from "@/components/ui/Button";

interface TrackingSearchProps {
  onSearch: (trackingNumber: string) => void;
  loading?: boolean;
}

export function TrackingSearch({
  onSearch,
  loading = false,
}: TrackingSearchProps) {
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = trackingNumber.trim();

    if (!value) return;

    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <label
        htmlFor="tracking-number"
        className="mb-2 block text-sm font-medium text-text"
      >
        Tracking number
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="tracking-number"
          name="trackingNumber"
          type="text"
          value={trackingNumber}
          onChange={(event) => setTrackingNumber(event.target.value)}
          placeholder="Enter your tracking number"
          autoComplete="off"
          aria-label="Tracking number"
          className="min-h-14 flex-1 rounded-lg border border-border bg-surface px-4 text-base text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

        <CustomButton
          type="submit"
          title={loading ? "Searching..." : "Track"}
          onPress={() => {}}
          loading={loading}
          icon={<Search className="size-4" aria-hidden="true" />}
          className="sm:w-auto"
        />
      </div>

      <p className="mt-2 text-sm text-muted">
        Enter the tracking number from your delivery confirmation.
      </p>
    </form>
  );
}
