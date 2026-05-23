# Reviews Module

Reviews allows authenticated users to:
- submit one review per completed order,
- read paginated reviews for a technician.

## Base Path

`/api/reviews`

## Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/` | user | Create review for a completed order. |
| `GET` | `/technicians/:id` | user | List reviews for a technician (paginated). |

## Request/Response

### `POST /api/reviews`

Body:
- `order_id` (required UUID)
- `rating` (optional 1..5)
- `comment` (optional string)

Behavior:
- Order must exist and belong to the authenticated user.
- Order status must be `completed`.
- Duplicate review for same order returns conflict.

Response:
- `201 { data: <review row> }`

### `GET /api/reviews/technicians/:id`

Query:
- `limit` (optional)
- `offset` (optional)

Response:
- `200 { data: [{ id, rating, comment, created_at, reviewer_name }] }`

## Deployment Notes

Serverless routes must include both:
- `/api/reviews`
- `/api/reviews/{proxy+}`

This guarantees both root POST and nested GET paths are reachable through API Gateway.
