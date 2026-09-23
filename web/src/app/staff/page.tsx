"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CustomButton } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function StaffLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(79,70,229,0.16),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(56,189,248,0.16),transparent_35%)]"
      />
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-primary">Staff portal</p>

          <h1 className="text-3xl font-semibold tracking-tight text-text">
            Sign in
          </h1>

          <p className="mt-2 text-sm text-muted">
            Sign in to manage shipments and customer enquiries.
          </p>
        </div>

        <form className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-text"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="staff@example.com"
              className="min-h-12 w-full rounded-lg border border-border bg-surface px-4 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-text"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                className="min-h-12 w-full rounded-lg border border-border bg-surface px-4 pr-20 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm text-muted">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="size-4 rounded border-border accent-primary"
            />
            Remember me
          </label>

          <CustomButton
            // authenticate
            // if successful:
            onPress={() => router.push("/staff/home")}
            title={"Sign in"}
          />
        </form>
      </motion.section>
    </main>
  );
}
