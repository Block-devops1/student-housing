"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY } from "@/lib/termsAndPolicy";

const landlordStorageKey = "studentHousingLandlord";

export default function LandlordRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");

  useEffect(() => {
    const saved = localStorage.getItem(landlordStorageKey);
    if (saved) {
      router.push("/landlord-dashboard");
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!agreeToTerms || !agreeToPrivacy) {
      setStatusMessage(
        "❌ You must agree to our Terms & Conditions and Privacy Policy to continue.",
      );
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const landlordData = {
      name,
      email,
      phone,
      companyName,
      userType: "landlord",
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/landlord-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(landlordData),
      });

      const result = await response.json();
      if (result.success) {
        localStorage.setItem(landlordStorageKey, JSON.stringify(result.data));
        setStatusMessage(
          "Registration successful! Redirecting to dashboard...",
        );
        setTimeout(() => {
          router.push("/landlord-dashboard");
        }, 1500);
      } else {
        setStatusMessage(result.message || "Registration failed.");
      }
    } catch (error) {
      setStatusMessage("An unexpected error occurred.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">
            Landlord Registration
          </h1>
          <p className="text-slate-600">
            Create your landlord account and start listing properties for
            students.
          </p>
        </div>

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-3xl bg-white p-8 shadow-lg"
        >
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">
              Your details
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Full name
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="John Doe"
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Email address
                </span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  placeholder="landlord@example.com"
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Phone number
                </span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="0801 234 5678"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Company/Agency name
                </span>
                <input
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  placeholder="Your Company Name (optional)"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>
          </section>

          <div className="space-y-4 border-t border-slate-200 pt-6">
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600"
                />
                <span className="text-sm text-slate-700">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setShowTermsModal(true);
                      setActiveTab("terms");
                    }}
                    className="text-blue-600 underline hover:text-blue-700"
                  >
                    Terms & Conditions
                  </button>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToPrivacy}
                  onChange={(e) => setAgreeToPrivacy(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600"
                />
                <span className="text-sm text-slate-700">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setShowTermsModal(true);
                      setActiveTab("privacy");
                    }}
                    className="text-blue-600 underline hover:text-blue-700"
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !agreeToTerms || !agreeToPrivacy}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Registering..." : "Create Account"}
            </button>
            {statusMessage ? (
              <div
                className={`rounded-2xl border px-4 py-3 ${
                  statusMessage.includes("❌")
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-green-50 border-green-200 text-green-700"
                }`}
              >
                {statusMessage}
              </div>
            ) : null}
          </div>
        </form>

        {showTermsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {activeTab === "terms"
                    ? "Terms & Conditions"
                    : "Privacy Policy"}
                </h2>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="text-slate-500 hover:text-slate-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="flex gap-2 p-4 border-b border-slate-200">
                <button
                  onClick={() => setActiveTab("terms")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeTab === "terms"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Terms & Conditions
                </button>
                <button
                  onClick={() => setActiveTab("privacy")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeTab === "privacy"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Privacy Policy
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-6">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">
                  {activeTab === "terms"
                    ? TERMS_AND_CONDITIONS
                    : PRIVACY_POLICY}
                </pre>
              </div>

              <div className="p-6 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="w-full bg-blue-600 text-white py-3 rounded-2xl font-medium hover:bg-blue-700 transition"
                >
                  I understand, Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
