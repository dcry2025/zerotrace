# Multi-stage build for zerotrace client (SvelteKit) with Bun

# Stage 1: Build
FROM oven/bun:1.1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies with Bun
RUN bun install

# Copy source files
COPY . .

# Copy .env file if it exists
COPY .env* ./

# Build the application with Bun
RUN bun run build

# Stage 2: Production
FROM oven/bun:1.1-alpine AS runner

WORKDIR /app

# Set environment
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy built application
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./

# Install only production dependencies
RUN bun install --production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start the application with Bun
CMD ["bun", "run", "start"]

