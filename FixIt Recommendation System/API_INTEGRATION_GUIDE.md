# FixIt Recommendation System — API Integration Guide

> **For the Node.js backend team**
> This Python microservice provides AI-powered technician recommendations via REST API.

---

## Quick Start

### Option 1: Run Locally
```bash
# Install dependencies
pip install -r requirements.txt

# Start the API server
python run.py
# → Server starts at http://localhost:8000
# → Swagger docs at http://localhost:8000/docs
```

### Option 2: Docker
```bash
docker build -t fixit-recommendation .
docker run -p 8000:8000 fixit-recommendation
```

---

## API Endpoints

### `GET /health` — Health Check
Use this to verify the service is running before sending requests.

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "engines": {
    "database": true,
    "data_pipeline": true,
    "content_engine": true,
    "collaborative_engine": true,
    "hybrid_engine": true
  },
  "data": {
    "users": 500,
    "technicians": 100,
    "bookings": 3000
  }
}
```

---

### `POST /api/recommend` — Get Recommendations

This is the main endpoint. Send the user's problem and location, get ranked technicians back.

**Request Body:**
```json
{
  "user_id": 42,
  "problem_description": "My kitchen sink is leaking continuously",
  "latitude": 30.06,
  "longitude": 31.32,
  "radius_km": 10,
  "top_k": 5
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `user_id` | `int \| null` | No | `null` | Pass the user's ID for personalized results. Omit or pass `null` for anonymous/cold-start. |
| `problem_description` | `string` | **Yes** | — | Free-text description of the problem (5-1000 chars). |
| `latitude` | `float` | **Yes** | — | User's latitude (WGS-84). |
| `longitude` | `float` | **Yes** | — | User's longitude (WGS-84). |
| `radius_km` | `float` | No | `10.0` | Search radius in km (max 100). |
| `top_k` | `int` | No | `5` | Number of results to return (1-20). |

**Response (200 OK):**
```json
{
  "user_id": 42,
  "is_cold_start": false,
  "engine_used": "hybrid_content_leaning",
  "recommendations": [
    {
      "technician_id": 17,
      "name": "أحمد محمد",
      "category": "Plumbing",
      "match_score": 0.8234,
      "distance_km": 2.15,
      "market_trust_score": 0.8712,
      "base_hourly_rate": 250
    },
    {
      "technician_id": 53,
      "name": "محمد علي",
      "category": "Plumbing",
      "match_score": 0.7891,
      "distance_km": 3.42,
      "market_trust_score": 0.7654,
      "base_hourly_rate": 180
    }
  ]
}
```

| Field | Description |
|-------|-------------|
| `is_cold_start` | `true` if user has < 3 bookings (uses content-based filtering). |
| `engine_used` | `"content_based"`, `"hybrid_content_leaning"`, or `"hybrid_collaborative_leaning"`. |
| `match_score` | Confidence score 0-1 (higher = better match). |
| `distance_km` | Straight-line distance from user to technician. |
| `market_trust_score` | Reliability score based on completion rate, ratings, and volume. |

**Error Responses:**
- `404` — No technicians found within search radius.
- `422` — Invalid request body (Pydantic validation).
- `503` — Engine not yet initialized (server still starting up).

---

## Node.js Integration Example

```javascript
// Using axios in your Node.js backend
const axios = require('axios');

const RECOMMENDATION_API = process.env.RECOMMENDATION_API_URL || 'http://localhost:8000';

async function getRecommendations(userId, problemDescription, latitude, longitude) {
  try {
    const response = await axios.post(`${RECOMMENDATION_API}/api/recommend`, {
      user_id: userId,          // null for anonymous users
      problem_description: problemDescription,
      latitude: latitude,
      longitude: longitude,
      radius_km: 10,
      top_k: 5
    });

    return response.data; // { user_id, is_cold_start, engine_used, recommendations }
  } catch (error) {
    if (error.response?.status === 404) {
      return { recommendations: [], message: 'No technicians nearby' };
    }
    throw error;
  }
}

// Example usage in an Express route
app.post('/api/bookings/find-technician', async (req, res) => {
  const { userId, problemDescription, lat, lng } = req.body;

  const result = await getRecommendations(userId, problemDescription, lat, lng);

  res.json({
    technicians: result.recommendations,
    engine: result.engine_used,
    isColdStart: result.is_cold_start
  });
});
```

---

## Architecture

```
[React Native App]
        │
        ▼
[Node.js Backend] ──── HTTP POST ────► [Python FastAPI: Recommendation Service]
        │                                       │
        ▼                                       ▼
   [PostgreSQL]                          [SQLite / PostgreSQL]
   (main app DB)                         (recommendation data)
```

The recommendation service runs as an **independent microservice**. The Node.js backend calls it via HTTP whenever it needs technician recommendations.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///fixit.db` | Database connection string |
| `HOST` | `0.0.0.0` | Server bind address |
| `PORT` | `8000` | Server port |

---

## Interactive API Docs

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs` — interactive testing
- **ReDoc**: `http://localhost:8000/redoc` — clean read-only docs
