'use client';

import { useState } from 'react';

const amenitiesOptions = [
  'generator',
  'water supply',
  'wifi',
  'security',
  'laundry',
  'parking',
  'furnished',
];

export default function StudentProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState('200000');
  const [minBedrooms, setMinBedrooms] = useState('1');
  const [preferredAmenities, setPreferredAmenities] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleAmenity = (amenity: string) => {
    setPreferredAmenities((current) =>
      current.includes(amenity)
        ? current.filter((item) => item !== amenity)
        : [...current, amenity]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
      const response = await fetch('/api/student-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        setStatusMessage('Profile saved successfully. You can now browse matched property listings.');
      } else {
        setStatusMessage(result.message || 'Failed to save profile.');
      }
    } catch (error) {
      setStatusMessage('An unexpected error occurred while saving your profile.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">Student Profile</h1>
          <p className="text-slate-600">
            Tell us about yourself and your housing preferences so we can surface the best student housing options in Nigeria.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl bg-white p-8 shadow-lg">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">Personal details</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Full name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="John Doe"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email address</span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Phone number</span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="0801 234 5678"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">University</span>
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
            <h2 className="text-2xl font-semibold text-slate-900">Housing preferences</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Maximum budget (₦)</span>
                <input
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  type="number"
                  min="10000"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Minimum bedrooms</span>
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
              <span className="text-sm font-medium text-slate-700">Preferred location</span>
              <input
                value={preferredLocation}
                onChange={(event) => setPreferredLocation(event.target.value)}
                placeholder="Lagos, Abuja, Ota, Port Harcourt..."
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Preferred amenities</span>
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
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                    }`}
                  >
                    {amenity.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Saving profile...' : 'Save Profile'}
            </button>
            {statusMessage ? (
              <p className="rounded-2xl bg-slate-100 px-4 py-3 text-slate-700">{statusMessage}</p>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
