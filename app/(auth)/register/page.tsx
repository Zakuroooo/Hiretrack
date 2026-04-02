"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Zap,
  Shield,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PasswordStrength from "@/components/auth/PasswordStrength";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must accept the Terms of Service",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const features = [
  {
    icon: BarChart3,
    title: "Visual Pipeline",
    description: "Kanban boards to track every application stage",
    delay: "0s",
  },
  {
    icon: Sparkles,
    title: "AI Resume Scoring",
    description: "Get instant feedback on your resume match",
    delay: "0.5s",
  },
  {
    icon: Shield,
    title: "Mentor Collaboration",
    description: "Share boards and get guidance from mentors",
    delay: "1s",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { terms: false },
  });

  const passwordValue = watch("password", "");

  async function onSubmit(data: RegisterForm) {
    setError("");
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success("Account created!");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #080c14 0%, #0a1628 50%, #080c14 100%)",
        }}
      >
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fafafa 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-[#0ea5e9] flex items-center justify-center glow-blue">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">HireTrack</span>
          </div>

          {/* Tagline */}
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Start tracking
            <br />
            <span className="gradient-text">your future.</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-md">
            Join thousands of job seekers who landed their dream roles with
            HireTrack.
          </p>
        </div>

        {/* Feature cards */}
        <div className="relative z-10 space-y-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass-blue rounded-xl p-4 flex items-start gap-4 max-w-sm"
              style={{
                animation: `float 3s ease-in-out infinite`,
                animationDelay: feature.delay,
                borderLeft: "3px solid #0ea5e9",
              }}
            >
              <div className="w-10 h-10 rounded-lg bg-[#0ea5e9]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <feature.icon className="w-5 h-5 text-[#38bdf8]" />
              </div>
              <div>
                <p className="font-semibold text-white">{feature.title}</p>
                <p className="text-sm text-zinc-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-xs text-zinc-600">
          © 2026 HireTrack. All rights reserved.
        </p>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[400px] space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#0ea5e9] flex items-center justify-center glow-blue">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">HireTrack</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold gradient-text mb-2">
              Create your account
            </h2>
            <p className="text-zinc-400">
              Get started with your job search today
            </p>
          </div>

          {/* Error box */}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10 h-11 bg-zinc-900 border-zinc-800 focus-visible:border-[#0ea5e9] focus-visible:ring-[#0ea5e9]/20"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10 h-11 bg-zinc-900 border-zinc-800 focus-visible:border-[#0ea5e9] focus-visible:ring-[#0ea5e9]/20"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11 bg-zinc-900 border-zinc-800 focus-visible:border-[#0ea5e9] focus-visible:ring-[#0ea5e9]/20"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
              <PasswordStrength password={passwordValue} />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11 bg-zinc-900 border-zinc-800 focus-visible:border-[#0ea5e9] focus-visible:ring-[#0ea5e9]/20"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="space-y-1">
              <label className="flex items-start gap-2.5 text-sm text-zinc-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-0.5 rounded border-zinc-700 bg-zinc-900 text-[#0ea5e9] focus:ring-[#0ea5e9]/20"
                  {...register("terms")}
                />
                <span>
                  I agree to the{" "}
                  <button
                    type="button"
                    className="text-[#38bdf8] hover:text-[#7dd3fc] transition-colors"
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    className="text-[#38bdf8] hover:text-[#7dd3fc] transition-colors"
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
              {errors.terms && (
                <p className="text-xs text-red-400">{errors.terms.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#080c14] px-4 text-zinc-500">or</span>
            </div>
          </div>

          {/* Link to login */}
          <p className="text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#38bdf8] hover:text-[#7dd3fc] font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
