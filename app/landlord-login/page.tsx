"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const landlordStorageKey = "studentHousingLandlord";

export default function LandlordLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(landlordStorageKey);
    if (saved) {
      router.push("/landlord-dashboard");
    }
  }, [router]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    if (!email || !password) {
      setStatusMessage("❌ Email and password are required");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem(landlordStorageKey, JSON.stringify(result.data));
        localStorage.setItem("sessionToken", result.token);
        setStatusMessage("✓ Login successful! Redirecting...");
        setTimeout(() => {
          router.push("/landlord-dashboard");
        }, 1500);
      } else {
        setStatusMessage(`❌ ${result.message || "Login failed"}`);
      }
    } catch (error) {
      setStatusMessage("❌ An error occurred. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-lg text-center">
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">
            Landlord Login
          </h1>
          <p className="text-slate-600">
            Sign in to manage your properties and student applications.
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="space-y-6 rounded-3xl bg-white p-8 shadow-lg"
        >
          <div>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Email address
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="landlord@example.com"
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          <div>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Password
              </span>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? "👁️ Hide" : "👁️ Show"}
                </button>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-2xl font-medium hover:bg-blue-700 transition disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>

          {statusMessage && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                statusMessage.includes("✓")
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {statusMessage}
            </div>
          )}

          <div className="border-t border-slate-200 pt-6">
            <p className="text-center text-sm text-slate-600">
              Don't have an account?{" "}
              <a
                href="/landlord-register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Register here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
