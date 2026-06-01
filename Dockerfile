FROM node:22.21.1-alpine AS builder
WORKDIR /app

RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
# standalone 的 node_modules 只有 3 个 pnpm symlink，会覆盖 deploy 的完整依赖
RUN rm -rf .next/standalone/node_modules
RUN pnpm --filter dify-app-hub deploy --prod /deploy

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
