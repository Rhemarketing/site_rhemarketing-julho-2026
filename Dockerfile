# ============================================================
# Dockerfile — EasyPanel (Hostinger VPS)
# Site: Patrick Mendes — Next.js 16 + Vite (vinext)
# ============================================================

# ---- Stage 1: Dependencies ----
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ---- Stage 2: Build ----
FROM node:22-alpine AS builder
WORKDIR /app

# Install bash (needed by build scripts)
RUN apk add --no-cache bash coreutils

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set env vars for the build (skip Wrangler/Cloudflare bindings)
ENV NODE_ENV=production
ENV WRANGLER_LOG_PATH=.wrangler/wrangler.log
ENV SITES_ENV_READY=1
ENV SITES_PROJECT_ROOT=/app

# Build with vinext directly (bypasses bash wrapper issues)
RUN npx vinext build

# ---- Stage 3: Production Runner ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built output and necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

# Start the production server
CMD ["npx", "vinext", "start"]
