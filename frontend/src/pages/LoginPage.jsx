import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { LoginBackdrop } from "@/components/LoginBackdrop";
import { RoleChooser } from "@/components/RoleChooser";
import { useAuth } from "@/auth/useAuth";
import { useStageTransition } from "@/transition/useStageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEMO_ACCOUNTS = [
  {
    role: "STUDENT",
    label: "Student",
    name: "Morgan A. Thibodaux",
    detail: "Finance + CS · Junior",
    email: "morgan@tulane.edu",
    password: "streetcar",
  },
  {
    role: "ADVISOR",
    label: "Advisor",
    name: "Bill Hudlow",
    detail: "Freeman · Career Consultant",
    email: "bill.hudlow@tulane.edu",
    password: "streetcar",
  },
];

export function LoginPage() {
  const { login, logout, register } = useAuth();
  const { run } = useStageTransition();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [role, setRole] = useState(null);
  const [mode, setMode] = useState("signup");
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const session = await login(email, password);
      if (role && session.role !== role) {
        logout();
        setError(
          role === "ADVISOR"
            ? "That is a student account. Choose Student, or use advisor credentials."
            : "That is an advisor account. Choose Advisor, or use student credentials.",
        );
        setPending(false);
        return;
      }
      await run(
        session.role === "ADVISOR" ? "Opening your console" : "Opening your path",
        () => {
          if (session.role === "ADVISOR") {
            navigate("/advisor", { replace: true });
          } else {
            navigate(session.onboarded ? "/student" : "/onboarding", { replace: true });
          }
        },
      );
    } catch {
      setError("That email and password combination is not recognized.");
      setPending(false);
    }
  }

  async function handleSignUp(event) {
    event.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Those passwords do not match.");
      return;
    }
    setPending(true);
    try {
      await register({ name, email, password, role });
      await run(
        role === "ADVISOR" ? "Setting up your console" : "Setting up your account",
        () => {
          navigate("/welcome", { replace: true });
        },
      );
    } catch {
      setError("That email is already registered. Try signing in instead.");
      setPending(false);
    }
  }

  function applyAccount(account) {
    setEmail(account.email);
    setPassword(account.password);
    setError(null);
  }

  if (!role) {
    return <RoleChooser onSelect={setRole} />;
  }

  const accounts = DEMO_ACCOUNTS.filter((account) => account.role === role);
  const roleLabel = role === "ADVISOR" ? "Advisor" : "Student";

  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-ink px-14 py-12 lg:flex lg:flex-col">
        <div className="relative z-10 text-[15px] font-semibold tracking-[-0.01em] text-white">
          Streetcar
        </div>

        <LoginBackdrop />

        <div className="relative mt-auto max-w-[440px]">
          <div className="text-[11px] font-medium tracking-[0.14em] text-brass uppercase">
            Tulane University Pilot
          </div>
          <h1 className="mt-4 text-[38px] leading-[1.1] font-semibold tracking-[-0.02em] text-white">
            The first job is a ten-year bet.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-white/55">
            Streetcar reads a student&apos;s record, their cohort&apos;s outcomes, and the
            alumni already doing the work — then tells them which classes actually
            move the needle.
          </p>
          <div className="mt-9 flex items-center gap-2 text-[12.5px] text-white/40">
            <ShieldCheck className="size-4" />
            FERPA opt-in · Every view is attributable
          </div>
        </div>
      </div>

      {/* Sign-in panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[380px]">
          <button
            type="button"
            onClick={() => {
              setRole(null);
              setError(null);
            }}
            className="flex items-center gap-1.5 text-[12px] font-medium text-muted-ink transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-3.5" />
            Not {roleLabel === "Advisor" ? "an advisor" : "a student"}?
          </button>
          <div className="mt-5 text-[11px] font-medium tracking-[0.14em] text-muted-ink-2 uppercase">
            {roleLabel} {mode === "signup" ? "sign up" : "sign in"}
          </div>
          <h2 className="mt-2.5 text-[26px] leading-tight font-semibold tracking-[-0.02em] text-ink">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-2 text-[13.5px] text-muted-ink">
            {mode === "signup"
              ? "Takes a moment. Streetcar builds the rest from your record."
              : "Use your Tulane credentials to continue."}
          </p>

          {mode === "signup" ? (
            <form onSubmit={handleSignUp} className="mt-7 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="text-[12.5px] font-medium text-ink-2">
                  Full name
                </Label>
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="h-10 rounded-lg border-hairline-strong bg-white text-[13.5px]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-[12.5px] font-medium text-ink-2">
                  Tulane email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@tulane.edu"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-10 rounded-lg border-hairline-strong bg-white text-[13.5px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password" className="text-[12.5px] font-medium text-ink-2">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={8}
                    className="h-10 rounded-lg border-hairline-strong bg-white text-[13.5px]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirm" className="text-[12.5px] font-medium text-ink-2">
                    Confirm
                  </Label>
                  <Input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    required
                    minLength={8}
                    className="h-10 rounded-lg border-hairline-strong bg-white text-[13.5px]"
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="text-[12.5px] text-rose">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={pending}
                className="mt-1 h-10 rounded-lg bg-ink text-[13.5px] font-medium hover:bg-ink-2"
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating your account
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>

              <p className="text-[11.5px] leading-relaxed text-muted-ink-2">
                By creating an account you agree to Streetcar reading only what you opt in to
                share under the FERPA School-Official Authorization.
              </p>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-[12.5px] font-medium text-ink-2">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@tulane.edu"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-10 rounded-lg border-hairline-strong bg-white text-[13.5px]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-[12.5px] font-medium text-ink-2">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="h-10 rounded-lg border-hairline-strong bg-white text-[13.5px]"
                />
              </div>

              {error && (
                <p role="alert" className="text-[12.5px] text-rose">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={pending}
                className="mt-1 h-10 rounded-lg bg-ink text-[13.5px] font-medium hover:bg-ink-2"
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing in
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 border-t border-hairline pt-5">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signup" ? "signin" : "signup");
                setError(null);
              }}
              className="text-[12.5px] font-medium text-burgundy hover:underline"
            >
              {mode === "signup"
                ? "Already have an account? Sign in"
                : "Need an account? Create one"}
            </button>

            {mode === "signin" && (
              <div className="mt-4">
                <div className="text-[11px] font-medium tracking-[0.12em] text-muted-ink-2 uppercase">
                  Demo account
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {accounts.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => applyAccount(account)}
                      className="flex items-center gap-3 rounded-lg border border-hairline bg-white px-3 py-2.5 text-left transition-colors hover:border-hairline-strong hover:bg-sidebar-bg focus-visible:ring-[3px] focus-visible:ring-burgundy/25 focus-visible:outline-none"
                    >
                      <span className="rounded-full bg-highlight px-2 py-0.5 text-[10.5px] font-medium text-brass">
                        {account.label}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-ink">
                          {account.name}
                        </span>
                        <span className="block truncate text-[11.5px] text-muted-ink">
                          {account.detail}
                        </span>
                      </span>
                      <ArrowRight className="size-3.5 shrink-0 text-muted-ink-2" />
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-[11.5px] text-muted-ink-2">
                  Password is <span className="font-medium text-muted-ink">streetcar</span>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
