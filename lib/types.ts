// Database schema types for Student Housing App

export interface Property {
  _id?: string;
  title: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: [number, number]; // [longitude, latitude]
  };
  price: number; // monthly rent
  bedrooms: number;
  bathrooms: number;
  squareFootage?: number;
  amenities: string[]; // ["parking", "laundry", "pet-friendly", "wifi", "gym"]
  images: string[]; // array of image URLs
  landlordId: string; // reference to User._id
  availabilityDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  userType: 'student' | 'landlord';
  // Student-specific fields
  university?: string;
  preferences?: {
    maxPrice: number;
    minBedrooms: number;
    preferredAmenities: string[];
    preferredLocation?: string;
  };
  // Landlord-specific fields
  properties?: string[]; // array of Property._id for landlords
  createdAt: Date;
}

export interface Application {
  _id?: string;
  studentId: string; // reference to User._id
  propertyId: string; // reference to Property._id
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  message?: string;
  appliedAt: Date;
  updatedAt: Date;
}