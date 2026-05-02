---
name: fixit-diagnose
description: >
  Diagnose a home maintenance problem from text, image, or audio input.
  Categorize the issue into one of the 10 FixIt service categories and
  call the FixIt Recommendation API to find the best available technician.
  Returns a structured service order JSON.
tools:
  - http_request
---

## FixIt Diagnostic Skill

### When to Use
Use this skill when a user describes a home maintenance problem and wants
to be connected with a technician. The user may provide:
- A text description of the problem
- A photo of the damage or issue
- An audio message describing the problem
- Their GPS coordinates (latitude/longitude)
- Their user ID (optional)

### Step-by-Step Workflow

1. **Parse the user's input**:
   - Extract the problem description from text, image analysis, or audio.
   - Extract GPS coordinates (latitude, longitude) if provided.
   - Extract user ID if provided.

2. **Diagnose and categorize**:
   - Identify the root cause of the problem.
   - Map it to one of these categories:
     `plumbing`, `electrical`, `carpentry`, `home cleaning`,
     `air condition`, `painter`, `dish`, `oven/cooker`,
     `fridge/freezer`, `fan`

3. **Check required fields**:
   - If latitude/longitude are missing, ask the user for their location.
   - If the problem is unclear, ask for clarification.

4. **Call the FixIt Recommendation API**:
   Use the `http_request` tool with these parameters:
   ```
   URL: POST http://localhost:8000/api/recommend
   Headers: Content-Type: application/json
   Body:
   {
     "problem_description": "<your detailed diagnosis>",
     "latitude": <lat>,
     "longitude": <lon>,
     "user_id": <id or null>,
     "radius_km": 10,
     "top_k": 3
   }
   ```

5. **Compile the service order**:
   - Select the top-ranked technician from the API response.
   - Estimate severity (low/medium/high).
   - Calculate cost range using the technician's hourly rate.
   - Return the structured `service_order` JSON as defined in IDENTITY.md.

### Error Handling
- If the API returns 404 (no technicians found), inform the user and
  suggest expanding the search radius.
- If the API returns 503 (engine not ready), ask the user to wait and retry.
- If the API is unreachable, inform the user of a temporary service issue.

### Example

**User**: "My kitchen faucet has been dripping for 3 days. I'm at
lat 30.0444, lon 31.2357. User ID 42."

**Expected API call**:
```json
{
  "problem_description": "Kitchen faucet dripping continuously for 3 days, likely worn washer or valve — plumbing issue",
  "latitude": 30.0444,
  "longitude": 31.2357,
  "user_id": 42,
  "radius_km": 10,
  "top_k": 3
}
```
