# syntax=docker/dockerfile:1
FROM node:22-alpine3.22 AS builder
WORKDIR /app
RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY . .
ARG VITE_API_BASE_URL=http://localhost:3000/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# nginx-unprivileged runs entirely as a non-root user (uid 101) and listens
# on 8080 by default, avoiding the need for root to bind a privileged port.
FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime
USER root
RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
