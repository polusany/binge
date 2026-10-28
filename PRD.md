# Binge — Product Requirements Document

**Version:** 2.0 — implemented product baseline  
**Updated:** 22 October 2026  
**Administrator:** BINGERET  
**Status:** Working local application. Render deployment configuration prepared; public deployment not confirmed.

## 1. Product overview

Binge is a responsive entertainment and reading website. Visitors discover movies and series, watch videos, download movies or individual episodes, and read/download books and stories. BINGERET manages the catalog, uploaded files, posters, visitors records, IP blocks, public notices and official social accounts through a protected dashboard.

This document replaces the original static-starter PRD. It records implemented functionality, the technologies used, operating limits and remaining launch checks. Future features are identified separately.

### Objectives

- Combine video entertainment and reading in one website.
- Display a series once in the public catalog, with seasons and episodes beneath it.
- Let BINGERET publish, edit and moderate without changing source code.
- Support clear phone and desktop navigation, playback and downloads.
- Preserve media, settings and records across restarts.
- Prepare a documented, recoverable Render deployment.

## 2. Users and permissions

| Role | Capabilities |
| --- | --- |
| Public visitor | Browse, search, filter, sort, watch/download published media, read/download books, see notices and follow social links. |
| BINGERET | Sign in/out; manage all content; inspect/delete visitor logs; block/unblock IPs; publish notices and social accounts. |
| Deployment operator | Configure secrets and hosting, maintain storage, back up/restore data, reset passwords and run offline cleanup. |

Visitors do not need accounts. There is one administrator identity: **BINGERET**. Public registration and multiple administrator roles are not implemented.

## 3. Public pages

| Page | Route |
| --- | --- |
| Home / full collection | `/` or `/index.html` |
| K-Dramas | `/pages/k-dramas.html` |
| Chinese Dramas | `/pages/chinese-dramas.html` |
| Hollywood Movies | `/pages/hollywood-movies.html` |
| Anime Series | `/pages/anime-series.html` |
| Bollywood Movies | `/pages/bollywood-movies.html` |
| Nollywood Movies | `/pages/nollywood-movies.html` |
| Movies | `/pages/movies.html` |
| Genres | `/pages/genres.html` |
| TV Series | `/pages/tv-series.html` |
| Philippine Dramas | `/pages/philippine-dramas.html` |
| Thai Movies | `/pages/thai-movies.html` |
| Japanese Dramas | `/pages/japanese-dramas.html` |
| Books & Stories | `/books.html` |
| Privacy | `/privacy.html` |
| BINGERET Admin | `/admin` or `/admin.html` |

### Public navigation

- Desktop shows category navigation and no hamburger.
- At widths of **767 CSS pixels or less**, a hamburger opens the phone menu.
- The phone header places the logo/menu on the first row and search beneath them. The menu button is 44 pixels square.
- Phone navigation includes all categories and Books & Stories.
- Returning to desktop width closes an open phone menu.
- Admin links are absent from public navigation. Direct admin access still requires authentication; hiding a link is not the security mechanism.

## 4. Catalog discovery

Visitors search the current collection by title and associated genre, format, year or description. They can filter by genre and sort by Featured, Title A–Z or Newest year. The Genres page lists genre counts and applies the chosen filter. Empty results show a clear-filter action.

Catalog cards show a poster, title, year, genre and format. Series cards show season/episode totals. Opening a title displays its synopsis and media controls.

The title count counts grouped series once. Public movie/series pages refresh their server snapshot on focus, visibility changes, relevant cross-tab updates and a visible-page interval of approximately **15 seconds**. Replacing the previous snapshot avoids duplicate cards and reflects edits/deletions.

Fictional starter titles are hidden by default. An operator may enable them with `BINGE_SHOW_DEMO=1`; those titles do not include supplied licensed videos.

## 5. Series, seasons and episodes

### Public hierarchy

```text
Series title — one catalog card
  Season 1
    Episode 1 — Watch / Download
    Episode 2 — Watch / Download
  Season 2
    Episode 1 — Watch / Download
```

`catalog.js` groups uploaded series by normalized title and collection. Normalization trims/normalizes whitespace, normalizes Unicode and compares titles without case differences. Seasons and episodes sort numerically. Standalone movies remain separate cards.

Opening a series displays one title, poster, synopsis and summary; a selected-episode player; expandable season sections; and Watch/Download controls for every episode. Selecting another episode changes the video source, current label and download target. The active episode is highlighted. Closing the dialog pauses playback.

The episode files remain individual database records and uploads. Grouping changes presentation, not the stored files. BINGERET can still edit individual episodes.

The user's Nkiri reference informed the season-heading/episode-link arrangement, while Binge retained its own design: [reference layout](https://thenkiri.com/the-manipulated-s01-complete-korean-drama/).

### Upload workflow

1. BINGERET selects **Upload series episodes**.
2. Enters common title, description, collection, genre, year, season and optional poster.
3. Selects multiple episode files together, or uses individual episode file rows.
4. The count fills automatically; filenames sort using numeric-aware ordering.
5. Reviews episode numbers and publishes the batch.

Requirements:

- Season and episode numbers must be integers from **1 to 9,999**.
- Count/first-number changes update upload rows; retained rows preserve their selected files. Removing extra selected rows requires confirmation.
- Each file uploads and saves sequentially, with progress messages.
- A partial failure can be retried while the page stays open. Completed rows and successfully uploaded files are retained where possible.
- **Add episodes** preloads an existing series and starts after the highest episode number in the selected season.
- The server rejects duplicate title/collection/season/episode combinations.
- Repeating a save for an already-associated upload returns the existing record rather than another entry.

Large seasons should use smaller batches to keep the browser responsive. Cross-device upload resumption is not implemented.

## 6. Playback and downloads

- Native browser HTML video controls support playback.
- Server responses support byte-range requests and HEAD requests for compatible seeking/download behavior.
- Movies and each episode have explicit download links.
- Attachment filenames are readable and include series season/episode identifiers.
- Files save to the browser/device's configured location, commonly Downloads. Binge cannot silently choose a person's Desktop or phone storage folder.
- Published content does not require a visitor account, unless access is blocked by IP.
- Videos must use browser-compatible encoding. Binge does not transcode them.
- Real-device playback and hosted large-file transfers remain launch checks.

## 7. Books and stories

BINGERET can publish PDF or TXT files as Book or Story entries, with title, author, genre, year, description and optional poster. Public cards provide Read and Download actions.

- Search covers title, author and genre.
- Filters select Books, Stories or All.
- TXT opens as text in the reader.
- PDF uses browser PDF display and includes a separate open-PDF link.
- The library fetches its catalog on page load; it does not currently use the movie catalog's continuous polling.

## 8. Administrator authentication

- Username is **BINGERET**.
- A new password must contain at least **12 characters**.
- Local first startup can prompt for a password. Unattended production startup requires `BINGE_ADMIN_PASSWORD` when initializing a new database.
- Passwords use salted **PBKDF2-HMAC-SHA256 with 300,000 iterations**.
- Successful login creates a random token; the database stores its SHA-256 hash.
- Cookies are HttpOnly and SameSite=Strict; Secure is enabled in production.
- Sessions last **eight hours** and persist across restarts until expiry, logout or reset.
- Ten failed attempts per IP in 15 minutes trigger a temporary login limit.
- Password reset revokes stored sessions.
- Changing the bootstrap environment password does not overwrite an existing database password.

## 9. Desktop and phone admin layout

Desktop shows content totals, content management, notices/social settings, visitors records and blocked visitors. The dashboard includes public-site preview and sign-out actions.

On phones, a signed-in hamburger menu offers:

1. Videos, books & stories.
2. Notice board.
3. Official social accounts.
4. Visitors record.
5. Blocked visitors.

Selecting a section shows it on its own. The drawer highlights the active section and closes after selection. It includes sign-out and a public-site link. It is hidden before login and after logout. Desktop continues to show all dashboard panels.

## 10. Content management

| Field | Rule |
| --- | --- |
| Kind | Video, Book or Story. |
| Title | Required, up to 200 characters. |
| Description | Up to 10,000 characters stored. |
| Genre | Up to 60 characters stored. |
| Year | Integer from 1888 to 2200. |
| Author | Optional, up to 200 characters stored. |
| Format | Movie or Series for video presentation. |
| Collection | One of the supported collections. |
| Season / episode | Required positive integers for series. |
| Main file | Supported video, PDF or TXT according to kind. |
| Poster | Optional JPG/JPEG, PNG or WebP. |

BINGERET can search uploaded content by title, author, genre, season or episode; filter by kind; see thumbnails and result counts; preview a file; and choose **Edit details**.

The editor preloads existing values and identifies the current upload. Metadata can be saved without choosing another file, retaining the record ID and original media. Selecting a new file replaces that upload. Posters can be previewed, replaced or removed. Deleting content requires confirmation.

Unused replaced/deleted files are removed. A poster still referenced by another episode is preserved. Editing a video means editing its details or replacing its file; timeline trimming/rendering is outside scope.

## 11. Visitors records

Public HTML requests record an IP address, page path and UTC timestamp. This is a page-access log, not a unique-person counter, viewing-history tracker or reliable individual identity.

- Latest **1,000** records displayed.
- Up to **10,000** retained records.
- Entries older than **30 days** removed when public pages or the log are accessed; cleanup is access-triggered, not a scheduled job.
- Local testing normally records a loopback IP.
- On Render, the edge-provided `CF-Connecting-IP` is used. Outside Render, forwarding is ignored unless `BINGE_TRUSTED_PROXY` matches the connecting proxy.

### Visitor actions

| Option | Effect |
| --- | --- |
| Delete this visitor | Deletes all visit records for the selected IP. Does not prevent future visits. |
| Delete this record | Deletes only the selected row. |
| Block this visitor | Opens a separate blocking confirmation. |
| Cancel | Closes without changing records. |

A separate action clears all visit records after confirmation.

## 12. Blocking and unblocking

The blocking warning states: **This action will block this visitor's IP address from future visits to the website.** It offers Confirm block or Cancel and explains that people sharing an IP are also affected.

- Blocks persist in the database across restarts.
- Blocked IPs receive HTTP 403 for public pages, catalog APIs, media and admin access.
- `/healthz` remains available for platform monitoring.
- Deleting visit records does not remove a block.
- BINGERET can inspect the Blocked visitors list and confirm an unblock action.
- Blocking the current admin IP through this action is rejected to avoid accidental lockout.
- Blocks are IP-based, not device/account bans. Someone using another IP may return.

## 13. Notices and official social accounts

### Notice board

BINGERET can write a notice title up to **120 characters**, a message up to **2,000 characters**, preview it, toggle its visibility and publish. An enabled notice requires a message. The public notice panel appears near the top of public pages and renders plain text, including line breaks, rather than executable HTML.

The implementation supports one active notice, not a scheduled archive of multiple notices.

### Social accounts

Supported platforms are **Telegram, TikTok, X, Instagram, YouTube, Facebook and WhatsApp**.

- Enter a handle or a full HTTPS profile URL.
- WhatsApp accepts a number with country code or a supported HTTPS link.
- A public section heading can contain up to 140 characters.
- Handles normalize to profile URLs.
- URLs must belong to the corresponding platform; unrelated hosts and unsupported schemes are rejected.
- Empty accounts produce no public card.
- Cards use platform labels, simple icons, follow/contact text and an external-link indicator.
- External links use noopener/noreferrer protection.
- The integration does not log into platforms, post messages, verify account ownership or fetch followers.

Settings persist across restarts. Public notices/social links refresh on focus, visibility changes, cross-tab publishing and a visible-page interval of approximately **30 seconds**.

## 14. Visual design and accessibility

| Element | Implementation |
| --- | --- |
| Main background | Dark green `#0d2119`. |
| Primary green | `#12382a`. |
| Gold accents | `#d9b85c` and `#eed991`. |
| Primary text | Off-white `#f5f6ef`. |
| Interface type | Inter if available locally, then system sans-serif fonts. |
| Display headings | Georgia/serif. |
| Layout | Responsive CSS Grid, Flexbox, variables and media queries. |

Catalog presentation is poster-led. Notices/social cards use the same visual system. Decorative gold dashes before heading labels have been removed. Forms include labels, progress/status messages and empty states. Native dialogs, visible focus styles and an inert closed public menu support keyboard use.

No external font service, UI framework or third-party analytics script is required. A formal accessibility and real-browser layout audit is still a launch check.

## 15. Technology stack — what we used

| Layer | Technology |
| --- | --- |
| Page structure | HTML5. |
| Styling | Custom CSS3, CSS Grid, Flexbox, responsive media queries and CSS variables. |
| Browser application | Vanilla JavaScript, Fetch API, native dialogs, HTML video and browser PDF support. |
| Backend | Python and Flask. |
| Production server | Waitress, one process with eight configured threads. |
| Development server | Flask development mode; automatic Python reload; interactive debugger disabled. |
| Database | SQLite through Python sqlite3, with WAL journal mode. |
| Media storage | Files in the configured data directory; a persistent disk for Render. |
| Password/token utilities | Python hashlib, hmac and secrets. |
| Tests | Python unittest, Flask test clients, Node.js syntax checks and custom JavaScript behavior checks. |
| Editor/workflow | VS Code, Python virtual environments, pip, launch configuration and Windows launch scripts. |
| Hosting preparation | Render Blueprint YAML, environment example, pinned requirements and deployment guide. |

Node.js is used for development checks, not as the deployed application server. Render's Python version file specifies **3.14.3**; local work has used **3.14.6**. The documented local baseline is Python 3.10+ with compatible dependencies.

### Pinned dependencies

| Package | Version | Use |
| --- | --- | --- |
| Flask | 3.1.3 | Framework/routing. |
| waitress | 3.0.2 | Production WSGI server. |
| Werkzeug | 3.1.9 | Flask HTTP and file-response utilities. |
| Jinja2 | 3.1.6 | Flask dependency; principal pages are HTML/JS, not a Jinja-template application. |
| MarkupSafe | 3.0.4 | Template/escaping dependency. |
| itsdangerous | 2.2.0 | Flask dependency; Binge uses its own database token-session flow. |
| click | 8.5.0 | Flask CLI dependency. |
| blinker | 1.9.0 | Flask signal dependency. |

React, Next.js, Django, Laravel, PHP, Postgres, MongoDB, object storage and external authentication providers are not part of the current build.

## 16. Architecture and data model

```text
Browser: HTML + CSS + JavaScript
  → Flask routes / protected admin actions
  → SQLite records and settings
  → uploads/: individual media files

Local: app.py → Flask → localhost:5001
Production: server.py → Waitress → Flask
Planned host: Render HTTPS endpoint → Python service + persistent disk
```

| Table | Stored fields/purpose |
| --- | --- |
| content | id, kind, title, description, genre, section, format, year, author, file, extension, poster_file, season, episode. |
| settings | Key/value storage: password hash and notice/social JSON. |
| sessions | Hashed token and expiry. |
| login_attempts | IP and timestamp for temporary rate limiting. |
| visits | ID, IP, path and timestamp. |
| blocked_visitors | ID, unique IP and block timestamp. |

Series/seasons do not have dedicated tables. Individual episode records are grouped for public display. Existing databases are migrated to add missing poster/season/episode fields without discarding content.

## 17. Source files and tools

| File | Responsibility |
| --- | --- |
| app.py | Local Flask development entry point. |
| server.py | Production entry point and virtual-environment fallback. |
| production.py | App factory, migrations, APIs, auth, validation and file serving. |
| app.js | Public shell, categories, search/filter/sort, refresh and player dialogs. |
| catalog.js | Series grouping and season/episode markup. |
| episode-upload.js | Episode validation and sequential publishing/retry state. |
| admin.html / admin.js | Dashboard, editing, content and visitor actions. |
| admin-nav.js | Phone admin drawer and section selection. |
| site-settings.js | Admin notices/social editor and preview. |
| updates.js | Public notices and social cards. |
| books.html / books.js | Reading library and reader. |
| styles.css / manage.css | Public/admin visual and responsive styles. |
| pages/ | Category pages. |
| privacy.html | Public privacy explanation. |
| favicon.svg / robots.txt | Site icon and crawler guidance. |
| maintenance.py | Offline backups, orphan cleanup and password reset. |
| test_release.py | Backend regression tests. |
| .vscode/launch.json | VS Code local run configuration. |
| START-DEV.bat / START.bat | Windows development/production-mode launchers. |
| requirements.txt / .python-version | Dependencies and hosted Python version. |
| render.yaml / .env.example | Render configuration and environment example. |
| README.md / DEPLOY-RENDER.md / PRD.md | Startup, deployment and requirements documentation. |

VS Code is the editing environment. Python virtual environments isolate dependencies; pip installs the pinned packages. Git/GitHub is the documented repository-to-Render publishing workflow, not proof that a repository or hosted deployment has already been created.

## 18. API inventory

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/healthz` | Health check. |
| GET | `/api/config` | Public display/upload configuration. |
| GET | `/api/site-settings` | Public notice/social data. |
| POST | `/api/site-settings` | Admin publishes notice/social settings. |
| GET | `/api/session` | Current authentication state. |
| POST | `/api/login` | BINGERET login. |
| POST | `/api/logout` | Revoke admin session. |
| GET | `/api/content` | Published catalog records. |
| POST | `/api/upload` | Admin file upload. |
| POST | `/api/content` | Admin creates/updates a record. |
| DELETE | `/api/content/<id>` | Delete content and unused files. |
| GET | `/api/visits` | Private visitor records. |
| DELETE | `/api/visits/<id>` | Delete one record. |
| DELETE | `/api/visits/all` | Clear visitor records. |
| DELETE | `/api/visitors/<record_id>` | Delete all records for that row's IP. |
| POST | `/api/visitors/<record_id>/block` | Confirmed IP block. |
| GET | `/api/blocks` | Private block list. |
| DELETE | `/api/blocks/<block_id>` | Unblock an IP. |
| GET / HEAD | `/media/<filename>` | Published playback/download; admin-only access for unpublished uploads. |

`?download=1` requests attachment delivery. Mutations require the custom `X-Binge-Request` header, authentication where applicable and permitted Origin when supplied. Upload requests also use `X-Kind` and `X-Filename`.

## 19. Limits and storage behavior

| Item | Current application rule |
| --- | --- |
| Video | MP4/WebM/OGG; up to 1 GiB, displayed as 1 GB. |
| Book/story | PDF/TXT; same main-file limit. |
| Poster | JPG/JPEG/PNG/WebP; up to 10 MiB. |
| Season / episode | Integers 1–9,999. |
| Default upload allowance | 8 GiB via BINGE_STORAGE_LIMIT_GB. |
| Prepared Render disk | 10 GB. |
| JSON mutation body | Up to 65,536 bytes. |
| Admin session | Eight hours. |
| Displayed / retained visits | 1,000 / up to 10,000. |
| Visit retention | 30 days with access-triggered cleanup. |

Files use generated storage names. Uploads write to part files and move into place when complete. Poster signatures and PDF headers are checked; this is not malware scanning or full media decoding. The app checks storage allowance and free disk space.

Waitress buffers requests and spools larger bodies to temporary storage. Host/proxy request-size or timeout limits can be lower than Binge's own limit. Operating capacity must cover media, database, temporary buffering, backups and download bandwidth.

## 20. Security and privacy

Implemented controls include admin-only mutations, hashed passwords/tokens, persistent sessions, login limiting, logout/reset revocation, custom mutation headers, Origin validation and secure production cookies.

File serving uses generated filenames and an explicit public-asset allowlist. Server code, databases, secrets, environment files and backups are not public assets. Notice copy is plain text and social URLs are validated.

Headers include Content-Security-Policy, nosniff, SAMEORIGIN framing, same-origin referrer policy and restricted browser-feature permissions. HSTS is enabled with secure production cookies. Unexpected server failures return generic messages; Waitress does not expose tracebacks intentionally.

The privacy page explains logs, cookies, blocking and hosting. Block entries remain until unblocked; visit-record cleanup does not erase active blocks. These controls do not replace an independent security, accessibility, privacy or content-rights review.

## 21. Development and Render deployment

### Local development

```text
python app.py
```

Website: `http://localhost:5001/`. Admin: `http://localhost:5001/admin`.

`START-DEV.bat` is an alternative. Python changes reload automatically in the command-line flow; frontend changes require browser refresh. VS Code offers **Binge: Run local website**; that configuration disables the reloader to keep the debugger attached. The dev server binds to loopback and disables the interactive debugger.

### Production-mode local startup

Use `python server.py` or `START.bat`, normally on port 8000. Windows launchers create a virtual environment and install requirements if needed. This is separate from the development preview on port 5001.

### Prepared Render service

- Python web service, Starter plan, one instance.
- Build command: `pip install -r requirements.txt`.
- Start command: `python server.py`.
- Health check: `/healthz`.
- Bind to `0.0.0.0` and Render's assigned PORT.
- Persistent disk mounted at `/var/data`; data directory `/var/data/binge`.
- Private first-start admin password supplied through environment settings.
- Use the HTTPS endpoint and configure the expected origin for a custom admin domain.

This disk-backed architecture needs a paid Render service with persistent storage. A Vercel version would require a different persistence/upload architecture, such as a hosted database and object storage. Vercel hosting is not implemented.

### Environment variables

| Variable | Purpose |
| --- | --- |
| BINGE_ENV | Production mode and secure-cookie behavior. |
| BINGE_ADMIN_PASSWORD | First-start admin password. |
| BINGE_DATA_DIR | Database/upload location. |
| BINGE_HOST / PORT | Production binding and port. |
| BINGE_DEV_PORT | Development port, default 5001. |
| BINGE_RELOAD | Development reloader toggle. |
| BINGE_STORAGE_LIMIT_GB | Upload allowance. |
| BINGE_SHOW_DEMO | Fictional starter visibility. |
| BINGE_SECURE_COOKIES | Explicit secure-cookie setting outside production mode. |
| BINGE_PUBLIC_URL | Expected public origin for mutations. |
| BINGE_TRUSTED_PROXY | Exact trusted connecting proxy outside Render. |
| RENDER / RENDER_EXTERNAL_URL | Host-supplied information. |

## 22. Backups, maintenance and migration

Stop writes/server before offline maintenance:

```text
python maintenance.py backup --output ../binge-private-backup.zip
python maintenance.py cleanup
python maintenance.py reset-password
```

Backups include a SQLite backup snapshot and uploaded files. Keep them private and outside the web repository. Cleanup removes only unreferenced uploads older than 24 hours. Password reset requires matching confirmation and revokes sessions.

Restore the database and uploads together while the application is stopped. Source-only release archives exclude media, databases, credentials, virtual environments and backups. Deploying source does not automatically transfer local content.

Multiple local project copies existed during development. Use the folder printed by app.py and the intended VS Code folder as the source of truth. Do not run multiple servers against the same data directory while changing records.

## 23. Acceptance criteria

| Area | Required outcome |
| --- | --- |
| Authentication | Unauthenticated mutations fail; login works; sessions persist, expire and revoke correctly. |
| Editing | Existing record loads; saving details retains ID/file; replacement affects the intended upload. |
| Series uploading | Each selected file maps to its episode; missing/duplicate entries are rejected; partial retries avoid duplicate completed rows. |
| Grouping | One card per series; numerically ordered seasons/episodes inside. |
| Playback/download | Episode choice updates player/download; attachment returns correct bytes; range/HEAD work. |
| Library | Published PDF/TXT reading, filtering and downloads work. |
| Visitor deletion | Delete-record/delete-visitor scopes differ; Cancel changes nothing. |
| Blocking | Explicit confirmation; future page/API/media access denied; persistent block; unblock restores access. |
| Notices/social | Admin-only saves persist; empty/disabled sections hide; invalid URLs rejected; text is not executed. |
| Phone navigation | Public/admin hamburgers work; admin section selection opens the correct panel. |
| Persistence | Restart/deploy with the data disk preserves records, media, settings and blocks. |
| Packaging | Source archive contains no private media, databases, credentials or virtual environment. |

## 24. Verification status and remaining launch checks

The backend suite currently contains **18 test cases**. The original release suite passed and subsequent feature-specific tests were run for editing, visitor choices, blocking and notices/social settings. This documentation update does not claim a new complete 18-case run.

Additional checks exercised admin selection/submission against an isolated server with **45 episode files**, grouping with **150 episodes**, watch/download targets, visitor action cancellation/confirmation, phone admin navigation, public notices and asset references.

Tests use isolated/synthetic data and do not prove every real video encoding works on every phone. Pixel-level browser testing, accessibility review, load testing and a live Render deployment remain separate work.

Before launch:

1. Connect the intended private repository and deploy the configured Render service.
2. Configure the real secret, HTTPS/domain and persistent disk.
3. Migrate content privately or upload through BINGERET.
4. Test the largest expected hosted upload.
5. Test playback, reading, navigation and downloads on actual phones/computers.
6. Verify persistence after a hosted restart and test backup restoration.
7. Review operator contact details, privacy text and distribution permissions.
8. Monitor storage, temporary files, bandwidth and application errors.

## 25. Known limits and future options

Not currently implemented:

- Visitor accounts, subscriptions, payments or premium access.
- Multiple admin roles or detailed admin audit trails.
- Comments, ratings, favorites or cross-device viewing progress.
- Transcoding, adaptive streaming, subtitles management or selectable video qualities.
- Timeline video editing, DRM or automated copyright protection.
- Object storage, CDN media delivery or durable chunked/resumable uploads.
- Dedicated series/season entities. Identically named remakes in the same collection may group together under the current title-based rule.
- Scheduled/multiple notice archives or social-network API integration.
- Email recovery, two-factor authentication or email notifications.
- Native phone apps or offline/service-worker mode.
- Full malware scanning, independent penetration testing or multi-instance scaling.

For scaling, move records to a shared database and media to object storage before increasing instances. Stable series IDs would support remakes, series-wide changes and larger catalogs more reliably.
