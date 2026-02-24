import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion as Motion } from "framer-motion";
import { useAuth } from "@/context/useAuth";
import api from "@/services/api";

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
  User,
  Eye,
  EyeOff,
  KeyRound,
  ArrowLeft,
} from "lucide-react";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmittingStep1, setIsSubmittingStep1] = useState(false);
  const [formData, setFormData] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting: isSubmittingStep2 },
  } = useForm({
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", otp_code: "" },
  });

  const onSubmitStep1 = async (data) => {
    setServerError("");
    setIsSubmittingStep1(true);
    try {
      await api.post("/auth/registration-otp", { email: data.email });
      setFormData(data);
      setStep(2);
    } catch (err) {
      setServerError(
        err.response?.data?.detail || "Failed to send verification code. Please try again."
      );
    } finally {
      setIsSubmittingStep1(false);
    }
  };

  const onSubmitStep2 = async (data) => {
    setServerError("");
    try {
      // Need to update AuthContext to support calling register with OTP
      // For now, let's call API directly to ensure it works
      await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }, { params: { otp_code: data.otp_code } });
      
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setServerError(
        err.response?.data?.detail || "Registration failed. Please try again."
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
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <Motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
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
              {step === 1 ? "Create your account" : "Verify your email"}
            </CardTitle>
            <CardDescription>
              {step === 1 
                ? "Join Veritas AI and streamline your legal workflow"
                : `Enter the code sent to ${formData?.email}`}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {serverError && (
              <Motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </Motion.div>
            )}

            {step === 1 ? (
              <form
                id="register-form"
                onSubmit={handleSubmit(onSubmitStep1)}
                noValidate
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className="pl-9"
                      {...register("name", { required: "Full name is required" })}
                    />
                  </div>
                  {errors.name && (
                    <p className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" /> {errors.name.message}
                    </p>
                  )}
                </div>

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

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      className="pl-9 pr-10"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />{" "}
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      className="pl-9 pr-10"
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (val) =>
                          val === watch("password") || "Passwords do not match",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />{" "}
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </form>
            ) : (
              <form
                id="otp-form"
                onSubmit={handleSubmit(onSubmitStep2)}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="otp"
                      placeholder="6-digit code"
                      className="pl-9"
                      {...register("otp_code", { 
                        required: "OTP code is required",
                        pattern: { value: /^\d{6}$/, message: "Enter 6-digit code" }
                      })}
                    />
                  </div>
                  {errors.otp_code && (
                    <p className="text-xs text-destructive">{errors.otp_code.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmittingStep2}
                >
                  {isSubmittingStep2 ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                    </>
                  ) : (
                    "Verify & Create Account"
                  )}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  onClick={() => setStep(1)}
                  disabled={isSubmittingStep2}
                >
                  Back to Details
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {step === 1 && (
              <>
                <Button
                  type="submit"
                  form="register-form"
                  className="w-full"
                  disabled={isSubmittingStep1}
                >
                  {isSubmittingStep1 ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Code...
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
              </>
            )}
            {step === 2 && (
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            )}
          </CardFooter>
        </Card>
      </Motion.div>
    </div>
  );
}
