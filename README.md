# DogEar

**Self-hosted personal library catalog.** Scan ISBN barcodes, track physical shelf locations, and manage who's borrowed your books.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

- 📷 **ISBN scanning** — point your phone camera at any barcode
- 🔍 **Title search** — look up books by name when you don't have the barcode
- 📚 **Rich metadata** — cover art, description, ratings, subjects, publisher, page count, pulled automatically from OpenLibrary and Google Books
- 🗂️ **Shelf tracking** — assign books to shelves with row and position
- 🤝 **Lending** — record checkouts with borrower name, contact info, and due date
- 📊 **Dashboard** — at-a-glance stats and recently added books

---

## Requirements

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- A home server, NAS, or any machine that stays on (Raspberry Pi works great)

---

## Installation

### 1. Clone the repo

```bash
git clone https://github.com/dashtink/dogear.git
cd dogear
```

### 2. Configure HTTPS

Camera access on mobile **requires HTTPS** — enforced by all browsers regardless of network. Set `DOGEAR_HOST` to tell Caddy how to issue your certificate. Create a `.env` file in the project root:

```bash
# Tailscale (recommended — zero cert setup if already on Tailscale)
DOGEAR_HOST=my-server.tail1234.ts.net

# Real domain (Let's Encrypt auto-cert — ports 80+443 must be open)
# DOGEAR_HOST=library.yourdomain.com

# Local IP / no domain — leave unset, see Option C below
```

---

#### Option A — Tailscale ⭐ recommended

If Tailscale is already running on your server and devices, this takes 2 minutes.

1. Enable HTTPS certificates in [Tailscale admin → DNS](https://login.tailscale.com/admin/dns) (one toggle)
2. Find your server's Tailscale hostname: `tailscale status | head -3`
3. Create `.env`:

```bash
echo "DOGEAR_HOST=my-server.tail1234.ts.net" > .env
```

Caddy fetches a trusted cert from Tailscale's ACME server automatically. Since your devices already trust Tailscale's CA, the cert is valid immediately — no installs, no warnings, camera works.

---

#### Option B — Real domain (Let's Encrypt)

```bash
echo "DOGEAR_HOST=library.yourdomain.com" > .env
```

Ensure ports 80 and 443 are open on your router/firewall. Caddy handles the rest.

---

#### Option C — Self-signed cert (local IP, no domain)

Leave `DOGEAR_HOST` unset. Caddy generates an internal CA. You install it once per device:

```bash
# After starting the stack:
docker compose cp caddy:/data/caddy/pki/authorities/local/root.crt ./caddy-root.crt
```

**iPhone/iPad:** AirDrop `caddy-root.crt` to yourself → open it → Settings → General → VPN & Device Management → Install → Settings → General → About → Certificate Trust Settings → enable the Caddy CA

**Android:** Transfer the file → Settings → Security → Encryption & credentials → Install a certificate → CA certificate

---

### 3. Start

```bash
docker compose up -d --build
```

On first start, database migrations run automatically. Check everything is up:

```bash
docker compose ps   # all services should show "healthy" or "running"
```

---

## Updating

### 1. Pull the latest code

```bash
git pull
```

### 2. Check the [CHANGELOG](./CHANGELOG.md) for any notes on the new version

### 3. Rebuild and restart

```bash
docker compose up -d --build
```

Database migrations run automatically on startup — no manual steps needed. Your data is preserved in the `pgdata` Docker volume.

### 4. Verify

```bash
docker compose ps        # all services: "healthy" or "running"
docker compose logs app  # look for "Ready" and migration output
```

---

## Usage

### Adding Books

Go to **Scan** in the bottom nav. Three methods:

| Method | When to use |
|---|---|
| **Camera** | Point your phone at the barcode on the back of the book |
| **Manual** | Type the ISBN (10 or 13 digits) when you can't scan |
| **Title Search** | Search by name when you don't have the book in front of you |

After lookup you'll see a preview card with the fetched metadata. Edit the title or author if needed, then tap **Add to Library**.

### Organizing with Shelves

1. Go to **Shelves** → **New Shelf** and give it a name (e.g. "Living Room Bookcase", "Bedroom")
2. On any book's detail page, tap **Assign Shelf** to set the shelf, row, and position

### Lending Books

1. Open the book's detail page → tap **Check Out**
2. Enter borrower name, optional contact, and optional due date
3. The book shows an orange "on loan" banner
4. Go to **Checkouts** to see all active loans — tap **Mark Returned** when the book comes back

### Searching the Library

On the **Library** page:
- Search box filters by title or author (debounced, updates as you type)
- Shelf dropdown shows books on a specific shelf
- **On Loan** button filters to only checked-out books

---

## Architecture

```
dogear/
├── src/
│   ├── app/
│   │   ├── api/          # REST API routes
│   │   │   ├── books/    # GET (search/filter), POST (add)
│   │   │   ├── books/[id]/  # GET, PATCH, DELETE + location assignment
│   │   │   ├── checkouts/   # GET, POST, PATCH (return)
│   │   │   ├── isbn/[isbn]/ # Metadata proxy
│   │   │   ├── search/      # Title search proxy (OpenLibrary)
│   │   │   └── shelves/     # GET, POST, PATCH, DELETE
│   │   ├── books/[id]/   # Book detail page
│   │   ├── library/      # Library grid
│   │   ├── scan/         # Scanner + title search
│   │   ├── shelves/      # Shelf management
│   │   └── checkouts/    # Loans and history
│   ├── components/
│   │   ├── scanner/      # BarcodeScanner (ZXing), ISBNInput
│   │   ├── books/        # BookCard
│   │   ├── shelves/      # ShelfAssignDialog
│   │   ├── checkouts/    # CheckoutForm
│   │   └── ui/           # shadcn/ui components
│   ├── db/
│   │   ├── schema.ts     # Drizzle table definitions + relations
│   │   └── migrations/   # Auto-generated SQL migrations
│   └── lib/
│       ├── isbn-lookup.ts  # OpenLibrary → Google Books fallback
│       └── validations.ts  # Zod schemas
├── Dockerfile            # Multi-stage Next.js standalone build
├── docker-compose.yml    # Postgres + App + Caddy
└── Caddyfile             # HTTPS reverse proxy config
```

**Stack:** Next.js 14 · TypeScript · PostgreSQL 16 · Drizzle ORM · Tailwind CSS · shadcn/ui · Caddy 2

---

## Development

```bash
# Install dependencies
npm install

# Start Postgres only
docker compose up db -d

# Copy env
cp .env.example .env.local

# Run migrations
npx drizzle-kit migrate

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To add a new database column: edit `src/db/schema.ts`, then run `npx drizzle-kit generate` to create the migration, and `npx drizzle-kit migrate` to apply it locally.

---

## License

MIT
