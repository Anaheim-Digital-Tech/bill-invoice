FROM node:20-alpine AS base

# ── deps ──────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY .yarn/releases ./.yarn/releases
COPY package.json yarn.lock .yarnrc.yml ./
RUN node .yarn/releases/yarn-4.15.0.cjs install --frozen-lockfile

# ── builder ───────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV MONGODB_URI=build_placeholder
ENV APP_PASSWORD=build_placeholder
RUN node .yarn/releases/yarn-4.15.0.cjs build

# ── runner ────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
