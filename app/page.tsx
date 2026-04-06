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

async function getProperties(): Promise<Property[]> {
  try {
    const response = await fetch('http://localhost:3000/api/properties', {
      cache: 'no-store' // Ensure fresh data on each request
    });
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

export default async function Home() {
  const properties = await getProperties();

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
              <a href="#" className="text-gray-700 hover:text-blue-600">Properties</a>
              <a href="#" className="text-gray-700 hover:text-blue-600">Contact</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Student Housing in Nigeria
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover affordable student-friendly housing near Nigerian campuses
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-2">
              <div className="flex flex-col md:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Search Lagos, Abuja, University of Lagos, Covenant University..."
                  className="flex-1 px-4 py-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 font-medium">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Featured Properties</h3>
            <p className="text-lg text-gray-600">Handpicked housing options for students</p>
          </div>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Property Image</span>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{property.title}</h4>
                    <p className="text-gray-600 mb-2">
                      {property.address.street}, {property.address.city}, {property.address.state}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-blue-600">₦{property.price.toLocaleString()}</span>
                      <span className="text-sm text-gray-500">
                        {property.bedrooms} bed • {property.bathrooms} bath
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {property.amenities.slice(0, 3).map((amenity) => (
                        <span key={amenity} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm capitalize">
                          {amenity.replace('-', ' ')}
                        </span>
                      ))}
                      {property.amenities.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                          +{property.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No properties available at the moment.</p>
              <p className="text-gray-400 mt-2">Check back later for new listings!</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
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
            <p>&copy; 2024 StudentHousing. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
