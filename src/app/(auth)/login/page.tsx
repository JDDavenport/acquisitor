"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, ArrowRight, Building2, Mail, Lock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: callbackUrl,
      });

      if (error) {
        setError(error.message || "Invalid email or password");
        return;
      }

      if (data) {
        window.location.href = callbackUrl;
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center shadow-lg shadow-gold-500/20 group-hover:shadow-gold-500/30 transition-all duration-300">
            <Building2 className="w-6 h-6 text-navy-950" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">ACQUISITOR</span>
        </Link>
      </div>

      <Card className="border-navy-700/50 bg-navy-900/50 backdrop-blur-sm shadow-2xl">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-semibold text-white text-center">Welcome back</CardTitle>
          <CardDescription className="text-center text-navy-300">Sign in to your ACQUISITOR account</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-navy-100">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 pl-10 bg-navy-800 border-navy-700 text-white placeholder:text-navy-400 focus:border-gold-500 focus:ring-gold-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-navy-100">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 pl-10 bg-navy-800 border-navy-700 text-white placeholder:text-navy-400 focus:border-gold-500 focus:ring-gold-500/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-navy-950 font-semibold shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30 transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2">
          <div className="text-sm text-center text-navy-300">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>

      <p className="mt-8 text-center text-xs text-navy-500">
        Protected by industry-standard encryption
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
