FROM oven/bun:latest AS base

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy application source
COPY . .

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Expose HTTPS port (default for LAN Share)
EXPOSE 443

# Start server
CMD ["bun", "run", "server.ts"]
