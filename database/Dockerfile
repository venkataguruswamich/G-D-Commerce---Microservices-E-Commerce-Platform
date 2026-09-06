# syntax=docker/dockerfile:1
# Runs as a one-shot init container in docker-compose to apply migrations
# and (optionally) seed data before the application services start.
FROM node:22-alpine3.22 AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY migrate.js ./
COPY migrations ./migrations
COPY seeds ./seeds
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

USER node
CMD ["node", "migrate.js", "up"]
