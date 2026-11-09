# Binge — release for Render

Binge includes BINGERET admin, posters, movie/series uploads, individual episode files and downloads, books/stories, search, responsive navigation and private visitor logs.

## Work on the website in VS Code

Open this exact project folder in VS Code. Run `python app.py` for Flask development mode at http://localhost:5001. It prints the working folder and reloads Python changes automatically. Refresh the browser after frontend edits. Alternatively double-click START-DEV.bat, or use Run and Debug → Binge: Run local website (requires VS Code's Python debugger extension). The F5 configuration disables the reloader so the debugger remains attached; restart the VS Code run after Python edits. Local development is bound to this computer, and the interactive debugger is disabled.

`server.py` remains the production entry point used by Render. Do not deploy `app.py` as your production start command. Both modes use the same data directory when run from this project; do not run two modes at once while editing records.

## Run the production server locally on Windows

Double-click START.bat. It creates a virtual environment, installs the pinned dependencies and starts Waitress. Python 3.10+ and internet access are needed on first setup. Keep the terminal open. On a new database, choose a password with at least 12 characters; typing stays hidden. Existing passwords and uploaded files are preserved.

Open http://localhost:8000 and http://localhost:8000/admin. Username: BINGERET.

Or install and run manually:

```text
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe server.py
```

On Linux/macOS, use `.venv/bin/python` instead. For noninteractive first startup, set BINGE_ADMIN_PASSWORD privately before starting. Production never prompts for a password: it fails clearly if this secret is missing on a new database.

## Publish on Render

Follow DEPLOY-RENDER.md. The included render.yaml defines a single Python web service with a paid persistent disk. No hosting account has been changed and this release is not deployed yet. Publish the project contents at your Git repository root; never commit data/, passwords, or backups.

## Upload a series

Choose **Upload series episodes**, select all episode videos together, and review the generated episode numbers. The count is automatic. All episodes share a title, description, season and poster, and each gets its own video file and download button. Use **Add episodes** beside an existing series to continue with the next episode number. Selecting Movie uses one video; editing one episode replaces that episode's file only. Duplicate season/episode saves are blocked server-side. Successful rows are retained when retrying a partially completed batch, provided you keep the page open.

Up to 9,999 episode numbers per season are supported. For very large seasons, use smaller batches to keep the browser responsive. Videos support MP4/WebM/OGG; books and stories support PDF/TXT; posters support JPG/PNG/WebP. The application limits each video/book to 1 GB and posters to 10 MB. Hosting and proxy limits can be lower. No transcoding, timeline editing, DRM or virus scanner is included.

## Public site

Published uploads appear automatically. Demo records are hidden by default (BINGE_SHOW_DEMO=1 enables them). Downloads save using the device's browser settings. The hamburger menu appears only at phone widths; desktop has category navigation. Admin links are hidden from the public navigation, but admin actions always require authentication.

## Data and maintenance

The data/ folder contains the SQLite database, uploaded files and persistent admin sessions. Do not delete or expose it. On Render, BINGE_DATA_DIR points to the persistent disk. Sessions expire after 8 hours and survive a server restart. See DEPLOY-RENDER.md for backups, cleanup, password reset and migrating existing local content.

## Verification

```text
python -m unittest -v test_release
```

Tests use isolated temporary data, not your real media or password. They cover authentication, restart persistence, origin protection, rate limits, legacy database migration, 45 episode uploads, poster/book validation, download ranges/HEAD, storage limits, duplicate saves, deletion and visitor retention. Live Render deployment and real-device playback still require the launch checks in DEPLOY-RENDER.md.

## Blocking visitors
The visitor action dialog offers Delete this visitor, Delete this record, Block this visitor, and Cancel. Blocking requires an additional confirmation and prevents future public/API/media access from that IP address. Blocks persist across restarts and remain after visit records are deleted. Use the private Blocked visitors list to unblock an address. Your current admin IP cannot be blocked through this action, to prevent accidental lockout. Shared IPs affect everyone using that address.

## Notices and social media
In BINGERET, open Notices & social media to write a notice and toggle its visibility. The live preview uses plain text; publish saves it to the database and displays it above the public page content. Add a Telegram, TikTok, X, Instagram, YouTube, Facebook or WhatsApp handle/profile link to show its social card near the public footer. Empty fields remain hidden. Enter WhatsApp numbers with a country code. Public links are restricted to HTTPS profiles on the corresponding platform. Settings persist across restarts; clear a profile or switch off a notice and publish again to remove it from the site.


Uploads include rights metadata. Admins can select all-rights-reserved, CC0, or a Creative Commons 4.0 license, add required creator attribution, and provide the original HTTPS source. License details are displayed on public title pages and the reading library. Selecting a license does not grant rights; only publish content you own or are authorized to redistribute.
