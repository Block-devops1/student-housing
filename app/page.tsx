'use client';

import { useEffect, useState } from 'react';

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

const amenityOptions = ['generator', 'water supply', 'wifi', 'security', 'laundry', 'parking', 'furnished'];
const profileStorageKey = 'studentHousingProfile';

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [location, setLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState('250000');
  const [minBedrooms, setMinBedrooms] = useState('1');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Showing latest student housing options in Nigeria.');

  useEffect(() => {
    const rawProfile = localStorage.getItem(profileStorageKey);
    if (!rawProfile) {
      fetchProperties();
      return;
    }

    try {
      const profile = JSON.parse(rawProfile);
      const preferences = profile?.preferences;
      if (preferences) {
        if (preferences.preferredLocation) {
          setLocation(preferences.preferredLocation);
        }
        if (typeof preferences.maxPrice === 'number') {
          setMaxPrice(String(preferences.maxPrice));
        }
        if (typeof preferences.minBedrooms === 'number') {
          setMinBedrooms(String(preferences.minBedrooms));
        }
        if (Array.isArray(preferences.preferredAmenities)) {
          setSelectedAmenities(preferences.preferredAmenities);
        }

        setStatusMessage('Loaded your saved student preferences. Showing recommended listings.');
        fetchProperties(
          preferences.preferredLocation || '',
          preferences.maxPrice ? String(preferences.maxPrice) : '',
          preferences.minBedrooms ? String(preferences.minBedrooms) : '',
          preferences.preferredAmenities || []
        );
        return;
      }
    } catch (error) {
      console.error('Error reading saved student profile:', error);
    }

    fetchProperties();
  }, []);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((current) =>
      current.includes(amenity)
        ? current.filter((item) => item !== amenity)
        : [...current, amenity]
    );
  };

  const fetchProperties = async (
    city = location,
    price = maxPrice,
    bedrooms = minBedrooms,
    amenities = selectedAmenities
  ) => {
    setIsLoading(true);
    setStatusMessage('Searching properties...');

    const params = new URLSearchParams();
    if (city.trim()) params.set('city', city.trim());
    if (price.trim()) params.set('maxPrice', price.trim());
    if (bedrooms.trim()) params.set('minBedrooms', bedrooms.trim());
    if (amenities.length > 0) params.set('amenities', amenities.join(','));

    try {
      const response = await fetch(`/api/properties?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setProperties(data.data);
        setStatusMessage(data.data.length > 0 ? 'Showing matching properties.' : 'No properties matched your filter.');
      } else {
        setProperties([]);
        setStatusMessage('Unable to load properties right now.');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
      setStatusMessage('Unable to load properties right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await fetchProperties();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">StudentHousing NG</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600">Home</a>
              <a href="/student-profile" className="text-gray-700 hover:text-blue-600">Student Profile</a>
              <a href="/landlord-dashboard" className="text-gray-700 hover:text-blue-600">Landlord Dashboard</a>
              <a href="#properties" className="text-gray-700 hover:text-blue-600">Properties</a>
              <a href="#footer" className="text-gray-700 hover:text-blue-600">Contact</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero + Filter */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Student Housing in Nigeria
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Filter by location, budget, bedrooms, and student-friendly amenities.
            </p>

            <div className="mx-auto max-w-4xl rounded-3xl bg-white/95 p-6 shadow-2xl text-slate-900">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Lagos, Abuja, Ota, Port Harcourt"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <input
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    type="number"
                    min="10000"
                    placeholder="Max budget (₦)"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <input
                    value={minBedrooms}
                    onChange={(event) => setMinBedrooms(event.target.value)}
                    type="number"
                    min="0"
                    placeholder="Min bedrooms"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="submit"
                    className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700"
                  >
                    Search
                  </button>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Filter amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {amenityOptions.map((amenity) => (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`rounded-2xl border px-3 py-2 text-sm transition ${
                          selectedAmenities.includes(amenity)
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                        }`}
                      >
                        {amenity.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Search results */}
      <section id="properties" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold text-gray-900">Property search results</h3>
              <p className="text-gray-600">{statusMessage}</p>
            </div>
            {isLoading ? <p className="text-blue-600">Loading...</p> : null}
          </div>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <div key={property._id} className="bg-white rounded-3xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-52 bg-slate-200 flex items-center justify-center text-slate-500">
                    Property Image
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-semibold text-slate-900 mb-2">{property.title}</h4>
                    <p className="text-slate-600 mb-2 line-clamp-2">{property.description}</p>
                    <p className="text-slate-600 mb-4">
                      {property.address.city}, {property.address.state}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-blue-600">₦{property.price.toLocaleString()}</span>
                      <span className="text-sm text-slate-500">
                        {property.bedrooms} bed • {property.bathrooms} bath
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {property.amenities.slice(0, 3).map((amenity) => (
                        <span key={amenity} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          {amenity.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                    <button className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700">
                      View details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <p className="text-lg font-medium text-slate-700">No matching properties found.</p>
              <p className="text-slate-500 mt-2">Try broadening your search or removing a filter.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">StudentHousing</h4>
              <p className="text-gray-400">
                Connecting students with their perfect housing options.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Quick Links</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Find Housing</a></li>
                <li><a href="#" className="hover:text-white">List Property</a></li>
                <li><a href="#" className="hover:text-white">Student Resources</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Connect</h5>
              <p className="text-gray-400 mb-2">Follow us for updates</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 StudentHousing. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
