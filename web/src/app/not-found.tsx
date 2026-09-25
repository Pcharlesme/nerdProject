"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Logo, Wordmark } from "@/components/ui/Logo";

export default function NotFound() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-5 py-16 text-center sm:px-8">
      <span className="flex items-center gap-2">
        <Logo />
        <Wordmark />
      </span>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{
          opacity: 1,
          y: prefersReducedMotion ? 0 : [16, 0, -8, 0],
        }}
        transition={
          prefersReducedMotion
            ? { duration: 0.5 }
            : { opacity: { duration: 0.5 }, y: { duration: 7, repeat: Infinity, ease: "easeInOut" } }
        }
        className="relative aspect-2/1 w-full max-w-xl overflow-hidden rounded-2xl border border-border shadow-xl"
      >
        <Image
          src="/brand/nerdhero.png"
          alt="A Nerd Logistics delivery truck on the road"
          fill
          priority
          sizes="(min-width: 640px) 576px, 100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-black/15 via-transparent to-transparent"
        />
      </motion.div>

      <div>
        <h1 className="text-2xl font-semibold text-text sm:text-3xl">
          This route took a wrong turn.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
          The page you&apos;re looking for doesn&apos;t exist or may have moved — but your shipment is
          still on track.
        </p>
      </div>

      <Link
        href="/"
        className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Go back home
      </Link>
    </main>
  );
}
