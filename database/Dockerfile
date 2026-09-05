# syntax=docker/dockerfile:1
# Runs as a one-shot init container in docker-compose to apply migrations
# and (optionally) seed data before the application services start.
FROM node:20.15.1-alpine3.19 AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY migrate.js ./
COPY migrations ./migrations
COPY seeds ./seeds

USER node
CMD ["node", "migrate.js", "up"]
