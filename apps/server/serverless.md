# FixIt Serverless Backend (serverless.yml Overview)

This backend uses the [Serverless Framework](https://www.serverless.com/) to deploy Node.js functions to AWS Lambda. The configuration is managed in `serverless.yml`.

---

## Key Points from `serverless.yml`

### 1. Service & Organization

- **org:** `fixit11`  
  Associates this project with your Serverless Framework account.
- **service:** `FixIt`  
  The name for your deployed service and AWS resources.

### 2. Build Configuration

- Uses **esbuild** for fast, modern JavaScript/TypeScript bundling.
- Targets **Node.js 20.x** runtime.
- Excludes `@supabase/supabase-js` from the bundle (provided at runtime).

### 3. Provider

- **AWS Lambda** is the cloud provider.
- **Region:** `eu-north-1` (Stockholm)
- **Runtime:** `nodejs20.x`
- **Stage:** `dev` (can be changed for production)
- **Environment Variables:**  
  Reads sensitive keys from your `.env` file:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_CONNECTION_STRING`

### 4. Functions

- **api:**
  - Handler: `src/lambda.handler`
  - Event: Handles all HTTP API requests (`httpApi: "*"`)

### 5. Deployment

- Deploy with:

  ```bash
  serverless deploy
  ```

  or

  ```bash
  sls deploy
  ```

- After deployment, the endpoint URL will be shown in your terminal.

### 6. Custom Domain (Optional)

- You can set up a custom domain by uncommenting and editing the `domain:` line.

---

## Quick Setup Steps

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Install Serverless CLI (if not already):**

   ```bash
   npm install -g serverless
   ```

3. **Configure AWS credentials:**

   ```bash
   aws configure
   ```

4. **Create a `.env` file** with your Supabase credentials.

5. **Deploy:**
   ```bash
   serverless deploy
   ```

---

## Useful Links

- [Serverless Framework Docs](https://www.serverless.com/framework/docs/)
- [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)

---
