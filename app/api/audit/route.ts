import { NextRequest, NextResponse } from "next/server";
import {
  retrieveAgreementRecord,
  retrieveUserAgreements,
  verifyAgreementIntegrity,
  formatCourtDocument,
} from "@/lib/auditTrail";

// TODO: Add proper authentication here - verify admin token/API key
function verifyAdminAccess(request: NextRequest): boolean {
  const adminKey = request.headers.get("x-admin-key");
  const expectedKey = process.env.ADMIN_AUDIT_KEY || "change-me-in-production";

  return adminKey === expectedKey;
}

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminAccess(request)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get("recordId");
    const email = searchParams.get("email");
    const format = searchParams.get("format") || "json"; // json, court, csv

    if (!recordId && !email) {
      return NextResponse.json(
        { success: false, message: "Must provide either recordId or email" },
        { status: 400 },
      );
    }

    let records: any[] = [];

    if (recordId) {
      const record = await retrieveAgreementRecord(recordId);
      if (record) records = [record];
    } else if (email) {
      records = await retrieveUserAgreements(email);
    }

    if (records.length === 0) {
      return NextResponse.json(
        { success: false, message: "No records found" },
        { status: 404 },
      );
    }

    // Verify integrity of all records
    const verifiedRecords = await Promise.all(
      records.map(async (record) => ({
        ...record,
        integrityVerified: await verifyAgreementIntegrity(record),
      })),
    );

    if (format === "court") {
      // Return single court document
      const courtDoc = formatCourtDocument(verifiedRecords[0]);
      return new Response(courtDoc, {
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": `attachment; filename="agreement-record-${verifiedRecords[0]._id}.txt"`,
        },
      });
    } else if (format === "csv") {
      // Return CSV for multiple records
      const csv = convertToCsv(verifiedRecords);
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="agreement-records-${new Date().toISOString()}.csv"`,
        },
      });
    }

    // Default JSON response
    return NextResponse.json({
      success: true,
      data: verifiedRecords,
      integrityStatus: verifiedRecords.every((r) => r.integrityVerified)
        ? "✓ All records verified"
        : "⚠ Some records failed integrity check",
    });
  } catch (error) {
    console.error("Error retrieving audit records:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve records",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

function convertToCsv(records: any[]): string {
  const headers = [
    "Record ID",
    "Email",
    "Name",
    "User Type",
    "Agreed to T&C",
    "Agreed to Privacy",
    "Terms Version",
    "Privacy Version",
    "IP Address",
    "User Agent",
    "Timestamp",
    "Document Hash",
    "Integrity Verified",
  ];

  const rows = records.map((r) => [
    r._id || "",
    r.email || "",
    r.name || "",
    r.userType || "",
    r.agreedToTerms ? "YES" : "NO",
    r.agreedToPrivacy ? "YES" : "NO",
    r.termsVersion || "",
    r.privacyVersion || "",
    r.ipAddress || "",
    r.userAgent || "",
    new Date(r.timestamp).toLocaleString(),
    r.documentHash || "",
    r.integrityVerified ? "VERIFIED" : "FAILED",
  ]);

  const csvContent = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((r) =>
      r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    ),
  ].join("\n");

  return csvContent;
}
