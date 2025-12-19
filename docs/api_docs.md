# API Documentation

## Base URL
`/api`

## Endpoints

### 1. Zakat Calculation
- **URL**: `/zakat/calculate`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "assets": {
      "gold": 100, // grams
      "silver": 500, // grams
      "cash": 100000 // PKR
    }
  }
  ```
- **Response**:
  ```json
  {
    "totalZakat": 5000,
    "currency": "PKR",
    "details": [...]
  }
  ```

### 2. Donations
- **URL**: `/donations`
- **Method**: `GET` (List), `POST` (Create)
- **Body (POST)**:
  ```json
  {
    "donorId": 1,
    "amount": 5000,
    "type": "ZAKAT"
  }
  ```

### 3. Beneficiaries
- **URL**: `/beneficiaries`
- **Method**: `POST`
- **Body**: `FormData` (region, income, familyMembers, document)

### 4. Admin Analytics
- **URL**: `/admin/analytics`
- **Method**: `GET`
- **Response**: Aggregated stats for donations and distributions.
