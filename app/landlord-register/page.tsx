'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const landlordStorageKey = 'studentHousingLandlord';

export default function LandlordRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(landlordStorageKey);
    if (saved) {
      router.push('/landlord-dashboard');
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const landlordData = {
      name,
      email,
      phone,
      companyName,
      userType: 'landlord',
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/landlord-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(landlordData),
      });

      const result = await response.json();
      if (result.success) {
        localStorage.setItem(landlordStorageKey, JSON.stringify(result.data));
        setStatusMessage('Registration successful! Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/landlord-dashboard');
        }, 1500);
      } else {
        setStatusMessage(result.message || 'Registration failed.');
      }
    } catch (error) {
      setStatusMessage('An unexpected error occurred.');
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
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">Landlord Registration</h1>
          <p className="text-slate-600">
            Create your landlord account and start listing properties for students.
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl bg-white p-8 shadow-lg">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">Your details</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Full name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="John Doe"
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email address</span>
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
                <span className="text-sm font-medium text-slate-700">Phone number</span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="0801 234 5678"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Company/Agency name</span>
                <input
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  placeholder="Your Company Name (optional)"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>
          </section>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Registering...' : 'Create Account'}
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
