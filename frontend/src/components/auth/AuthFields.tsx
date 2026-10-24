"use client";
import { useId, useState } from "react";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";

interface AuthFieldProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  type?: string;
  autoComplete?: string;
  right?: React.ReactNode; // something on the right side (e.g. the eye button)
}

// Text box with a label, an icon on the left and an error message below
export function AuthField({
  label, icon, value, onChange, placeholder, error, type = "text", autoComplete, right,
}: AuthFieldProps) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-gray-900">{label}</label>
      <div
        className={`mt-1 flex items-center gap-2 rounded-lg border bg-white px-3 focus-within:border-blue-500 ${
          error ? "border-red-400" : "border-gray-300"
        }`}
      >
        <span className="text-lg text-gray-400">{icon}</span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full min-w-0 py-3 text-sm outline-none"
        />
        {right}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

type PasswordFieldProps = Omit<AuthFieldProps, "icon" | "type" | "right">;

// Password box with an eye button to show or hide the password
export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthField
      {...props}
      icon={<FiLock />}
      type={visible ? "text" : "password"}
      right={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="text-lg text-gray-400 hover:text-gray-600"
        >
          {visible ? <FiEyeOff /> : <FiEye />}
        </button>
      }
    />
  );
}