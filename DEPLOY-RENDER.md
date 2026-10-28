# Deploy Binge on Render

This release targets one Render Python web service with a persistent disk. It has not been deployed to your Render account yet.

## 1. Put this project in a private GitHub repository

Open the `binge` project folder in VS Code. Put the **contents of this folder** at the repository root, so `server.py`, `production.py`, `requirements.txt`, and `render.yaml` are at the top level. If your repository contains an enclosing folder instead, set Render's Root Directory to that folder or move these files to the repository root before using the Blueprint.

Do not commit `data/`, `.env`, databases, backup ZIP files, or your admin password. The included `.gitignore` excludes them. The release ZIP contains source only, not your existing media or account data.

## 2. Create the Render service

In Render choose **New → Blueprint**, connect your repository, and select its `render.yaml`. Review the paid service and disk configuration before creating it. The Blueprint requests:

| Setting | Value |
| --- | --- |
| Runtime | Python |
| Build command | `pip install -r requirements.txt` |
| Start command | `python server.py` |
| Health check | `/healthz` |
| Instances | 1 |
| Persistent disk | 10 GB, mounted at `/var/data` |
| Binge data | `/var/data/binge` |
| Upload storage limit | 8 GB, leaving space for the database and temporary files |

Set **BINGE_ADMIN_PASSWORD** privately when Render asks. Use at least 12 characters. Username is **BINGERET**. A password is only seeded on first startup; changing this environment variable later does not replace an existing database password. Use the maintenance command to reset an existing password.

Render sets `PORT` and `RENDER_EXTERNAL_URL` automatically. The application binds to `0.0.0.0` and the assigned port. The production setting enables Secure, HttpOnly login cookies; use the HTTPS address Render gives you. HTTP on localhost is for local mode only.

Render's free filesystem is ephemeral. This SQLite-and-file-upload version requires a paid service with a persistent disk. Do not deploy it as a static site. See [Render persistent disks](https://render.com/docs/disks) and [Blueprint reference](https://render.com/docs/blueprint-spec).

## 3. Verify the live deployment

1. Wait until Render reports a successful deploy and `/healthz` returns `{"status":"ok"}`.
2. Visit the HTTPS homepage, `/books.html`, and `/admin`.
3. Sign in as BINGERET. Upload one movie with a poster, a small series batch, and a PDF or TXT story.
4. On the public site, check playback, episode downloads, reading, search and mobile navigation.
5. Restart the Render service. Verify that the uploads and admin session remain available.
6. Test a real video on your target phone. Use a browser-compatible MP4 (H.264/AAC) for broad compatibility; Binge does not transcode files.

The application allows 1 GB per video/book and 10 MB per poster. The platform or any proxy/CDN you add can enforce a smaller request size or timeout. Before public launch, test your largest expected episode over the real connection. If that test fails because of a platform upload limit, use direct object-storage uploads; do not assume the local 1 GB limit overrides the host. Bandwidth and disk usage increase as viewers download videos.

## Existing local content

Updating your local project preserves its `data/` folder. A new Render disk starts empty. For a fresh launch, upload your content again through BINGERET. To migrate existing records and media together:

1. Stop the local server so uploads and records cannot change.
2. Run `python maintenance.py backup --output ../binge-private-backup.zip` from this folder.
3. Keep that ZIP private. Transfer it to Render using a private transfer method supported by your service; do not put it in your public repository or serve it as a website asset.
4. Stop writes to the hosted application, then restore the database and `uploads/` into `/var/data/binge`, retaining their directory structure. Preserve the local password when restoring that database. Delete old `binge.sqlite3-wal` and `binge.sqlite3-shm` only while the service is fully stopped, after retaining a backup of the destination.
5. Restart and verify your titles, files, posters, login and downloads.

See [Render file transfers](https://render.com/docs/disks#transferring-files). Migration is an operator task; this release does not automatically copy private local files to Render.

## Domain, privacy and operations

Add your domain in Render and follow the DNS instructions it displays. Set `BINGE_PUBLIC_URL=https://your-domain` if using that domain for the admin interface. Render supplies managed TLS. No domain is hardcoded in the application.

Review `/privacy.html` before launch and replace the generic contact paragraph with your operator contact. Upload only videos, books and artwork you can distribute. Demo titles are hidden by default; set `BINGE_SHOW_DEMO=1` only for a demonstration.

Visitor activity is visible only to BINGERET and is capped at 10,000 retained records, with 1,000 shown at once. Records older than 30 days are removed when public pages or the visitor log are accessed. Login failures are retained for 15 minutes to limit attempts; expired sessions are removed at login. IPs are technical network identifiers, not proof of a person's identity. On Render, the edge-provided `CF-Connecting-IP` is used. Outside Render, forwarding is ignored unless `BINGE_TRUSTED_PROXY` exactly matches the connecting proxy IP.

Keep one service instance. For multi-instance scaling, move records to Postgres and files to object storage first. Waitress buffers incoming requests, spooling larger bodies to the host's temporary storage; account for that storage as well as published uploads. Do not run uploads on an undersized disk.

## Backups and maintenance

Stop uploads and the server before running maintenance. Store private backup files outside the web source directory and copy them off the host:

```text
python maintenance.py backup --output /private/location/binge-backup.zip
python maintenance.py cleanup
python maintenance.py reset-password
```

`cleanup` removes only unreferenced uploads older than 24 hours, including abandoned upload parts. It never removes referenced media. Password reset revokes all admin sessions. To restore, stop the service, retain a backup of the destination, and extract the backup into the configured data directory. Test restoration before relying on a backup strategy.

Render snapshots alone are not a substitute for an application-consistent SQLite backup. See [Render database recovery guidance](https://render.com/docs/disks#restoring-a-custom-database).

## Vercel

This release is prepared for Render. A Vercel deployment would require replacing local SQLite and disk uploads with hosted database and object storage, plus direct large-file uploads. The Render release is not a Vercel-ready serverless build.
