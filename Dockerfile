# Multi-stage build for production optimization
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=development
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application and source files for development
COPY --from=builder /app ./
COPY --from=deps /app/node_modules ./node_modules

# Create non-root user and fix permissions
RUN chown -R nextjs:nodejs /app

EXPOSE 5000
ENV PORT=5000

CMD ["npm", "run", "dev"]