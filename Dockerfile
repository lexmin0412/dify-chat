FROM node:22.21.1-alpine AS builder
WORKDIR /app

RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
RUN pnpm --filter dify-app-hub deploy --prod --legacy /deploy

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
