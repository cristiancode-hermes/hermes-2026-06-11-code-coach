# API Reference

Base URL: `http://localhost:3000/api`

All responses are JSON. The API is documented via Swagger at `/api/docs` when running.

## Challenges

### List Challenges

```http
GET /challenges
```

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `difficulty` | string | No | Filter: `easy`, `medium`, `hard` |
| `category` | string | No | Filter by category (e.g., `algorithms`, `strings`) |

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "title": "Two Sum",
    "description": "Given an array of integers nums and an integer target...",
    "difficulty": "easy",
    "category": "algorithms",
    "starterCode": "function twoSum(nums, target) {\n  // Your code here\n}",
    "testCases": "[{\"input\":{\"nums\":[2,7,11,15],\"target\":9},\"expected\":[0,1]}]",
    "createdAt": "2026-06-11T01:30:00.000Z"
  }
]
```

### Get Challenge

```http
GET /challenges/:id
```

**Response `200 OK`:** Single challenge object (same shape as above).

**Response `404 Not Found`:**
```json
{ "message": "Challenge not found", "error": "Not Found", "statusCode": 404 }
```

### Create Challenge

```http
POST /challenges
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "FizzBuzz",
  "description": "Print numbers 1 to n, replacing multiples of 3 with Fizz, 5 with Buzz...",
  "difficulty": "easy",
  "category": "algorithms",
  "starterCode": "function fizzBuzz(n) {\n  // Your code here\n}"
}
```

**Response `201 Created`:** Created challenge object.

**Validation Errors `400 Bad Request`:**
```json
{
  "message": ["title must be a string", "title should not be empty"],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Update Challenge

```http
PUT /challenges/:id
Content-Type: application/json
```

**Request Body:** Partial challenge fields.

**Response `200 OK`:** Updated challenge object.

### Delete Challenge

```http
DELETE /challenges/:id
```

**Response `200 OK`:**
```json
{ "message": "Challenge deleted successfully" }
```

---

## Submissions

### Submit Solution

```http
POST /challenges/:challengeId/submissions
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "function twoSum(nums, target) {\n  const map = {};\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (complement in map) return [map[complement], i];\n    map[nums[i]] = i;\n  }\n  return [];\n}",
  "language": "javascript"
}
```

**Response `201 Created`:**
```json
{
  "id": 1,
  "challengeId": 1,
  "code": "function twoSum(nums, target) { ... }",
  "language": "javascript",
  "status": "analyzed",
  "resultAnalysis": {
    "linesOfCode": 9,
    "functionCount": 1,
    "loopCount": 1,
    "conditionalCount": 2,
    "language": "javascript",
    "qualityScore": 8,
    "suggestions": [
      "Remove console.log statements in production code."
    ]
  },
  "submittedAt": "2026-06-11T01:35:00.000Z"
}
```

### List Submissions for Challenge

```http
GET /challenges/:challengeId/submissions
```

**Response `200 OK`:** Array of submission objects with analysis results.

### Get Submission

```http
GET /submissions/:id
```

**Response `200 OK`:** Single submission object with full analysis.

---

## Health Check

### Swagger UI

```
GET /api/docs
```

Interactive OpenAPI documentation page for exploring and testing all endpoints.
