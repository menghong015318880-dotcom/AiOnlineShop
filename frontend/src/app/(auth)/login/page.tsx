"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiLogIn, FiMail, FiPhone, FiUser, FiUserPlus } from "react-icons/fi";
import AuthShell from "@/components/auth/AuthShell";
import { AuthField, PasswordField } from "@/components/auth/AuthFields";
import SocialButtons from "@/components/auth/SocialButtons";
import { useAuth } from "@/context/AuthContext";

type Mode = "login" | "register";

// Only allow a path on this site (blocks "https://other-site.com" and "//other-site.com")
const safeNext = (next: string | null) =>
  next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

// useSearchParams must be inside <Suspense> in Next.js.
export default function AuthPage() {
  return (
    <Suspense fallback={<p className="text-gray-500">Loading...</p>}>
      <AuthContent />
    </Suspense>
  );
}

// One page for both forms. /login shows Login, /login?mode=register shows Register.
// /login?next=/checkout sends the user to /checkout after login.
function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const { user, ready } = useAuth();

  const [mode, setMode] = useState<Mode>(searchParams.get("mode") === "register" ? "register" : "login");

  // Already logged in: go away from this page
  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, next, router]);

  return (
    <AuthShell>
      {/* key = a form starts empty again when the user switches */}
      {mode === "login" ? (
        <LoginForm key="login" next={next} onSwitch={() => setMode("register")} />
      ) : (
        <RegisterForm key="register" next={next} onSwitch={() => setMode("login")} />
      )}
    </AuthShell>
  );
}

// ---------------------------------------------------------------- Login
function LoginForm({ next, onSwitch }: { next: string; onSwitch: () => void }) {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // Check the fields
    const found: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) found.email = "Please enter a valid email";
    if (!password) found.password = "Please enter your password";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      await login({ email, password, remember });
      router.push(next);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not login. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="mt-6 text-3xl font-bold text-gray-900">
        Welcome <span className="text-blue-600">Back</span>
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Login to your account and continue your shopping journey.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <AuthField
          label="Email Address" icon={<FiMail />} type="email" autoComplete="email"
          placeholder="Enter your email"
          value={email} error={errors.email}
          onChange={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: undefined })); }}
        />
        <PasswordField
          label="Password" autoComplete="current-password"
          placeholder="Enter your password"
          value={password} error={errors.password}
          onChange={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: undefined })); }}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 accent-blue-600"
            />
            Remember me
          </label>
          {/* Placeholder: password reset needs the backend */}
          <button
            type="button"
            onClick={() => window.alert("Password reset will be available later.")}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {submitError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{submitError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          <FiLogIn /> {submitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <SocialButtons />

      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <button type="button" onClick={onSwitch} className="font-medium text-blue-600 hover:underline">
          Register
        </button>
      </p>
    </>
  );
}

// ------------------------------------------------------------- Register
interface RegisterState {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
}

type RegisterErrors = Partial<Record<keyof RegisterState, string>>;

function validateRegister(f: RegisterState): RegisterErrors {
  const e: RegisterErrors = {};
  if (f.full_name.trim().length < 2) e.full_name = "Please enter your full name";
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = "Please enter a valid email";
  if (!/^\+?[0-9\s-]{8,15}$/.test(f.phone.trim())) e.phone = "Please enter a valid phone number";
  if (f.password.length < 8) e.password = "Use at least 8 characters";
  else if (!/[A-Za-z]/.test(f.password) || !/[0-9]/.test(f.password)) {
    e.password = "Use letters and numbers";
  }
  if (f.confirm !== f.password) e.confirm = "Passwords do not match";
  return e;
}

function RegisterForm({ next, onSwitch }: { next: string; onSwitch: () => void }) {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState<RegisterState>({
    full_name: "", email: "", phone: "", password: "", confirm: "",
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Change one field and clear its error
  const setField = (key: keyof RegisterState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const found = validateRegister(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      await register({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      router.push(next);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not register. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="mt-6 text-3xl font-bold text-gray-900">
        Create Your <span className="text-blue-600">Account</span>
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Join us and enjoy a smarter shopping experience with AI assistant.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <AuthField
          label="Full Name" icon={<FiUser />} autoComplete="name"
          placeholder="Enter your full name"
          value={form.full_name} error={errors.full_name} onChange={setField("full_name")}
        />
        <AuthField
          label="Email Address" icon={<FiMail />} type="email" autoComplete="email"
          placeholder="Enter your email"
          value={form.email} error={errors.email} onChange={setField("email")}
        />
        <AuthField
          label="Phone Number" icon={<FiPhone />} type="tel" autoComplete="tel"
          placeholder="Enter your phone number"
          value={form.phone} error={errors.phone} onChange={setField("phone")}
        />
        <PasswordField
          label="Password" autoComplete="new-password"
          placeholder="Create a password"
          value={form.password} error={errors.password} onChange={setField("password")}
        />
        <PasswordField
          label="Confirm Password" autoComplete="new-password"
          placeholder="Confirm your password"
          value={form.confirm} error={errors.confirm} onChange={setField("confirm")}
        />

        {submitError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{submitError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          <FiUserPlus /> {submitting ? "Creating account..." : "Register"}
        </button>
      </form>

      <SocialButtons />

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="font-medium text-blue-600 hover:underline">
          Login
        </button>
      </p>
    </>
  );
}