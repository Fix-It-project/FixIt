FROM node:20-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --production

# Copy application source
COPY fixit-diagnose-server.js .
COPY ollama-client.js .

# Expose the fallback server port
EXPOSE 3001

# Run the server
CMD ["node", "fixit-diagnose-server.js"]
