"use client";

import { useEffect, useState } from "react";
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY } from "@/lib/termsAndPolicy";

interface Property {
  _id: string;
  title: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  price: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
}

const amenitiesOptions = [
  "generator",
  "water supply",
  "wifi",
  "security",
  "laundry",
  "parking",
  "furnished",
];
const profileStorageKey = "studentHousingProfile";

export default function StudentProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [university, setUniversity] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("200000");
  const [minBedrooms, setMinBedrooms] = useState("1");
  const [preferredAmenities, setPreferredAmenities] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommendedProperties, setRecommendedProperties] = useState<
    Property[]
  >([]);
  const [recommendationMessage, setRecommendationMessage] = useState(
    "Enter your preferences and save to see recommended listings.",
  );
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");

  useEffect(() => {
    const rawProfile = localStorage.getItem(profileStorageKey);
    if (!rawProfile) return;

    try {
      const profile = JSON.parse(rawProfile);
      if (profile?.name) setName(profile.name);
      if (profile?.email) setEmail(profile.email);
      if (profile?.phone) setPhone(profile.phone);
      if (profile?.university) setUniversity(profile.university);
      if (profile?.preferences?.preferredLocation)
        setPreferredLocation(profile.preferences.preferredLocation);
      if (typeof profile?.preferences?.maxPrice === "number")
        setMaxPrice(String(profile.preferences.maxPrice));
      if (typeof profile?.preferences?.minBedrooms === "number")
        setMinBedrooms(String(profile.preferences.minBedrooms));
      if (Array.isArray(profile?.preferences?.preferredAmenities))
        setPreferredAmenities(profile.preferences.preferredAmenities);

      // Mark checkboxes as checked if profile was previously saved
      setAgreeToTerms(true);
      setAgreeToPrivacy(true);

      // Only fetch recommendations if boxes are already agreed
      fetchRecommendations();
    } catch (error) {
      console.error("Error loading saved profile:", error);
    }
  }, []);

  const toggleAmenity = (amenity: string) => {
    setPreferredAmenities((current) =>
      current.includes(amenity)
        ? current.filter((item) => item !== amenity)
        : [...current, amenity],
    );
  };

  const fetchRecommendations = async () => {
    if (
      !preferredLocation &&
      !maxPrice &&
      !minBedrooms &&
      preferredAmenities.length === 0
    ) {
      return;
    }

    setRecommendationMessage("Loading recommended properties...");

    const params = new URLSearchParams();
    if (preferredLocation.trim()) params.set("city", preferredLocation.trim());
    if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());
    if (minBedrooms.trim()) params.set("minBedrooms", minBedrooms.trim());
    if (preferredAmenities.length > 0)
      params.set("amenities", preferredAmenities.join(","));

    try {
      const response = await fetch(`/api/properties?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setRecommendedProperties(data.data);
        setRecommendationMessage(
          data.data.length > 0
            ? "Based on your preferences, these properties match best."
            : "No properties match your saved preferences yet.",
        );
      } else {
        setRecommendedProperties([]);
        setRecommendationMessage("Unable to load recommendations right now.");
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
      setRecommendedProperties([]);
      setRecommendationMessage("Unable to load recommendations right now.");
    }
  };

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

    const payload = {
      name,
      email,
      phone,
      university,
      preferences: {
        maxPrice: Number(maxPrice),
        minBedrooms: Number(minBedrooms),
        preferredAmenities,
        preferredLocation,
      },
    };

    try {
      const response = await fetch("/api/student-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        localStorage.setItem(profileStorageKey, JSON.stringify(payload));

        // Record agreement in audit trail (encrypted)
        try {
          await fetch("/api/agreements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              name,
              userType: "student",
              agreedToTerms,
              agreedToPrivacy,
            }),
          });
        } catch (error) {
          console.error("Failed to record agreement:", error);
          // Don't block profile save if agreement recording fails
        }

        setStatusMessage(
          "Profile saved successfully. You can now browse matched property listings.",
        );
        await fetchRecommendations();
      } else {
        setStatusMessage(result.message || "Failed to save profile.");
      }
    } catch (error) {
      setStatusMessage(
        "An unexpected error occurred while saving your profile.",
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">
            Student Profile
          </h1>
          <p className="text-slate-600">
            Save your housing preferences and get recommendations from our
            Nigerian property listings.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-8 rounded-3xl bg-white p-8 shadow-lg"
          >
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">
                Personal details
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
                    placeholder="you@example.com"
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
                    University
                  </span>
                  <input
                    value={university}
                    onChange={(event) => setUniversity(event.target.value)}
                    placeholder="University of Lagos"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">
                Housing preferences
              </h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Maximum budget (₦)
                  </span>
                  <input
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    type="number"
                    min="10000"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Minimum bedrooms
                  </span>
                  <input
                    value={minBedrooms}
                    onChange={(event) => setMinBedrooms(event.target.value)}
                    type="number"
                    min="0"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Preferred location
                </span>
                <input
                  value={preferredLocation}
                  onChange={(event) => setPreferredLocation(event.target.value)}
                  placeholder="Lagos, Abuja, Ota, Port Harcourt..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    Preferred amenities
                  </span>
                  <span className="text-sm text-slate-400">Choose up to 4</span>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {amenitiesOptions.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        preferredAmenities.includes(amenity)
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                      }`}
                    >
                      {amenity.replace("-", " ")}
                    </button>
                  ))}
                </div>
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
                {isSubmitting ? "Saving profile..." : "Save Profile"}
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

            {(name || email) && (
              <section className="space-y-4 border-t border-slate-200 pt-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  Your Saved Preferences
                </h2>
                <div className="space-y-3 text-slate-700">
                  {name && (
                    <p>
                      <strong>Name:</strong> {name}
                    </p>
                  )}
                  {email && (
                    <p>
                      <strong>Email:</strong> {email}
                    </p>
                  )}
                  {phone && (
                    <p>
                      <strong>Phone:</strong> {phone}
                    </p>
                  )}
                  {university && (
                    <p>
                      <strong>University:</strong> {university}
                    </p>
                  )}
                  {preferredLocation && (
                    <p>
                      <strong>Preferred Location:</strong> {preferredLocation}
                    </p>
                  )}
                  {maxPrice && (
                    <p>
                      <strong>Maximum Budget:</strong> ₦
                      {Number(maxPrice).toLocaleString()}
                    </p>
                  )}
                  {minBedrooms && (
                    <p>
                      <strong>Minimum Bedrooms:</strong> {minBedrooms}
                    </p>
                  )}
                  {preferredAmenities.length > 0 && (
                    <p>
                      <strong>Preferred Amenities:</strong>{" "}
                      {preferredAmenities.join(", ")}
                    </p>
                  )}
                </div>
              </section>
            )}
          </form>

          <aside className="rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Recommended for you
            </h2>

            {agreeToTerms && agreeToPrivacy ? (
              <>
                <p className="text-slate-600 mb-6">{recommendationMessage}</p>

                {recommendedProperties.length > 0 ? (
                  <div className="space-y-4">
                    {recommendedProperties.map((property) => (
                      <div
                        key={property._id}
                        className="rounded-3xl border border-slate-200 p-5"
                      >
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                          {property.title}
                        </h3>
                        <p className="text-slate-600 mb-2 line-clamp-2">
                          {property.description}
                        </p>
                        <p className="text-slate-600 text-sm mb-3">
                          {property.address.city}, {property.address.state}
                        </p>
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-blue-600">
                            ₦{property.price.toLocaleString()}
                          </span>
                          <span className="text-sm text-slate-500">
                            {property.bedrooms} bed • {property.bathrooms} bath
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-slate-500 bg-slate-50 rounded-2xl p-4 border border-slate-200">
                ⚠️ Save your profile and agree to the Terms & Conditions and
                Privacy Policy to see recommendations.
              </p>
            )}
          </aside>
        </div>

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
