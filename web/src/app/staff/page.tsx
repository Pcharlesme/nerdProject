"use client";

import { Suspense, useState } from "react";
import type { FormEvent } from "react";
import { motion } from "motion/react";
import { AlertCircle, Info } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useStaffAuth } from "@/providers/StaffAuthProvider";

type FieldErrors = { email?: string; password?: string };

function SessionBanner() {
  const reason = useSearchParams().get("reason");

  if (reason === "expired") {
    return (
      <div role="status" className="mb-6 flex items-start gap-2 rounded-lg border border-warning-border bg-warning-bg px-4 py-3 text-sm text-warning">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Your session has expired. Please sign in again.
      </div>
    );
  }

  if (reason === "required") {
    return (
      <div role="status" className="mb-6 flex items-start gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm text-text">
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    <main className="relative flex min-h-screen items-center justify-center bg-background px-5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(79,70,229,0.16),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(56,189,248,0.16),transparent_35%)]"
      />
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-primary">Staff portal</p>
          <h1 className="text-3xl font-semibold tracking-tight text-text">Sign in</h1>
          <p className="mt-2 text-sm text-muted">Sign in to manage shipments and customer enquiries.</p>
        </div>

        <Suspense fallback={null}>
          <SessionBanner />
        </Suspense>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-text">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="staff@shiptrack.com"
              aria-invalid={fieldErrors.email ? true : undefined}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              className="min-h-12 w-full rounded-lg border border-border bg-surface px-4 text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {fieldErrors.email && (
              <p id="email-error" role="alert" className="mt-1.5 text-sm text-danger">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-text">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="Enter your password"
                aria-invalid={fieldErrors.password ? true : undefined}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                className="min-h-12 w-full rounded-lg border border-border bg-surface px-4 pr-20 text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-sm font-medium text-muted transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {fieldErrors.password && (
              <p id="password-error" role="alert" className="mt-1.5 text-sm text-danger">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {formError && (
            <div role="alert" className="flex items-start gap-2 rounded-lg border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {formError}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" loading={isSubmitting} disabled={isSubmitting}>
            Sign in
          </Button>

          <p className="text-center text-xs text-muted">
            Demo credentials: <span className="font-mono">staff@shiptrack.com</span> ·{" "}
            <span className="font-mono">demo1234</span>
          </p>
        </form>
      </motion.section>
    </main>
  );
}
