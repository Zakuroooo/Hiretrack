"use client";

import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

function getStrength(password: string) {
  if (!password) return { score: 0, label: "", color: "" };

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (password.length >= 6) score = 1;
  if (hasMinLength) score = 2;
  if (hasMinLength && hasNumber) score = 3;
  if (password.length >= 10 && hasNumber && hasSpecial && hasUppercase)
    score = 4;

  const labels: Record<number, { label: string; color: string }> = {
    0: { label: "", color: "" },
    1: { label: "Weak", color: "#ef4444" },
    2: { label: "Fair", color: "#f97316" },
    3: { label: "Good", color: "#f59e0b" },
    4: { label: "Strong", color: "#22c55e" },
  };

  return { score, ...labels[score] };
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score, label, color } = getStrength(password);

  const checks = [
    { text: "At least 8 characters", met: password.length >= 8 },
    { text: "Contains a number", met: /\d/.test(password) },
    { text: "Contains uppercase", met: /[A-Z]/.test(password) },
    { text: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      {/* Strength bar */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                score >= level ? color : "rgba(255,255,255,0.08)",
            }}
          />
        ))}
      </div>

      {/* Label */}
      {label && (
        <p className="text-xs font-medium" style={{ color }}>
          {label}
        </p>
      )}

      {/* Criteria checklist */}
      <div className="space-y-1.5">
        {checks.map((check) => (
          <div key={check.text} className="flex items-center gap-2 text-xs">
            {check.met ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <X className="w-3.5 h-3.5 text-zinc-600" />
            )}
            <span
              className={check.met ? "text-zinc-300" : "text-zinc-600"}
            >
              {check.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
