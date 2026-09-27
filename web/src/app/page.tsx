import Link from "next/link";
import { Clock, Package, ShieldCheck, User } from "lucide-react";
import { Logo, Wordmark } from "@/components/ui/Logo";
import GridBackground from "@/components/ui/GridBackground";
import { TrackingLanding } from "@/components/customer/TrackingLanding";
import { ShipmentRouteIllustration } from "@/components/ui/boxillustration";

const FEATURES = [
  { icon: ShieldCheck, label: "Secure tracking" },
  { icon: Clock, label: "Real-time updates" },
  { icon: Package, label: "Delivered with care" },
];

// A fully static, server-rendered landing page — no client JS is needed to paint the
// hero, so there is nothing here that can hydrate late or leave the page half-rendered.
// `GridBackground` and `TrackingLanding` are the only client components: a decorative,
// aria-hidden cursor effect and the search box + its results, respectively.
export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-linear-to-br from-white via-white to-primary-soft/70">
      <GridBackground />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(79,70,229,0.16),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(56,189,248,0.16),transparent_35%)]"
      />

      <nav className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6 sm:px-8">
        <span className="flex items-center gap-2.5">
          <Logo size="md" />
          <Wordmark size="md" />
        </span>
        <Link
          href="/staff"
          prefetch={false}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-primary/30 hover:bg-primary-soft hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
        >
          <User className="size-4" aria-hidden="true" />
          Staff sign in
        </Link>
      </nav>

      <section className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-6 pb-16 text-center sm:px-8">
        <div className="w-full max-w-sm sm:max-w-md">
          <ShipmentRouteIllustration />
        </div>

        <p className="mt-4 text-sm font-semibold tracking-widest text-primary uppercase">
          Fast &middot; Safe &middot; Reliable
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-text sm:text-6xl lg:text-7xl">
          Where is your{" "}
          <span className="font-serif font-normal italic text-primary">
            parcel?
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
          Enter your tracking number to see where your parcel is and what
          happens next.
        </p>

        <div className="mt-8 w-full max-w-2xl">
          <TrackingLanding />
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center divide-x divide-border text-sm text-muted">
          {FEATURES.map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-2 px-4 first:pl-0 last:pr-0"
            >
              <feature.icon
                className="size-8 text-primary"
                aria-hidden="true"
              />
              {feature.label}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
