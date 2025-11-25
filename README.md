# NeuroVision Social Media Automation

A comprehensive system for automating social media strategy and content generation using AI, n8n, and a custom Dashboard.

## Quick Start

Run the entire stack with Docker Compose:

```bash
docker-compose up --build -d
```

- **Frontend Dashboard**: [http://localhost:8080](http://localhost:8080)
- **Backend API**: [http://localhost:3000](http://localhost:3000)

## Architecture

- **Backend**: Express.js, MongoDB, Qdrant. Handles data persistence and authentication.
- **Frontend**: Vue.js 3, TailwindCSS. User interface for managing strategies.
- **n8n**: Workflow automation engine (connects Frontend actions to AI/Social logic).

## Backend API Reference

### Authentication
**Headers Required**: `x-api-key: <your_api_key>` (Default: `neurovision_secret_key`)

- `POST /auth/register`
    - Body: `{ "username": "...", "password": "..." }`
    - Returns: `{ "message": "User created successfully" }`
- `POST /auth/login`
    - Body: `{ "username": "...", "password": "..." }`
    - Returns: `{ "token": "jwt_token..." }`

### Universal Data Access (DAL)
**Headers Required**: `x-api-key: ...` OR `Authorization: Bearer <jwt_token>`

- `GET /api/:collection`
    - Query: `filter={}`, `sort={}`, `limit=100`, `skip=0`
    - Example: `/api/posts?filter={"status":"draft"}`
- `GET /api/:collection/:id`
- `POST /api/:collection`
    - Body: JSON object to save.
- `PUT /api/:collection/:id`
- `DELETE /api/:collection/:id`

### Qdrant (RAG)
- `POST /api/qdrant/search`
- `POST /api/qdrant/upsert`

## n8n Webhook Interface (Frontend Integration)

The Frontend communicates with n8n via Webhooks to trigger complex workflows. These workflows then call back to the Backend API to store results.

| Workflow | Method | Webhook Path | Description |
|----------|--------|--------------|-------------|
| **Login** | POST | `/login` | Authenticates user (Mock/Proxy). |
| **Get Strategy** | GET | `/strategy` | Query: `month` (YYYY-MM). Fetches strategy. |
| **Create Strategy** | POST | `/strategy` | Body: `{ month: "..." }`. Generates new strategy. |
| **Generate Content** | POST | `/generate` | Body: `{ strategyId: "..." }`. Generates posts. |
| **Publish Content** | POST | `/publish` | Body: `{ postId: "..." }`. Publishes post. |

## Configuration

- **Backend**: `.env` or `docker-compose.yml` environment variables.
    - `API_KEY`: System secret for n8n/admin access.
    - `JWT_SECRET`: Secret for user sessions.
- **Frontend**: `VITE_` variables.
    - `VITE_N8N_BASE_URL`: URL of n8n webhook engine.
