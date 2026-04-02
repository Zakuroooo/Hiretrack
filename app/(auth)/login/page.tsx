"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, Zap, Briefcase, Star, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

const stats = [
  {
    value: "2,847",
    label: "Jobs Tracked This Month",
    icon: Briefcase,
    delay: "0s",
  },
  {
    value: "94%",
    label: "User Satisfaction Rate",
    icon: Star,
    delay: "0.5s",
  },
  {
    value: "3.2x",
    label: "Faster Job Search",
    icon: TrendingUp,
    delay: "1s",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setError("");
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
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
            Land your dream job,
            <br />
            <span className="gradient-text">faster.</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-md">
            Track applications, ace interviews, and collaborate with mentors —
            all in one beautiful dashboard.
          </p>
        </div>

        {/* Floating stat cards */}
        <div className="relative z-10 space-y-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass-blue rounded-xl p-4 flex items-center gap-4 max-w-sm"
              style={{
                animation: `float 3s ease-in-out infinite`,
                animationDelay: stat.delay,
                borderLeft: "3px solid #0ea5e9",
              }}
            >
              <div className="w-10 h-10 rounded-lg bg-[#0ea5e9]/20 flex items-center justify-center flex-shrink-0">
                <stat.icon className="w-5 h-5 text-[#38bdf8]" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-zinc-400">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom flair */}
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
              Welcome back
            </h2>
            <p className="text-zinc-400">Sign in to your account</p>
          </div>

          {/* Error box */}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-[#0ea5e9] focus:ring-[#0ea5e9]/20"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-sm text-[#38bdf8] hover:text-[#7dd3fc] transition-colors"
              >
                Forgot password?
              </button>
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
                  Signing in...
                </span>
              ) : (
                "Sign In"
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

          {/* Link to register */}
          <p className="text-center text-sm text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#38bdf8] hover:text-[#7dd3fc] font-medium transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
