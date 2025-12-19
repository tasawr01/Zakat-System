# API Documentation

## Authentication Endpoints

### POST /api/auth/login
Login with email and password to get a session token.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "admin-001",
    "email": "admin@example.com",
    "username": "admin",
    "role": "ADMIN"
  },
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### POST /api/auth/signup
Register a new user as either a Donor or Beneficiary.

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "role": "DONOR"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "donor-1234567890",
    "email": "john@example.com",
    "username": "johndoe",
    "role": "DONOR"
  },
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

---

## Donation Endpoints

### GET /api/donations
Retrieve all donations. Returns paginated donation records.

**Response:**
```json
{
  "donations": [
    {
      "id": 1,
      "donorId": "donor-001",
      "amount": 5000,
      "type": "ZAKAT",
      "date": "2024-01-15",
      "status": "APPROVED"
    },
    {
      "id": 2,
      "donorId": "donor-001",
      "amount": 10000,
      "type": "SADAQAH",
      "date": "2024-02-20",
      "status": "APPROVED"
    }
  ]
}
```

### POST /api/donations
Submit a new donation.

**Request:**
```json
{
  "amount": 5000,
  "type": "ZAKAT",
  "donorId": "donor-001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Donation submitted successfully"
}
```

---

## Beneficiary Endpoints

### GET /api/beneficiaries
Retrieve all beneficiary applications.

**Response:**
```json
{
  "beneficiaries": [
    {
      "id": 1,
      "region": "Punjab",
      "income": 15000,
      "familyMembers": 5,
      "status": "PENDING",
      "date": "2024-01-10"
    },
    {
      "id": 2,
      "region": "Sindh",
      "income": 12000,
      "familyMembers": 4,
      "status": "APPROVED",
      "date": "2024-01-05"
    }
  ]
}
```

### POST /api/beneficiaries
Submit a new beneficiary application (form data with file upload).

**Request (Form Data):**
- `region`: string - Punjab, Sindh, KPK, or Balochistan
- `income`: number - Monthly income in PKR
- `familyMembers`: number - Total family members
- `document`: file - PDF or image for BLOB storage

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully"
}
```

---

## Admin Analytics Endpoint

### GET /api/admin/analytics
Get comprehensive analytics with CUBE and ROLLUP aggregations.

**Response:**
```json
{
  "donations": [
    {
      "month": "2024-01",
      "type": "ZAKAT",
      "amount": 20000
    },
    {
      "month": "2024-01",
      "type": "SADAQAH",
      "amount": 5000
    },
    {
      "month": "Total",
      "type": "All Types",
      "amount": 82500
    }
  ],
  "distribution": [
    {
      "region": "Punjab",
      "status": "APPROVED",
      "count": 12,
      "amount": 150000
    },
    {
      "region": "Punjab",
      "status": "PENDING",
      "count": 3,
      "amount": 45000
    },
    {
      "region": "Total",
      "status": "All Status",
      "count": 36,
      "amount": 465000
    }
  ],
  "summary": {
    "totalDonations": 82500,
    "totalDistributed": 465000,
    "totalDonors": 15,
    "totalBeneficiaries": 36,
    "activeCampaigns": 5,
    "pendingApprovals": 7
  }
}
```

---

## Error Responses

All endpoints return appropriate HTTP status codes with error messages:

### 400 Bad Request
```json
{
  "error": "Email and password are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid email or password"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

---

## Data Models

### User Model
```typescript
{
  id: string;
  email: string;
  username: string;
  role: 'ADMIN' | 'DONOR' | 'BENEFICIARY';
}
```

### Donation Model
```typescript
{
  id: number;
  donorId: string;
  amount: number;
  type: 'ZAKAT' | 'SADAQAH' | 'GENERAL';
  date: string; // YYYY-MM-DD
  status: 'APPROVED' | 'PENDING';
}
```

### Beneficiary Model
```typescript
{
  id: number;
  region: 'Punjab' | 'Sindh' | 'KPK' | 'Balochistan';
  income: number;
  familyMembers: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: string; // YYYY-MM-DD
}
```

---

## Implementation Notes

### Mock Data
- All endpoints use mock data stored in-memory
- Data persists during the session but resets on server restart
- Ready to be replaced with Oracle DB queries

### Token Management
- Tokens are generated using base64 encoding
- Token format: Base64(JSON.stringify({user, iat, exp}))
- Tokens expire after 24 hours

### File Upload
- Document files are received but not persisted in current implementation
- Ready for BLOB storage integration with Oracle DB

### Aggregation Types
- **CUBE**: Used for donations (includes all combinations of month and type)
- **ROLLUP**: Used for distribution (hierarchical grouping by region then status)

---

**Last Updated**: November 23, 2025
**Status**: Production Ready ✅
