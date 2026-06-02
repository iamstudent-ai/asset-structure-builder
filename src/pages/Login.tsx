import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, EyeOff, LogIn, UserPlus, Monitor, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const { error: err } = await signUp(email, password, displayName);
        if (err) {
          setError(err);
        } else {
          setError("");
          setError("Check your email to confirm your account, then log in.");
          setIsSignUp(false);
        }
      } else {
        const { error: err } = await signIn(email, password);
        if (err) {
          setError("Invalid email or password. Please try again.");
        } else {
          navigate("/", { replace: true });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E8F5E9] relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, #A7F3D0 0%, transparent 50%), radial-gradient(circle at 80% 70%, #6EE7B7 0%, transparent 40%)`,
        }}
      />
      
      {/* Decorative blurred circles */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 rounded-full bg-emerald-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-emerald-300/30 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400" />
          
          <CardHeader className="text-center space-y-5 pt-8 pb-2">
            {/* Branding */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
                <Monitor className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                  IT Asset Management
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Enterprise Asset Tracking System
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-2 px-7 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Display Name (sign up only) */}
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Display Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    className="h-11 pl-10 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="h-11 pl-10 pr-10 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error / Success Message */}
              {error && (
                <div className={`text-sm px-4 py-3 rounded-xl flex items-start gap-2 ${
                  error.includes("Check your email")
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  <span className="mt-0.5 shrink-0">
                    {error.includes("Check your email") ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                  </span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-lg shadow-emerald-700/20 hover:shadow-emerald-700/30 transition-all duration-200 disabled:opacity-70"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Please wait...
                  </span>
                ) : isSignUp ? (
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Create Account
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </span>
                )}
              </Button>

              {/* Toggle Sign In / Sign Up */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
                  className="text-sm text-emerald-700 hover:text-emerald-800 font-medium transition-colors inline-flex items-center gap-1"
                >
                  {isSignUp ? (
                    <>Already have an account? Sign in <ArrowRight className="h-3.5 w-3.5" /></>
                  ) : (
                    <>Don&apos;t have an account? Create one <ArrowRight className="h-3.5 w-3.5" /></>
                  )}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-emerald-700/60 mt-6">
          Secure Enterprise Asset Management Platform
        </p>
      </div>
    </div>
  );
};

export default Login;
