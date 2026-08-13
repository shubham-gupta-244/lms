FROM oven/bun:1.3.11-slim

WORKDIR /app

# Copy the whole monorepo — bun workspaces need the root package.json/lockfile
# plus every workspace's package.json to resolve dependencies correctly.
COPY . .

RUN bun install --frozen-lockfile

WORKDIR /app/apps/backend

ENV NODE_ENV=production
EXPOSE 4000

CMD ["bun", "run", "start"]
