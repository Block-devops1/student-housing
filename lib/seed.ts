import { getMongoClient } from "./mongodb";
import { Property, User, Application } from "./types";

export async function seedDatabase() {
  try {
    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB);

    // Clear existing data
    await db.collection("properties").deleteMany({});
    await db.collection("users").deleteMany({});
    await db.collection("applications").deleteMany({});

    // Sample users
    const sampleUsers: Omit<User, "_id">[] = [
      {
        name: "John Smith",
        email: "john.smith@email.com",
        phone: "555-0101",
        userType: "landlord",
        properties: [],
        createdAt: new Date(),
      },
      {
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        phone: "555-0102",
        userType: "landlord",
        properties: [],
        createdAt: new Date(),
      },
      {
        name: "Mike Davis",
        email: "mike.davis@email.com",
        phone: "555-0103",
        userType: "student",
        university: "State University",
        preferences: {
          maxPrice: 1500,
          minBedrooms: 1,
          preferredAmenities: ["parking", "laundry"],
        },
        createdAt: new Date(),
      },
      {
        name: "Emma Wilson",
        email: "emma.wilson@email.com",
        phone: "555-0104",
        userType: "student",
        university: "Tech University",
        preferences: {
          maxPrice: 2000,
          minBedrooms: 2,
          preferredAmenities: ["wifi", "security"],
        },
        createdAt: new Date(),
      },
    ];

    const insertedUsers = await db.collection("users").insertMany(sampleUsers);
    const userIds = Object.values(insertedUsers.insertedIds);

    // Sample properties
    const sampleProperties: Omit<Property, "_id">[] = [
      {
        title: "Self-Contain Near University of Lagos",
        description:
          "Fully furnished self-contain with reliable generator and water supply, 10 minutes from University of Lagos.",
        address: {
          street: "28 Akoka Road",
          city: "Lagos",
          state: "Lagos",
          zipCode: "100213",
          coordinates: [3.3883, 6.5147],
        },
        price: 220000,
        bedrooms: 1,
        bathrooms: 1,
        squareFootage: 450,
        amenities: ["generator", "water supply", "wifi", "laundry", "security"],
        images: ["/placeholder-property-1.jpg"],
        landlordId: userIds[0].toString(),
        availabilityDate: new Date("2024-08-01"),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Shared Apartment in Yaba",
        description:
          "Affordable shared apartment for students, close to tech hubs and public transport.",
        address: {
          street: "76 Babs Anibaba Street",
          city: "Lagos",
          state: "Lagos",
          zipCode: "101212",
          coordinates: [3.384, 6.5033],
        },
        price: 110000,
        bedrooms: 2,
        bathrooms: 1,
        squareFootage: 700,
        amenities: ["generator", "security", "wifi", "water supply"],
        images: ["/placeholder-property-2.jpg"],
        landlordId: userIds[1].toString(),
        availabilityDate: new Date("2024-08-15"),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Graduate Studio near Covenant University",
        description:
          "Quiet studio apartment ideal for postgraduates and research students.",
        address: {
          street: "12 Akala Expressway",
          city: "Ota",
          state: "Ogun",
          zipCode: "112101",
          coordinates: [3.1833, 6.6842],
        },
        price: 170000,
        bedrooms: 0,
        bathrooms: 1,
        squareFootage: 420,
        amenities: ["generator", "water supply", "wifi", "security"],
        images: ["/placeholder-property-3.jpg"],
        landlordId: userIds[0].toString(),
        availabilityDate: new Date("2024-09-01"),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Campus House in Abuja",
        description:
          "Shared student house with daily housekeeping and 24/7 security, close to ABU and other schools.",
        address: {
          street: "45 Gwarinpa Road",
          city: "Abuja",
          state: "FCT",
          zipCode: "900108",
          coordinates: [7.4388, 9.0792],
        },
        price: 250000,
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: 1350,
        amenities: [
          "generator",
          "water supply",
          "security",
          "laundry",
          "parking",
        ],
        images: ["/placeholder-property-4.jpg"],
        landlordId: userIds[1].toString(),
        availabilityDate: new Date("2024-09-15"),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const insertedProperties = await db
      .collection("properties")
      .insertMany(sampleProperties);
    const propertyIds = Object.values(insertedProperties.insertedIds);

    // Update landlord properties arrays
    await db
      .collection("users")
      .updateOne(
        { _id: userIds[0] },
        {
          $set: {
            properties: [propertyIds[0], propertyIds[2]].map((id) =>
              id.toString(),
            ),
          },
        },
      );

    await db
      .collection("users")
      .updateOne(
        { _id: userIds[1] },
        {
          $set: {
            properties: [propertyIds[1], propertyIds[3]].map((id) =>
              id.toString(),
            ),
          },
        },
      );

    // Sample applications
    const sampleApplications: Omit<Application, "_id">[] = [
      {
        studentId: userIds[2].toString(),
        propertyId: propertyIds[0].toString(),
        status: "pending",
        message:
          "I am a student at nearby university and this location is perfect for my studies.",
        appliedAt: new Date(),
        updatedAt: new Date(),
      },
      {
        studentId: userIds[3].toString(),
        propertyId: propertyIds[1].toString(),
        status: "approved",
        message: "Looking for a shared apartment with good amenities.",
        appliedAt: new Date(Date.now() - 86400000), // 1 day ago
        updatedAt: new Date(),
      },
      {
        studentId: userIds[2].toString(),
        propertyId: propertyIds[3].toString(),
        status: "rejected",
        message: "Budget constraints, but interested in future listings.",
        appliedAt: new Date(Date.now() - 172800000), // 2 days ago
        updatedAt: new Date(),
      },
    ];

    await db.collection("applications").insertMany(sampleApplications);

    console.log("Database seeded successfully!");
    console.log(
      `Created ${sampleUsers.length} users, ${sampleProperties.length} properties, and ${sampleApplications.length} applications`,
    );
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
