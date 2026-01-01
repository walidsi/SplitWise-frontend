# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .

# In SvelteKit, VITE_ variables must be available during build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Copy the build output from SvelteKit's specific directory
# adapter-node puts the standalone server in 'build' by default
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Cloud Run environment variables
ENV NODE_ENV=production
ENV PORT=8080

# SvelteKit adapter-node uses these env vars to determine port/host
ENV HOST=0.0.0.0

EXPOSE 8080

# Start the SvelteKit server
CMD ["node", "build"]
