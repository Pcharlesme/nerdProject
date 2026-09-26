import Image from "next/image";
import Link from "next/link";
import { Logo, Wordmark } from "@/components/ui/Logo";

// A static, server-rendered page — the truck photo is a plain background image
// (no client JS/animation needed for a route that, by definition, never had data to load).
export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-5 py-16 text-center sm:px-8">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/brand/nerdhero.png"
          alt="A Nerd Logistics delivery truck on the road"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-black/75 via-black/45 to-black/20"
        />
      </div>

      <span className="flex items-center gap-2">
        <Logo />
        <Wordmark light />
      </span>

      <div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">
          This route took a wrong turn.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-white/80">
          The page you&apos;re looking for doesn&apos;t exist or may have moved — but your shipment is
          still on track.
        </p>
      </div>

      <Link
        href="/"
        className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Go back home
      </Link>
    </main>
  );
}
