import { Button } from "@/components/ui/Button";
import { SearchIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-background p-8">
      <main className="w-full max-w-2xl space-y-8 rounded-lg border border-border bg-surface p-8 shadow-md">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-text">
            Shipment Tracking Dashboard
          </h1>
          <p className="text-sm text-muted">
            Design tokens and the shared Button component, previewed together.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button title="Update Shipment" variant="secondary" />
          <Button title="Search" icon={<SearchIcon className="size-4" />} />
          <Button title="Delete Shipment" variant="danger" />
        </div>

        <div className="flex flex-wrap items-center gap-3"></div>
      </main>
    </div>
  );
}
