# syntax=docker/dockerfile:1
# Builds the PDDL Playground (a separate public repo) and serves its static
# dist/ over an internal Caddy file server. The main Caddy reverse-proxies the
# subdomain to this container and handles public HTTPS.

# ---------- build the static site from GitHub ----------
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache git
# Cache-bust: when the repo's main branch moves, this file changes and the
# clone+build layers below re-run on the next `docker compose build`.
ADD https://api.github.com/repos/NijatSadigov/pddl-playground/commits/main /tmp/commit.json
# `npm install` (not `npm ci`): the playground's lock file can drift out of sync
# (e.g. missing @emnapi/*), and npm ci refuses to install then. install is lenient.
RUN git clone --depth 1 https://github.com/NijatSadigov/pddl-playground.git . \
 && npm install --no-audit --fund=false \
 && npm run build

# ---------- serve dist/ ----------
FROM caddy:2-alpine
COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80
