# Backend - NeuroVision

## Database Seeding

When running via Docker Compose, an admin user is automatically created:

- **Username**: `admin`
- **Password**: `admin123`

### Manual Seed Execution

If you need to run the seed manually:

```bash
npm run seed
```

## JWT Sessions

The system uses sessions to manage JWT tokens:

- Upon login, a session is created with a token
- The token is stored in the database in the user's `sessions` array
- Each request validates the token against active sessions
- Upon logout, the token is removed from sessions
- Expired sessions are automatically cleaned up on new login

### API Endpoints

#### POST /auth/login
Login to the system. Creates a new session.

```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### POST /auth/logout
Logout from the system. Removes the current session.

Requires header: `Authorization: Bearer <token>`

## Data Access Layer (DAL)

The backend provides a universal Data Access Layer that allows CRUD operations on any MongoDB collection through a RESTful API.

### Authentication

DAL endpoints require either:
- **API Key**: `x-api-key: <your_api_key>` header (for system/n8n access)
- **JWT Token**: `Authorization: Bearer <token>` header (for user access)

### Endpoints

#### GET /api/:collection
Retrieve documents from a collection with optional filtering, sorting, and pagination.

**Query Parameters:**
- `filter` - MongoDB query object (JSON string, default: `{}`)
- `sort` - Sort specification (JSON string, default: `{}`)
- `limit` - Maximum number of documents to return (default: `100`)
- `skip` - Number of documents to skip (default: `0`)

**Example:**
```bash
GET /api/strategies?filter={"month":"2024-01"}&limit=10
```

#### GET /api/:collection/:id
Retrieve a single document by ID.

**Example:**
```bash
GET /api/strategies/507f1f77bcf86cd799439011
```

#### POST /api/:collection
Create a new document in the collection.

**Body:** JSON object representing the document to create.

**Example:**
```bash
POST /api/strategies
Content-Type: application/json

{
  "month": "2024-01",
  "theme": "New Year Health Goals",
  "pillars": {
    "education": 40,
    "success_stories": 30,
    "thought_leadership": 20,
    "clinic_updates": 10
  }
}
```

#### PUT /api/:collection/:id
Update an existing document by ID.

**Body:** JSON object with fields to update.

**Example:**
```bash
PUT /api/strategies/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "theme": "Updated Theme"
}
```

#### DELETE /api/:collection/:id
Delete a document by ID.

**Example:**
```bash
DELETE /api/strategies/507f1f77bcf86cd799439011
```

### Supported Collections

The DAL works with any MongoDB collection, but the primary collections are:
- `strategies` - Monthly content strategies
- `posts` - Social media posts
- `users` - User accounts

### Error Handling

All DAL endpoints return appropriate HTTP status codes:
- `200` - Success
- `201` - Created (POST)
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid auth)
- `404` - Not Found
- `500` - Server Error

## Docker

Run via Docker Compose:

```bash
docker-compose up --build
```

Seed is executed automatically when the container starts.
