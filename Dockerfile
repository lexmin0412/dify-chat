FROM node:22.21.1-alpine AS builder
WORKDIR /app

SHELL ["/bin/sh", "-exc"]

RUN corepack enable && echo "[OK] corepack"
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN echo "[BUILD] installing deps..." && pnpm install --frozen-lockfile && echo "[OK] deps installed"
COPY . .
RUN echo "[BUILD] next build..." && pnpm build 2>&1 && echo "[OK] next build"
RUN rm -rf .next/standalone/node_modules && echo "[OK] removed standalone node_modules"
RUN echo "[BUILD] pnpm deploy..." && pnpm --filter dify-app-hub deploy --prod --legacy /deploy 2>&1 && echo "[OK] deploy"

FROM node:22.21.1-alpine AS runner
WORKDIR /app

COPY --from=builder /deploy ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/db ./db
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY docker/entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=5300
EXPOSE 5300
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]
