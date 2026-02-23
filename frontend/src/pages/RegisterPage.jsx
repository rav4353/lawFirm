import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion as Motion } from "framer-motion";
import { useAuth } from "@/context/useAuth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Scale,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Briefcase,
  Users,
  Crown,
  Settings,
} from "lucide-react";

const roles = [
  {
    value: "paralegal",
    label: "Paralegal",
    icon: Users,
    desc: "Research & draft support",
  },
  {
    value: "associate",
    label: "Associate",
    icon: Briefcase,
    desc: "Case management & filings",
  },
  {
    value: "partner",
    label: "Partner",
    icon: Crown,
    desc: "Full oversight & approvals",
  },
  {
    value: "it_admin",
    label: "IT Admin",
    icon: Settings,
    desc: "System configuration",
  },
];

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: "", password: "", confirmPassword: "", role: "paralegal" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await registerUser(data.email, data.password, data.role);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setServerError(
        err.response?.data?.detail ||
          "Registration failed. Please try again."
      );
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-400" />
          <h2 className="text-2xl font-bold">Account Created!</h2>
          <p className="mt-2 text-muted-foreground">
            Redirecting you to sign in…
          </p>
        </Motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {/* Decorative gradient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <Motion.div
        className="relative z-10 w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <Link
          to="/"
          className="mb-8 flex items-center justify-center gap-2 text-foreground"
        >
          <Scale className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight">Veritas AI</span>
        </Link>

        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              Create your account
            </CardTitle>
            <CardDescription>
              Join Veritas AI and streamline your legal workflow
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              id="register-form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-5"
            >
              {/* Server error */}
              {serverError && (
                <Motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{serverError}</span>
                </Motion.div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@lawfirm.com"
                    className="pl-9"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email address",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" /> {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min. 8 characters"
                    className="pl-9"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                  />
                </div>
                {errors.password && (
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />{" "}
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    className="pl-9"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (val) =>
                        val === watch("password") || "Passwords do not match",
                    })}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />{" "}
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Role selector */}
              <div className="space-y-3">
                <Label>Select your role</Label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((r) => {
                    const Icon = r.icon;
                    const active = selectedRole === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setValue("role", r.value)}
                        className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-4 text-center transition-all ${
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 text-muted-foreground hover:border-primary/40 hover:bg-accent/50"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{r.label}</span>
                        <span className="text-[11px] leading-tight opacity-70">
                          {r.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              form="register-form"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                  account…
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <Separator />

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </Motion.div>
    </div>
  );
}
