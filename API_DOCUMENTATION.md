# Invoice Hub API Documentation

## Authentication for Mobile Apps

The Invoice Hub API supports JWT token authentication for both web browsers (via HTTP-only cookies) and mobile applications (via Authorization headers).

## Getting Started

### 1. Login API

**POST** `/api/auth/login`

Login and receive a JWT token for mobile app authentication.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // JWT token for mobile apps
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "admin",
    "companyName": "ACME Corp",
    "isFirstLogin": false
  },
  "redirectUrl": "/admin/dashboard",
  "tokenExpiry": "2024-01-14T10:30:00.000Z" // Token expiration date
}
```

### 2. Using JWT Token in Mobile Apps

Store the `token` from the login response and include it in all subsequent API requests:

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### 3. Token Verification

**GET** `/api/auth/verify`

Verify if your stored token is still valid and get current user information.

**Headers:**
```
Authorization: Bearer your_jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "admin",
    "companyName": "ACME Corp",
    "clientId": null,
    "staffId": null,
    "isFirstLogin": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-07T10:30:00.000Z"
  },
  "tokenPayload": {
    "userId": 1,
    "email": "john@example.com",
    "role": "admin"
  }
}
```

## Protected API Endpoints

All protected endpoints require the `Authorization: Bearer <token>` header.

### 1. Outgoing Payments

**GET** `/api/outgoing-payments`

Get all outgoing payments with optional filters.

**Query Parameters:**
- `search` (optional) - Search in payment number, payee name, reference number, or notes
- `status` (optional) - Filter by payment status
- `category` (optional) - Filter by payment category
- `method` (optional) - Filter by payment method
- `startDate` (optional) - Filter by start date (ISO string)
- `endDate` (optional) - Filter by end date (ISO string)

**Example Request:**
```
GET /api/outgoing-payments?status=Paid&category=Staff%20Salary
Authorization: Bearer your_jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "payments": [
    {
      "id": 1,
      "paymentNumber": "OP-123456-001",
      "paymentCategory": "Staff Salary",
      "amount": 5000.00,
      "paymentDate": "2024-01-07T00:00:00.000Z",
      "paymentMethod": "Bank Transfer",
      "status": "Paid",
      "payeeName": "John Doe",
      "referenceNumber": "REF001",
      "notes": "Monthly salary payment",
      "attachments": [],
      "createdAt": "2024-01-07T10:30:00.000Z",
      // ... more fields
    }
  ],
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**POST** `/api/outgoing-payments`

Create a new outgoing payment.

**Request Body:**
```json
{
  "paymentCategory": "Staff Salary",
  "expenseCategoryId": 1,
  "staffId": 1,
  "amount": 5000.00,
  "paymentDate": "2024-01-07T00:00:00.000Z",
  "paymentMethod": "Bank Transfer",
  "status": "Pending",
  "referenceNumber": "REF001",
  "notes": "Monthly salary payment",
  "attachments": []
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": 1,
    "paymentNumber": "OP-123456-001",
    // ... payment details
  }
}
```

## Error Handling

### Authentication Errors

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Unauthorized. Please provide a valid authentication token.",
  "code": "UNAUTHORIZED"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Forbidden. Insufficient permissions.",
  "code": "FORBIDDEN"
}
```

### Common Error Codes

- `UNAUTHORIZED` - Invalid or missing JWT token
- `FORBIDDEN` - User doesn't have required permissions
- `VALIDATION_ERROR` - Request validation failed
- `DATABASE_CONNECTION_ERROR` - Database is unavailable
- `INTERNAL_SERVER_ERROR` - Unexpected server error

## Mobile App Implementation Examples

### React Native with Axios

```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://your-api-domain.com/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login function
export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    
    if (response.data.success) {
      // Store token for future requests
      await AsyncStorage.setItem('auth_token', response.data.token);
      await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
      return response.data;
    }
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get outgoing payments
export const getOutgoingPayments = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await apiClient.get(`/outgoing-payments?${params}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Verify token
export const verifyToken = async () => {
  try {
    const response = await apiClient.get('/auth/verify');
    return response.data;
  } catch (error) {
    // Token is invalid, clear storage
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
    throw error.response?.data || error.message;
  }
};
```

### Flutter with HTTP

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'https://your-api-domain.com/api';
  
  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }
  
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );
    
    final data = jsonDecode(response.body);
    
    if (response.statusCode == 200 && data['success']) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', data['token']);
      await prefs.setString('user_data', jsonEncode(data['user']));
      return data;
    } else {
      throw Exception(data['message'] ?? 'Login failed');
    }
  }
  
  static Future<Map<String, dynamic>> getOutgoingPayments() async {
    final response = await http.get(
      Uri.parse('$baseUrl/outgoing-payments'),
      headers: await _getHeaders(),
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else if (response.statusCode == 401) {
      // Clear invalid token
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
      await prefs.remove('user_data');
      throw Exception('Authentication failed');
    } else {
      throw Exception('Failed to fetch payments');
    }
  }
}
```

## Security Best Practices

1. **Store JWT tokens securely** in your mobile app (use Keychain on iOS, Keystore on Android)
2. **Check token expiry** before making requests
3. **Implement token refresh** logic when tokens expire
4. **Clear tokens** when users log out
5. **Use HTTPS** for all API communications
6. **Validate server certificates** to prevent man-in-the-middle attacks

## Token Lifecycle

1. **Login** - Receive JWT token
2. **Store** - Save token securely in mobile app
3. **Use** - Include token in API requests
4. **Verify** - Periodically check if token is still valid
5. **Refresh** - Implement refresh token logic (if needed)
6. **Logout** - Clear stored tokens 