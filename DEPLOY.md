# Deployment

The stack runs as a single Docker Compose project: PostgreSQL, the Go API (which
also serves the built React site and uploaded files), and Caddy as the reverse
proxy. Caddy issues and renews Let's Encrypt certificates automatically, so HTTPS
needs no manual setup.

```
Internet ──HTTPS──▶ Caddy (:443) ──▶ Go api (:8090) ──▶ Postgres
                      │                  └ serves the React site + /uploads
                      └ also routes demo subdomains (e.g. snake.example.com)
```

## Requirements

A Linux server with a public IP and a domain whose DNS points at it. Ubuntu 24.04
is assumed below. Any small VPS runs the stack unchanged — for reference:

- **Oracle Cloud (Always Free)** — an Ampere A1 (ARM) instance, up to 4 cores /
  24 GB RAM. Signup requires a card for verification (not charged), and free ARM
  capacity can take a few "Create" retries. Open ports 80/443 in the Security
  List / VCN ingress rules, not only the OS firewall.
- **Hetzner Cloud** (~€4/mo) — a CX22.
- **DigitalOcean** ($6+/mo) — use the 2 GB droplet so the build doesn't run out
  of memory.

## 1. DNS

At the domain's DNS provider, add two A records pointing at the server's IP:

| Type | Name | Value     | Purpose                                            |
| ---- | ---- | --------- | -------------------------------------------------- |
| A    | `@`  | server IP | `example.com` → server                             |
| A    | `*`  | server IP | `anything.example.com` → server (demo subdomains)  |

The wildcard record resolves every `*.example.com` to the server, so demo
subdomains work without a record per demo. Propagation takes minutes to a few
hours; verify with `nslookup example.com`.

## 2. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
# optional firewall
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
```

## 3. Configure

```bash
git clone <repo-url> portfolio && cd portfolio
cp .env.example .env
```

Set at least the following in `.env`:

```ini
DOMAIN=example.com                    # real domain, no scheme
POSTGRES_PASSWORD=<long random>
JWT_SECRET=<long random>              # e.g. openssl rand -hex 32
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<strong password>
```

`CORS_ORIGIN` and `PUBLIC_BASE_URL` are derived from `DOMAIN` in Docker.

## 4. Launch

```bash
docker compose up -d --build
```

This builds the React site and Go binary, starts Postgres, runs migrations and
seeds categories, and starts Caddy. Caddy obtains the certificate on first boot.
The site is served at `https://example.com`; the admin panel is at `/admin/login`
using the configured `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

Common commands:

```bash
docker compose logs -f caddy   # cert issuance / routing
docker compose logs -f api     # backend logs
docker compose up -d --build   # redeploy after pulling new code
docker compose down            # stop (volumes retain data)
```

## Demo subdomains

Each `*.example.com` already resolves to the server via the wildcard record, so a
demo needs only a Caddy block; Caddy issues its certificate automatically.

A containerised demo — add it as a service in `docker-compose.yml` and route to it
by service name:

```caddy
snake.{$DOMAIN} {
    reverse_proxy snake-game:3000
}
```

A static or WASM build — mount the build into the Caddy container and serve it:

```caddy
snake.{$DOMAIN} {
    root * /srv/demos/snake
    file_server
    try_files {path} /index.html
}
```

After editing the `Caddyfile`, run `docker compose up -d`, then set the project's
demo URL in the admin to the new subdomain.

## Maintenance

- **Backups** — data lives in two Docker volumes, `pgdata` (database) and
  `uploads` (résumés, certs, images). Back them up periodically, e.g.
  `docker run --rm -v portfolio_pgdata:/v -v $PWD:/b alpine tar czf /b/db.tgz /v`.
- **Updates** — `git pull && docker compose up -d --build`.
- **`www`** — to redirect `www.example.com` to the apex, add a `www` A record and
  a Caddy block: `www.{$DOMAIN} { redir https://{$DOMAIN}{uri} permanent }`.

## PaaS alternative

The same Compose setup can run on a managed platform (Render, Railway, Fly.io)
with a managed Postgres add-on, pointing DNS at the platform hostname via CNAME.
This trades away straightforward control over arbitrary demo subdomains.
