# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

# 1. Install a lightweight static server
RUN npm install -g serve

# 2. Copy the 'dist' folder (Vite default output)
COPY --from=builder /app/dist ./dist

# 3. Set Port
ENV PORT=8080
EXPOSE 8080

# 4. Start 'serve' and tell it to listen on 0.0.0.0 (required by Cloud Run)
# -s: Single page app mode (routes all requests to index.html)
# -l: Listen on the port provided by Cloud Run
CMD ["sh", "-c", "serve -s dist -l $PORT"]
