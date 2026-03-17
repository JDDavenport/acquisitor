"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, ArrowRight, Building2, CheckCircle2, Briefcase, Mail, Lock, User } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [step, setStep] = useState<"signup" | "onboarding">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [investmentFocus, setInvestmentFocus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pass)) return "Password must contain an uppercase letter";
    if (!/[a-z]/.test(pass)) return "Password must contain a lowercase letter";
    if (!/[0-9]/.test(pass)) return "Password must contain a number";
    return null;
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const passwordError = validatePassword(password);
    if (passwordError) { setError(passwordError); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }

    setIsLoading(true);
    try {
      const { data, error } = await authClient.signUp.email({
        email, password, name,
        callbackURL: "/dashboard",
      });
      if (error) { setError(error.message || "Failed to create account"); setIsLoading(false); return; }
      if (data) setStep("onboarding");
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    window.location.href = "/dashboard";
  };

  if (step === "onboarding") {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center shadow-lg shadow-gold-500/20">
              <Building2 className="w-6 h-6 text-navy-950" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">ACQUISITOR</span>
          </Link>
        </div>

        <Card className="border-navy-700/50 bg-navy-900/50 backdrop-blur-sm shadow-2xl">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gold-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-gold-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-semibold text-white text-center">Account created!</CardTitle>
            <CardDescription className="text-center text-navy-300">Tell us a bit more to personalize your experience</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleOnboardingComplete} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium text-navy-100">Company Name (Optional)</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                  <Input
                    id="companyName"
                    placeholder="Your company or firm name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-12 pl-10 bg-navy-800 border-navy-700 text-white placeholder:text-navy-400 focus:border-gold-500 focus:ring-gold-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-navy-100">Investment Focus (Optional)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {["SaaS", "E-commerce", "Manufacturing", "Services", "Healthcare", "Other"].map((focus) => (
                    <button
                      key={focus}
                      type="button"
                      onClick={() => setInvestmentFocus(focus)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        investmentFocus === focus
                          ? "bg-gold-500 text-navy-950"
                          : "bg-navy-800 border border-navy-700 text-navy-100 hover:border-navy-500 hover:bg-navy-700"
                      }`}
                    >
                      {focus}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full h-12 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-navy-950 font-semibold shadow-lg shadow-gold-500/20" disabled={isLoading}>
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Setting up...</>) : (<>Complete Setup<ArrowRight className="ml-2 h-4 w-4" /></>)}
              </Button>

              <Button type="button" variant="ghost" className="w-full h-11 text-navy-300 hover:text-white hover:bg-navy-800" onClick={() => { window.location.href = "/dashboard"; }}>
                Skip for now
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-center mb-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center shadow-lg shadow-gold-500/20">
            <Building2 className="w-6 h-6 text-navy-950" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">ACQUISITOR</span>
        </Link>
      </div>

      <Card className="border-navy-700/50 bg-navy-900/50 backdrop-blur-sm shadow-2xl">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-semibold text-white text-center">Create your account</CardTitle>
          <CardDescription className="text-center text-navy-300">Start your journey to finding the perfect acquisition</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-navy-100">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                <Input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} className="h-12 pl-10 bg-navy-800 border-navy-700 text-white placeholder:text-navy-400 focus:border-gold-500 focus:ring-gold-500/20" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-navy-100">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                <Input id="email" type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className="h-12 pl-10 bg-navy-800 border-navy-700 text-white placeholder:text-navy-400 focus:border-gold-500 focus:ring-gold-500/20" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-navy-100">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                <Input id="password" type="password" placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className="h-12 pl-10 bg-navy-800 border-navy-700 text-white placeholder:text-navy-400 focus:border-gold-500 focus:ring-gold-500/20" required />
              </div>
              <p className="text-xs text-navy-400">Must be at least 8 characters with uppercase, lowercase, and number</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-navy-100">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                <Input id="confirmPassword" type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} className="h-12 pl-10 bg-navy-800 border-navy-700 text-white placeholder:text-navy-400 focus:border-gold-500 focus:ring-gold-500/20" required />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-navy-950 font-semibold shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30 transition-all duration-300" disabled={isLoading}>
              {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>) : (<>Create account<ArrowRight className="ml-2 h-4 w-4" /></>)}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2">
          <div className="text-center text-sm text-navy-300">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-gold-400 hover:text-gold-300 transition-colors">Sign in</Link>
          </div>
          <p className="text-center text-xs text-navy-500">
            By creating an account, you agree to our{" "}
            <Link href="#" className="text-navy-300 hover:text-gold-400">Terms</Link> and{" "}
            <Link href="#" className="text-navy-300 hover:text-gold-400">Privacy Policy</Link>
          </p>
        </CardFooter>
      </Card>

      <p className="mt-8 text-center text-xs text-navy-500">Protected by industry-standard encryption</p>
    </div>
  );
}
