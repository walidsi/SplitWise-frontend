# ... (Keep your Builder stage exactly the same)

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# 1. Copy the build folder
COPY --from=builder /app/build ./build
# 2. Copy package.json (some adapters need this for metadata)
COPY --from=builder /app/package*.json ./
# 3. Copy node_modules (required for the server to run)
COPY --from=builder /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production
# SvelteKit adapter-node specifically looks for these:
ENV PORT=8080
ENV HOST=0.0.0.0

# Expose port
EXPOSE 8080

# 4. Explicitly point to index.js
CMD ["node", "build/index.js"]
