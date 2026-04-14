# 📋 How to Retrieve and Present Agreement Records in Court

## Overview

StudentHousing NG maintains an encrypted audit trail of all user agreements with Terms & Conditions and Privacy Policy. These records can be retrieved and presented as legal evidence.

## Access Requirements

### 1. Set Up Admin Audit Key

Before you can retrieve records, set this in your `.env.local`:

```bash
ADMIN_AUDIT_KEY=your-super-secret-admin-key-12345
```

This prevents unauthorized access to sensitive agreement data.

### 2. Retrieve Records for Legal Proceedings

You have three options:

---

## Option A: Get Single Record (JSON Format)

**Retrieve by Record ID:**

```bash
curl -X GET "http://localhost:3000/api/audit?recordId=69dd5c44921d8557c944b542" \
  -H "x-admin-key: your-super-secret-admin-key-12345"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "69dd5c44921d8557c944b542",
      "email": "student@example.com",
      "name": "John Doe",
      "userType": "student",
      "agreedToTerms": true,
      "agreedToPrivacy": true,
      "termsVersion": "1.0",
      "privacyVersion": "1.0",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2026-04-14T10:30:00.000Z",
      "documentHash": "a3f5d8c9e2b1...",
      "integrityVerified": true
    }
  ],
  "integrityStatus": "✓ All records verified"
}
```

---

## Option B: Get Court-Ready Document (Plain Text)

**Retrieve by Email and format as Court Document:**

```bash
curl -X GET "http://localhost:3000/api/audit?email=student@example.com&format=court" \
  -H "x-admin-key: your-super-secret-admin-key-12345" \
  -o agreement-record.txt
```

**Output:** A formatted document like:

```
================================================================================
                    AGREEMENT VERIFICATION DOCUMENT
                         StudentHousing NG Platform
================================================================================

RECORD ID: 69dd5c44921d8557c944b542
TIMESTAMP: 4/14/2026, 10:30:00 AM
STATUS: ✓ Document integrity verified

USER INFORMATION:
  Name: John Doe
  Email: student@example.com
  User Type: STUDENT
  IP Address: 192.168.1.100
  User Agent: Mozilla/5.0...

AGREEMENT STATUS:
  ✓ Agreed to Terms & Conditions (v1.0): YES
  ✓ Agreed to Privacy Policy (v1.0): YES

SECURITY VERIFICATION:
  Document Hash: a3f5d8c9e2b1...

  This hash verifies the authenticity of this record. Any modification to the
  user information or agreement status will change this hash.

LEGAL NOTICE:
  This document serves as official evidence that the above-named individual
  explicitly agreed to the Platform's Terms & Conditions and Privacy Policy
  on the date and time specified above.
================================================================================
```

---

## Option C: Export Multiple Records (CSV Format)

**Retrieve all agreements for a user in CSV:**

```bash
curl -X GET "http://localhost:3000/api/audit?email=student@example.com&format=csv" \
  -H "x-admin-key: your-super-secret-admin-key-12345" \
  -o agreements.csv
```

**Output:** A CSV file with columns:

- Record ID
- Email
- Name
- User Type
- Agreed to T&C
- Agreed to Privacy
- Terms Version
- Privacy Version
- IP Address
- User Agent
- Timestamp
- Document Hash
- Integrity Verified

---

## 🔐 Security Features That Support Legal Evidence

1. **Encryption** — All sensitive data (email, name, IP) is encrypted at rest
2. **Document Hash** — Cryptographically verifies record hasn't been altered
3. **Timestamp** — Records exact time of agreement
4. **IP Tracking** — Documents which device/location made the agreement
5. **Integrity Verification** — Each retrieval verifies the cryptographic hash

---

## 📝 How to Use in Court

### Step 1: Request the Record

If you're in a dispute with a user, use their email to retrieve all agreements:

```bash
curl -X GET "http://localhost:3000/api/audit?email=disputed-user@example.com&format=court" \
  -H "x-admin-key: YOUR_ADMIN_KEY"
```

### Step 2: Verify Integrity

The response includes "integrityVerified: true" which proves:

- The record hasn't been modified since creation
- The cryptographic hash matches the data
- The timestamp is authentic

### Step 3: Present Documentation

Provide:

- The court-formatted document
- The cryptographic hash
- Documentation of your encryption methodology
- Timestamp proof

### Step 4: Legal Argument

You can argue:

> "Despite the user's claim they didn't agree to Terms & Conditions,
> we have cryptographic proof that on [DATE] at [TIME] from IP address
> [IP], they explicitly checked both agreement boxes and saved their
> profile. The record is protected by AES-256 encryption and verified
> by SHA-256 hash. This constitutes irrefutable evidence of consent."

---

## Example Scenario: Student Claims Fraud

1. **Student says:** "I never agreed to the Terms & Conditions!"
2. **You respond:** "We have encrypted audit trail evidence here..."
3. **Run:** `curl -X GET "http://localhost:3000/api/audit?email=student@example.com&format=court" ...`
4. **Present:** The court-formatted document showing:
   - ✓ Agreed to Terms & Conditions: YES
   - Timestamp: 2026-03-15 at 14:23:45
   - IP Address
   - Device information
5. **Evidence:** The document hash proves it hasn't been tampered with

---

## ⚠️ Important Notes

1. **Encryption Key Must Be Secure** — If your encryption key is compromised, records could be forged
2. **Admin Key Rotation** — Change `ADMIN_AUDIT_KEY` regularly
3. **Backup Keys** — Keep encrypted backups of your encryption key in a safe place
4. **Document Chain of Custody** — When retrieving for court, maintain proper documentation of who accessed records and when
5. **Legal Consultation** — Always consult with a lawyer before using this evidence in court

---

## API Reference

**Endpoint:** `GET /api/audit`

**Required Headers:**

- `x-admin-key: [YOUR_ADMIN_AUDIT_KEY]`

**Query Parameters:**

- `recordId` — Retrieve specific record by ID
- `email` — Retrieve all records for a user
- `format` — Output format: `json` (default), `court`, `csv`

**Response Codes:**

- `200` — Success
- `400` — Missing parameters
- `403` — Invalid admin key (unauthorized)
- `404` — No records found
- `500` — Server error

---

## Security Best Practices

✅ Keep `ADMIN_AUDIT_KEY` in `.env.local` (never commit to git)  
✅ Use HTTPS when retrieving records over network  
✅ Rotate admin keys regularly  
✅ Log all audit trail access requests  
✅ Only retrieve records for legitimate legal purposes  
✅ Maintain chain of custody documentation  
✅ Back up encryption keys securely
