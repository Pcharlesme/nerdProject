import Link from "next/link";
import { PackageX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <PackageX className="size-10 text-muted" aria-hidden="true" />
      <h1 className="text-2xl font-semibold text-text">Page not found</h1>
      <p className="max-w-sm text-sm text-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have moved. 
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-on-primary hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Go back home
      </Link>
    </main>
  );
}
