# API Documentation

This document describes the HumanLenk API endpoints, request/response formats, and authentication.

## 🔐 Authentication

All API endpoints (except public ones) require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

### Getting a Token
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "USER"
    },
    "token": "jwt_token_here"
  }
}
```

## 👤 User Management

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

### Get Current User Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Update User Profile
```http
PATCH /api/auth/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

## 💬 Chat API

### Send Message
```http
POST /api/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Hello, can you help me?",
  "fileId": "optional_file_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userMessage": {
      "id": "msg_id",
      "content": "Hello, can you help me?",
      "role": "USER",
      "userId": "user_id",
      "fileId": null,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "assistantMessage": {
      "id": "msg_id_2",
      "content": "Hello! I'd be happy to help you...",
      "role": "ASSISTANT",
      "userId": "user_id",
      "fileId": null,
      "createdAt": "2024-01-01T00:00:01Z"
    }
  }
}
```

### Get Messages
```http
GET /api/chat/messages?limit=50&offset=0
Authorization: Bearer <token>
```

### Delete Message
```http
DELETE /api/chat/messages/{messageId}
Authorization: Bearer <token>
```

### Clear All Messages
```http
DELETE /api/chat/messages
Authorization: Bearer <token>
```

### Get Chat Statistics
```http
GET /api/chat/stats
Authorization: Bearer <token>
```

## 📁 File Management

### Upload File
```http
POST /api/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file_data>
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": "file_id",
    "name": "document.pdf",
    "type": "application/pdf",
    "size": 1024000,
    "url": "https://s3.amazonaws.com/bucket/file.pdf",
    "s3Key": "user_id/uuid.pdf",
    "status": "COMPLETED",
    "userId": "user_id",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get User Files
```http
GET /api/files?limit=20&offset=0&status=COMPLETED&type=application/pdf
Authorization: Bearer <token>
```

### Get File Details
```http
GET /api/files/{fileId}
Authorization: Bearer <token>
```

### Generate Download URL
```http
GET /api/files/{fileId}/download
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://s3.amazonaws.com/bucket/file.pdf?signature=...",
    "expiresIn": 3600
  }
}
```

### Delete File
```http
DELETE /api/files/{fileId}
Authorization: Bearer <token>
```

### Get File Statistics
```http
GET /api/files/stats
Authorization: Bearer <token>
```

## 📊 Admin API

> **Note:** All admin endpoints require `ADMIN` role.

### Get All Users
```http
GET /api/admin/users?limit=20&offset=0&role=USER&search=john
Authorization: Bearer <admin_token>
```

### Get User Details
```http
GET /api/admin/users/{userId}
Authorization: Bearer <admin_token>
```

### Update User Role
```http
PATCH /api/admin/users/{userId}/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "ADMIN"
}
```

### Delete User
```http
DELETE /api/admin/users/{userId}
Authorization: Bearer <admin_token>
```

### Get All Files
```http
GET /api/admin/files?limit=20&offset=0&status=COMPLETED&userId=user_id
Authorization: Bearer <admin_token>
```

### Delete File (Admin)
```http
DELETE /api/admin/files/{fileId}
Authorization: Bearer <admin_token>
```

### Get Admin Dashboard Stats
```http
GET /api/admin/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 150,
      "totalFiles": 500,
      "totalMessages": 2000,
      "activeUsers": 45
    },
    "usersByRole": {
      "user": 145,
      "admin": 5
    },
    "filesByStatus": {
      "completed": {
        "count": 450,
        "totalSize": 1073741824
      },
      "processing": {
        "count": 30,
        "totalSize": 104857600
      },
      "error": {
        "count": 20,
        "totalSize": 52428800
      }
    },
    "messagesByRole": {
      "user": 1000,
      "assistant": 1000
    },
    "recent": {
      "users": [...],
      "files": [...]
    }
  }
}
```

### Get Surveys
```http
GET /api/admin/surveys?limit=20&offset=0
Authorization: Bearer <admin_token>
```

## 📝 Survey API

### Submit Survey
```http
POST /api/surveys
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "feedback": "Great experience!"
}
```

### Get User Surveys
```http
GET /api/surveys/my
Authorization: Bearer <token>
```

### Get Survey Statistics (Public)
```http
GET /api/surveys/stats
```

## 🔧 Health & Monitoring

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 3600
}
```

## 📋 Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": {
    "field": "additional_error_info"
  }
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

### Error Examples

#### Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "email": "Invalid email format"
  }
}
```

#### Authentication Error
```json
{
  "success": false,
  "error": "Authentication failed"
}
```

#### Rate Limit Error
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

## 🔒 Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 10 requests per 15 minutes per IP
- **File Upload**: 20 requests per 15 minutes per user
- **Chat**: 50 requests per 15 minutes per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 📊 Pagination

List endpoints support pagination:

### Query Parameters
- `limit`: Number of items per page (default: 20, max: 100)
- `offset`: Number of items to skip (default: 0)

### Response Format
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "total": 150,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

## 🔍 Filtering & Search

Many endpoints support filtering and search:

### Users
- `role`: Filter by user role (USER, ADMIN)
- `search`: Search by name or email

### Files
- `status`: Filter by file status (UPLOADING, PROCESSING, COMPLETED, ERROR)
- `type`: Filter by file type (application/pdf, etc.)
- `userId`: Filter by user ID

### Messages
- `role`: Filter by message role (USER, ASSISTANT)
- `fileId`: Filter by associated file

## 📱 PWA Support

The API is designed to work seamlessly with Progressive Web Apps:

- **Offline Support**: Cached responses for offline functionality
- **Background Sync**: Queued actions sync when connection is restored
- **Push Notifications**: Support for push notification delivery
- **Service Worker**: API responses cached for better performance

## 🧪 Testing

### Test Environment
Use the test environment for development and testing:
```
Base URL: http://localhost:3001/api
```

### Test Data
The API includes endpoints for creating test data (development only):
```http
POST /api/test/seed-data
Authorization: Bearer <admin_token>
```

## 📈 Performance

### Response Times
- **Authentication**: < 200ms
- **Chat Messages**: < 500ms
- **File Upload**: < 2s (depending on file size)
- **Database Queries**: < 100ms
- **File Downloads**: < 1s

### Optimization Features
- **Connection Pooling**: Database connections are pooled
- **Caching**: Frequently accessed data is cached
- **Compression**: Responses are gzip compressed
- **CDN**: Static assets served via CloudFront

---

For more information, see the [Deployment Guide](DEPLOYMENT.md) or [README](../README.md).
