# -----------------------------
# Stage 1: Build
# -----------------------------
FROM node:20-alpine AS builder

# Install dependencies for native modules (build time)
RUN apk add --no-cache libc6-compat openssl python3 make g++

WORKDIR /app

# Copy source code
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
RUN yarn build


# -----------------------------
# Stage 2: Production runtime
# -----------------------------
FROM node:20-alpine AS production

# Install only required runtime libs (không cần openssl-dev)
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copy built output từ builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Không cần cài lại yarn install nữa vì đã có node_modules từ build stage
# Nếu muốn thu nhỏ hơn nữa có thể cài prod deps riêng (yarn workspaces focus --production)

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Healthcheck → gọi endpoint HTTP thay vì script
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
