# Use Bun official image
FROM oven/bun:1-alpine AS base

WORKDIR /usr/src/app

# Install dependencies
COPY package.json ./
RUN bun install

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 7000

# Start the application without migrations
CMD ["bun", "run", "start"]
