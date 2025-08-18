# server/Dockerfile
FROM node:18-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Production dependencies stage
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine AS production
RUN apk add --no-cache curl

WORKDIR /app

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE $PORT

# Увеличиваем timeout для подключения к БД
ENV DB_CONNECTION_TIMEOUT=60000

# Убираем healthcheck чтобы не мешал запуску БД
# HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
#   CMD curl -f http://localhost:$PORT/api/health || exit 1

# Start the application
CMD ["npm", "start"]