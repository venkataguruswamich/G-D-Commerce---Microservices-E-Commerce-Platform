# syntax=docker/dockerfile:1
FROM node:22-alpine3.22 AS deps
WORKDIR /app
RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

FROM node:22-alpine3.22 AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

USER node
EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "src/server.js"]
