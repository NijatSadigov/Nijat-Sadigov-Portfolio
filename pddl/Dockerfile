# syntax=docker/dockerfile:1

# ---------- build the static site from GitHub ----------
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache git
ADD https://api.github.com/repos/NijatSadigov/pddl-playground/commits/main /tmp/commit.json
RUN git clone --depth 1 https://github.com/NijatSadigov/pddl-playground.git . \
 && npm install --no-audit --fund=false \
 && npm run build

# ---------- serve dist/ ----------
FROM caddy:2-alpine
COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80
