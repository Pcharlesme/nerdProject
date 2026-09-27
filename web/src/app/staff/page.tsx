"use client";

import { Suspense, useState } from "react";
import type { FormEvent } from "react";
import { motion } from "motion/react";
import { AlertCircle, Info } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Logo, Wordmark } from "@/components/ui/Logo";
import { useStaffAuth } from "@/providers/StaffAuthProvider";

type FieldErrors = { email?: string; password?: string };

function SessionBanner() {
  const reason = useSearchParams().get("reason");

  if (reason === "expired") {
    return (
      <div
        role="status"
        className="mb-6 flex items-start gap-2 rounded-lg border border-warning-border bg-warning-bg px-4 py-3 text-sm text-warning"
      >
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Your session has expired. Please sign in again.
      </div>
    );
  }

  if (reason === "required") {
    return (
      <div
        role="status"
        className="mb-6 flex items-start gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm text-text"
      >
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Sign in to access the staff area.
      </div>
    );
  }

  return null;
}

export default function StaffLogin() {
  const router = useRouter();
  const { login } = useStaffAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return; // prevent accidental double-submit while a request is in flight

    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = "Enter your email address.";
    if (!password) errors.password = "Enter your password.";
    setFieldErrors(errors);
    setFormError(null);

    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    router.push("/staff/dashboard");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-10">
      {/* Ambient background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-[440px]"
      >
        {/* Brand */}
        <div className="mb-7 text-center">
          <span className="mx-auto flex w-fit items-center gap-2">
            <Logo />
            <Wordmark />
          </span>

          <div className="mt-6">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Staff portal
            </span>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text">
              Welcome back
            </h1>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-5 text-muted">
              Sign in to manage shipments, track deliveries, and respond to
              customer enquiries.
            </p>
          </div>
        </div>

        <Suspense fallback={null}>
          <SessionBanner />
        </Suspense>

        {/* Login card */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-7">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-text"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      email: undefined,
                    }));
                  }
                }}
                placeholder="staff@shiptrack.com"
                aria-invalid={fieldErrors.email ? true : undefined}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              />

              {fieldErrors.email && (
                <p
                  id="email-error"
                  role="alert"
                  className="mt-1.5 text-sm text-danger"
                >
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-text"
                >
                  Password
                </label>
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        password: undefined,
                      }));
                    }
                  }}
                  placeholder="Enter your password"
                  aria-invalid={fieldErrors.password ? true : undefined}
                  aria-describedby={
                    fieldErrors.password ? "password-error" : undefined
                  }
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 pr-20 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-md px-2 py-1 text-xs font-semibold text-muted transition hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {fieldErrors.password && (
                <p
                  id="password-error"
                  role="alert"
                  className="mt-1.5 text-sm text-danger"
                >
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {formError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-danger-border bg-danger-bg px-4 py-3 text-sm leading-5 text-danger"
              >
                <AlertCircle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <span>{formError}</span>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              variant="cta"
              size="lg"
              className="h-12 w-full rounded-xl"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Sign in to portal
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 border-t border-border pt-5">
            <p className="text-center text-xs text-muted">Demo access</p>

            <div className="mt-2 rounded-lg bg-background px-3 py-2.5 text-center text-xs text-muted">
              <span className="font-mono text-text">staff@shiptrack.com</span>
              <span className="mx-2 text-border">·</span>
              <span className="font-mono text-text">demo1234</span>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-muted">
          Secure staff access · Shipment operations
        </p>
      </motion.section>
    </main>
  );
}
