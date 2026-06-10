# Deploying the portfolio

You have a **domain** (from GoDaddy). A domain is just an address — it doesn't
run anything by itself. To put your site online you also need a **server** (a
small VPS) to run the app, and you point the domain at that server.

The whole stack runs with one command via Docker Compose. **Caddy** (included)
gives you **automatic HTTPS** (free Let's Encrypt certificates, auto-renewed) —
you never touch certificates.

```
Internet ──HTTPS──▶ Caddy (:443) ──▶ Go api (:8090) ──▶ Postgres
                      │                  └ serves the React site + /uploads
                      └ also routes demo subdomains (snake.yourdomain.com, …)
```

---

## Step 1 — Get a server (VPS)

Pick any cheap Linux VPS (~$4–6/month). Good options:

- **Hetzner Cloud** (cheapest, ~€4) — choose a CX22, **Ubuntu 24.04**
- **DigitalOcean** ($6 "Droplet") or **Linode / Vultr**

Create it with **Ubuntu 24.04**. You'll get a **public IP address** (e.g.
`203.0.113.10`) and SSH access. Note that IP — you need it next.

---

## Step 2 — Point your GoDaddy domain at the server

In GoDaddy: **My Products → your domain → DNS → Manage DNS / DNS Records**.

Add these **A records** (delete any conflicting default `@`/parking records):

| Type | Name | Value (Data)        | TTL   | What it does                    |
| ---- | ---- | ------------------- | ----- | ------------------------------- |
| A    | `@`  | your server IP      | 1 hr  | `yourdomain.com` → server       |
| A    | `*`  | your server IP      | 1 hr  | `anything.yourdomain.com` → server (for demo subdomains) |

> The `*` (wildcard) record is what makes the **subdomain-per-demo** idea work —
> every `something.yourdomain.com` resolves to your server, and Caddy decides
> what each one serves.

DNS changes can take a few minutes to a couple of hours to propagate. Check with
`nslookup yourdomain.com` — it should return your server IP.

---

## Step 3 — Install Docker on the server

SSH in (`ssh root@your-server-ip`) and run:

```bash
curl -fsSL https://get.docker.com | sh
# (optional) basic firewall
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
```

---

## Step 4 — Get the code and configure it

```bash
# put the project on the server (git clone, or scp/rsync it up)
git clone <your-repo-url> portfolio && cd portfolio

cp .env.example .env
nano .env
```

In `.env`, set **at minimum**:

```ini
DOMAIN=yourdomain.com                 # your real domain (no http://)
POSTGRES_PASSWORD=<long random>
JWT_SECRET=<long random string>       # e.g. `openssl rand -hex 32`
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=<a strong password>
```

`CORS_ORIGIN` and `PUBLIC_BASE_URL` are derived from `DOMAIN` automatically in
Docker — you don't need to touch them.

---

## Step 5 — Launch

```bash
docker compose up -d --build
```

That builds the React site, builds the Go binary, starts Postgres, runs database
migrations + seeds the categories, and starts Caddy. Caddy fetches an HTTPS cert
for your domain on first boot (give it ~30 seconds).

Visit **https://yourdomain.com** — you're live. 🎉

Log in at **https://yourdomain.com/admin/login** with your `ADMIN_EMAIL` /
`ADMIN_PASSWORD`, then fill in your content.

Useful commands:

```bash
docker compose logs -f caddy   # watch cert issuance / routing
docker compose logs -f api     # backend logs
docker compose up -d --build   # redeploy after pulling new code
docker compose down            # stop everything (data is kept in volumes)
```

---

## Adding project demos on subdomains

Goal: `snake.yourdomain.com` shows your Snake game, etc. Thanks to the `*` DNS
record (Step 2), the subdomain already points at your server — you just tell
Caddy what to serve and Caddy auto-issues its HTTPS cert.

There are two common shapes:

### A) The demo is its own app/container

Add the demo as a service in `docker-compose.yml`, then add a block to the
`Caddyfile`:

```caddy
snake.{$DOMAIN} {
    reverse_proxy snake-game:3000   # service name : its internal port
}
```

```bash
docker compose up -d   # picks up the new service + Caddy route
```

### B) The demo is a static / WASM build (e.g. a web or Unity game)

Put the build in a folder the Caddy container can see (e.g. mount
`./demos/snake` into the container at `/srv/demos/snake`), then:

```caddy
snake.{$DOMAIN} {
    root * /srv/demos/snake
    file_server
    try_files {path} /index.html
}
```

Either way: edit the `Caddyfile`, run `docker compose up -d`, done — HTTPS and
routing are automatic. In your portfolio admin, just set that project's **Demo
URL** to `https://snake.yourdomain.com`.

---

## Maintenance notes

- **Backups**: your data lives in two Docker volumes — `pgdata` (database) and
  `uploads` (résumés, certs, images). Back these up periodically
  (`docker run --rm -v portfolio_pgdata:/v -v $PWD:/b alpine tar czf /b/db.tgz /v`).
- **Updates**: `git pull && docker compose up -d --build`.
- **`www`**: if you want `www.yourdomain.com` too, add an A record for `www` and
  a redirect block in the `Caddyfile`:
  `www.{$DOMAIN} { redir https://{$DOMAIN}{uri} permanent }`.

---

## Simpler alternative (no VPS)

If you'd rather not manage a server, you can deploy the same Docker setup to a
PaaS like **Render**, **Railway**, or **Fly.io** with a managed Postgres add-on,
and point GoDaddy at their hostname with a CNAME. It's easier to start but gives
you less control over arbitrary demo subdomains — the VPS route above is the best
fit for your subdomain plan.
