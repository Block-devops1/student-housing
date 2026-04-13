"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  landlordId: string;
  isActive: boolean;
  availabilityDate: string;
}

interface Application {
  _id: string;
  propertyId: string;
  studentId: string;
  status: "pending" | "approved" | "rejected";
  message: string;
  createdAt: string;
}

const amenityOptions = [
  "generator",
  "water supply",
  "wifi",
  "security",
  "laundry",
  "parking",
  "furnished",
];
const landlordStorageKey = "studentHousingLandlord";

export default function LandlordDashboard() {
  const router = useRouter();
  const [landlordData, setLandlordData] = useState<any>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [price, setPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(landlordStorageKey);
    if (!saved) {
      router.push("/landlord-register");
      return;
    }

    try {
      const data = JSON.parse(saved);
      setLandlordData(data);
      fetchLandlordData(data._id || data.email);
    } catch (error) {
      console.error("Error reading landlord data:", error);
      router.push("/landlord-register");
    }
  }, [router]);

  const fetchLandlordData = async (landlordId: string) => {
    setIsLoading(true);
    try {
      const [propertiesRes, applicationsRes] = await Promise.all([
        fetch(`/api/landlord-properties?landlordId=${landlordId}`),
        fetch(`/api/applications?landlordId=${landlordId}`),
      ]);

      const propertiesData = await propertiesRes.json();
      const applicationsData = await applicationsRes.json();

      if (propertiesData.success) setProperties(propertiesData.data);
      if (applicationsData.success) setApplications(applicationsData.data);
    } catch (error) {
      console.error("Error fetching landlord data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((current) =>
      current.includes(amenity)
        ? current.filter((item) => item !== amenity)
        : [...current, amenity],
    );
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    // Validate before sending
    if (
      !title.trim() ||
      !description.trim() ||
      !street.trim() ||
      !city.trim() ||
      !state.trim() ||
      !price ||
      !bedrooms ||
      !bathrooms
    ) {
      setStatusMessage("Please fill in all required fields.");
      return;
    }

    const newProperty = {
      title: title.trim(),
      description: description.trim(),
      address: {
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
      },
      price: Number(price),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      amenities: selectedAmenities,
      landlordId: landlordData._id || landlordData.email,
      availabilityDate: availabilityDate || new Date().toISOString(),
      isActive: true,
      images: [],
    };

    try {
      const response = await fetch("/api/landlord-properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProperty),
      });

      const result = await response.json();
      if (result.success) {
        setProperties([...properties, result.data]);
        setShowAddForm(false);
        setStatusMessage("✓ Property added successfully!");
        setTitle("");
        setDescription("");
        setStreet("");
        setCity("");
        setState("");
        setZipCode("");
        setPrice("");
        setBedrooms("");
        setBathrooms("");
        setSelectedAmenities([]);
        setAvailabilityDate("");
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setStatusMessage("❌ " + (result.message || "Failed to add property"));
      }
    } catch (error) {
      setStatusMessage(
        "❌ Error: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
      console.error("Error adding property:", error);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    status: "approved" | "rejected",
  ) => {
    try {
      const response = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: applicationId, status }),
      });

      const result = await response.json();
      if (result.success) {
        setApplications(
          applications.map((app) =>
            app._id === applicationId ? { ...app, status } : app,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating application:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(landlordStorageKey);
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (!landlordData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <header className="bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">
                StudentHousing NG
              </h1>
              <span className="ml-4 text-gray-600">• Landlord Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {landlordData.name || landlordData.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-lg">
          <h2 className="text-3xl font-semibold text-slate-900 mb-2">
            Manage Your Properties
          </h2>
          <p className="text-slate-600">
            List new properties, manage applications, and connect with student
            renters.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl bg-white p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-slate-900">
                Your Properties
              </h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700"
              >
                {showAddForm ? "✕ Cancel" : "+ Add Property"}
              </button>
            </div>

            {showAddForm && (
              <form
                onSubmit={handleAddProperty}
                className="mb-8 rounded-2xl border border-slate-200 p-6 bg-slate-50"
              >
                <div className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">
                        Property title
                      </span>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Modern Student Apartment"
                        required
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="text-sm font-medium text-slate-700">
                        Description
                      </span>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your property..."
                        required
                        rows={3}
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-3">
                      Address
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Street address"
                        required
                        className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                      <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        required
                        className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                      <input
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="State"
                        required
                        className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                      <input
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="Zip code"
                        className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">
                        Monthly rent (₦)
                      </span>
                      <input
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        type="number"
                        placeholder="250000"
                        required
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">
                        Bedrooms
                      </span>
                      <input
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        type="number"
                        placeholder="2"
                        required
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">
                        Bathrooms
                      </span>
                      <input
                        value={bathrooms}
                        onChange={(e) => setBathrooms(e.target.value)}
                        type="number"
                        placeholder="1"
                        required
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      Availability date
                    </span>
                    <input
                      value={availabilityDate}
                      onChange={(e) => setAvailabilityDate(e.target.value)}
                      type="date"
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </label>

                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-3">
                      Amenities
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {amenityOptions.map((amenity) => (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                            selectedAmenities.includes(amenity)
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                          }`}
                        >
                          {amenity.replace("-", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-2xl bg-green-600 px-6 py-3 text-white shadow-lg transition hover:bg-green-700"
                  >
                    Create Property Listing
                  </button>
                  {statusMessage && (
                    <p className="rounded-2xl bg-green-100 px-4 py-3 text-green-700">
                      {statusMessage}
                    </p>
                  )}
                </div>
              </form>
            )}

            {properties.length > 0 ? (
              <div className="space-y-4">
                {properties.map((property) => (
                  <div
                    key={property._id}
                    className="rounded-2xl border border-slate-200 p-5 bg-slate-50 hover:border-slate-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-semibold text-slate-900">
                        {property.title}
                      </h4>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${property.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                      >
                        {property.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm mb-2 line-clamp-2">
                      {property.description}
                    </p>
                    <p className="text-slate-600 text-sm mb-3">
                      {property.address.street}, {property.address.city},{" "}
                      {property.address.state}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-blue-600">
                          ₦{property.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-slate-500 ml-4">
                          {property.bedrooms} bed • {property.bathrooms} bath
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.slice(0, 2).map((amenity) => (
                          <span
                            key={amenity}
                            className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                          >
                            {amenity.replace("-", " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
                <p className="text-lg font-medium text-slate-700">
                  No properties listed yet.
                </p>
                <p className="text-slate-500 mt-2">
                  Add your first property to get started.
                </p>
              </div>
            )}
          </div>

          <aside className="rounded-3xl bg-white p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-slate-900 mb-6">
              Student Applications
            </h3>
            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app) => {
                  const property = properties.find(
                    (p) => p._id === app.propertyId,
                  );
                  return (
                    <div
                      key={app._id}
                      className="rounded-2xl border border-slate-200 p-5 bg-slate-50"
                    >
                      <p className="text-sm font-medium text-slate-900 mb-2">
                        {property?.title || "Unknown Property"}
                      </p>
                      <p className="text-sm text-slate-600 mb-3">
                        {app.message || "Student application"}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            app.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : app.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {app.status.charAt(0).toUpperCase() +
                            app.status.slice(1)}
                        </span>
                        {app.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                updateApplicationStatus(app._id, "approved")
                              }
                              className="rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                updateApplicationStatus(app._id, "rejected")
                              }
                              className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
                <p className="text-lg font-medium text-slate-700">
                  No applications yet.
                </p>
                <p className="text-slate-500 mt-2">
                  Once students apply, they will appear here.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
