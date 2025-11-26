# N8N Persistence Hub

**Universal Data, Authentication, and Workflow Sync Node for n8n Projects**

The **N8N Persistence Hub** is a standalone backend service designed to act as the "central nervous system" for your n8n automation projects. It provides a unified API for data persistence (MongoDB & Qdrant), secure authentication (JWT & API Keys), and seamless workflow synchronization.

---

## 🚀 Features

-   **Universal Data Access (DAL):** A unified REST API to CRUD data in MongoDB.
-   **Vector Search Ready:** Built-in integration with Qdrant for RAG (Retrieval-Augmented Generation) applications.
-   **Secure Authentication:**
    -   **API Key:** For server-to-server communication (e.g., n8n ↔ Hub).
    -   **JWT:** For frontend user sessions.
-   **Workflow Sync:** Automatically syncs your local `n8n-data` (workflows & credentials) to your n8n instance on startup or via API.
-   **File Uploads:** Centralized file management for generated content.

---

## 📦 Installation & Usage

You can easily integrate the N8N Persistence Hub into your existing project using Docker Compose.

### 1. Docker Compose Integration

Add the following service to your project's `docker-compose.yml`:

```yaml
services:
  persistence-hub:
    image: ghcr.io/Rabdan/n8n-persistence-hub:latest
    container_name: n8n-persistence-hub
    ports:
      - "4000:4000"
    environment:
      # --- Core Configuration ---
      - PORT=4000
      - NODE_ENV=production
      
      # --- Security ---
      - API_KEY=your_secure_api_key
      - JWT_SECRET=your_jwt_secret_key
      
      # --- External Services ---
      - MONGO_URI=mongodb://mongo:27017/your_db_name
      - QDRANT_URL=http://qdrant:6333
      - OPENAI_API_KEY=sk-... (Optional, for internal tools)
      
      # --- n8n Integration ---
      - N8N_API_URL=http://n8n:5678/api/v1
      - N8N_API_KEY=your_n8n_api_key
      - N8N_BASE_URL=http://n8n:5678
      
      # --- Self-Reference ---
      - BACKEND_URL=http://persistence-hub:4000
      
      # --- Data Paths (Inside Container) ---
      - UPLOADS_DIR=/app/uploads
      - N8N_DATA_DIR=/app/n8n-data

    volumes:
      # Mount your local uploads directory
      - ./uploads:/app/uploads
      # Mount your local n8n workflows directory
      - ./n8n-data:/app/n8n-data
      
    depends_on:
      - mongo
      - qdrant
```

### 2. Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Port to run the server on | `4000` |
| `API_KEY` | Master key for server-to-server auth | `neurovision_secret_key` |
| `JWT_SECRET` | Secret for signing user tokens | `supersecretkey` |
| `MONGO_URI` | Connection string for MongoDB | `mongodb://mongo:27017/nvision` |
| `QDRANT_URL` | URL of the Qdrant instance | `http://qdrant:6333` |
| `N8N_API_KEY` | API Key from your n8n instance | - |
| `N8N_BASE_URL` | Base URL of your n8n instance | `http://localhost:5678` |
| `BACKEND_URL` | Public URL of this service (for file links) | `http://localhost:4000` |
| `UPLOADS_DIR` | Directory to store uploaded files | `/app/uploads` |
| `N8N_DATA_DIR` | Directory containing workflows to sync | `/app/n8n-data` |

---

## � API Endpoints

All endpoints require authentication. You can use either:
-   **Header:** `x-api-key: YOUR_API_KEY` (Server-to-Server)
-   **Header:** `Authorization: Bearer YOUR_JWT_TOKEN` (Client-Side)

### 🔐 Authentication
-   `POST /auth/register` - Register a new user
    -   Body: `{ "username": "...", "password": "..." }`
-   `POST /auth/login` - Login and get JWT token
    -   Body: `{ "username": "...", "password": "..." }`

### 💾 Database (MongoDB)
Universal CRUD endpoints for any collection.
-   `GET /api/:collection` - List items (supports filtering, sorting, pagination)
    -   Query: `?filter={"status":"active"}&sort={"createdAt":-1}&limit=10`
-   `GET /api/:collection/:id` - Get item by ID
-   `POST /api/:collection` - Create new item
-   `PUT /api/:collection/:id` - Update item
-   `DELETE /api/:collection/:id` - Delete item

### 🧠 Vector Database (Qdrant)
-   `POST /api/qdrant/upsert` - Store vectors
-   `POST /api/qdrant/search` - Search similar vectors

### 📂 File Uploads
-   `POST /api/uploads` - Upload file (Multipart Form)
-   `POST /api/uploads` - Upload from URL (JSON Body: `{ "image": "http...", "filename": "..." }`)
-   `GET /uploads/:filename` - Serve static files

---

## �🔄 Workflow Synchronization

The Hub can automatically sync your workflows and credentials from the mounted `n8n-data` volume to your running n8n instance.

### Directory Structure
Ensure your mounted volume follows this structure:
```
n8n-data/
├── workflows/
│   ├── my-workflow.json
│   └── ...
└── credentials/
    ├── my-creds.json
    └── ...
```

### Trigger Sync Manually
You can trigger a sync at any time using a simple CURL command:

```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  http://localhost:4000/api/n8n/sync
```

---

## 🛠️ Development

To run the Hub locally for development:

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Start in dev mode: `npm run dev`

---

**License:** MIT
