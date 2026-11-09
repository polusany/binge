"""Persistent Binge application served by Waitress; no development server in production."""
import getpass, json, hashlib, hmac, ipaddress, logging, os, re, secrets, shutil, sqlite3, sys, threading, time
from contextlib import contextmanager
from functools import wraps
from pathlib import Path
from urllib.parse import unquote, urlsplit
from flask import Flask, abort, jsonify, request, send_file
from werkzeug.exceptions import HTTPException

ROOT=Path(__file__).resolve().parent
ALLOWED={'video':{'.mp4','.webm','.ogg'},'book':{'.pdf','.txt'},'story':{'.pdf','.txt'},'poster':{'.jpg','.jpeg','.png','.webp'}}
SECTIONS={'movies','tv-series','k-drama','chinese-drama','hollywood-movies','anime-series','bollywood-movies','nollywood-movies','philippine-drama','thai-movies','japanese-drama'}
FILE_NAME=re.compile(r'^[a-f0-9]{40}\.(?:mp4|webm|ogg|pdf|txt|jpg|jpeg|png|webp)$')

def create_app(config=None):
    app=Flask(__name__,static_folder=None)
    prod=os.environ.get('BINGE_ENV')=='production'
    app.config.update(DATA_DIR=os.environ.get('BINGE_DATA_DIR',str(ROOT/'data')),ADMIN_PASSWORD=os.environ.get('BINGE_ADMIN_PASSWORD'),PRODUCTION=prod,SECURE_COOKIES=prod or os.environ.get('BINGE_SECURE_COOKIES')=='1',SHOW_DEMO=os.environ.get('BINGE_SHOW_DEMO','0')=='1',MAX_CONTENT_LENGTH=1024**3,MAX_STORAGE_BYTES=int(os.environ.get('BINGE_STORAGE_LIMIT_GB','8'))*1024**3)
    if config: app.config.update(config)
    data=Path(app.config['DATA_DIR']).resolve();data.mkdir(parents=True,exist_ok=True)
    uploads=data/'uploads';uploads.mkdir(exist_ok=True)
    app.config['DATABASE']=str(data/'binge.sqlite3')
    write_lock=threading.RLock();upload_lock=threading.Lock()

    @contextmanager
    def db():
        conn=sqlite3.connect(app.config['DATABASE'],timeout=30);conn.row_factory=sqlite3.Row
        try:
            yield conn;conn.commit()
        except Exception:
            conn.rollback();raise
        finally:conn.close()

    with db() as conn:
        conn.execute('PRAGMA journal_mode=WAL')
        conn.executescript('''CREATE TABLE IF NOT EXISTS content(id TEXT PRIMARY KEY,kind TEXT,title TEXT,description TEXT,genre TEXT,section TEXT,format TEXT,year INTEGER,author TEXT,file TEXT,extension TEXT);
        CREATE TABLE IF NOT EXISTS visits(id INTEGER PRIMARY KEY,ip TEXT,path TEXT,seen TEXT);
        CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT);
        CREATE TABLE IF NOT EXISTS comments(id INTEGER PRIMARY KEY AUTOINCREMENT,content_id TEXT NOT NULL,name TEXT NOT NULL,body TEXT NOT NULL,created_at REAL NOT NULL);
        CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,expires REAL);
        CREATE TABLE IF NOT EXISTS login_attempts(ip TEXT,seen REAL);
        CREATE TABLE IF NOT EXISTS blocked_visitors(id INTEGER PRIMARY KEY,ip TEXT UNIQUE,blocked_at TEXT);
        CREATE INDEX IF NOT EXISTS attempts_ip ON login_attempts(ip,seen);
        CREATE INDEX IF NOT EXISTS visits_seen ON visits(seen);''')
        conn.execute('CREATE INDEX IF NOT EXISTS comments_content_created ON comments(content_id,created_at DESC)')
        columns={r[1] for r in conn.execute('PRAGMA table_info(content)')}
        for name,definition in [('poster_file',"TEXT DEFAULT ''"),('season','INTEGER'),('episode','INTEGER'),('license',"TEXT DEFAULT 'all-rights-reserved'"),('attribution',"TEXT DEFAULT ''"),('source_url',"TEXT DEFAULT ''")]:
            if name not in columns:conn.execute(f'ALTER TABLE content ADD COLUMN {name} {definition}')
        if not conn.execute("SELECT 1 FROM settings WHERE key='password'").fetchone():
            password=app.config['ADMIN_PASSWORD']
            if not password and not app.config['PRODUCTION'] and sys.stdin.isatty():password=getpass.getpass('Choose BINGERET password (12+ characters): ')
            if not password or len(password)<12:raise RuntimeError('Set BINGE_ADMIN_PASSWORD to at least 12 characters before first startup.')
            salt=secrets.token_hex(16);digest=hashlib.pbkdf2_hmac('sha256',password.encode(),salt.encode(),300000).hex()
            conn.execute("INSERT INTO settings VALUES('password',?)",(salt+':'+digest,))

    def client_ip():
        ip=request.remote_addr or 'unknown'
        if os.environ.get('RENDER')=='true':candidate=request.headers.get('CF-Connecting-IP','').strip()
        elif os.environ.get('BINGE_TRUSTED_PROXY')==ip:candidate=request.headers.get('X-Forwarded-For','').split(',')[0].strip()
        else:return ip
        try:return str(ipaddress.ip_address(candidate))
        except ValueError:return ip

    def token_hash():return hashlib.sha256(request.cookies.get('binge_session','').encode()).hexdigest()
    def authorized():
        with db() as conn:return conn.execute('SELECT 1 FROM sessions WHERE token=? AND expires>?',(token_hash(),time.time())).fetchone() is not None
    def admin(fn):
        @wraps(fn)
        def call(*args,**kwargs):
            if not authorized():abort(401,description='Sign in as BINGERET first.')
            return fn(*args,**kwargs)
        return call
    def body():
        if not request.content_length or request.content_length>65536:abort(400,description='Invalid request size.')
        value=request.get_json(force=True)
        if not isinstance(value,dict):abort(400,description='Expected an object.')
        return value
    @app.before_request
    def protect():
        if request.path != '/healthz':
            with db() as conn:blocked=conn.execute('SELECT 1 FROM blocked_visitors WHERE ip=?',(client_ip(),)).fetchone()
            if blocked:
                if request.path.startswith('/api/'):return jsonify(error='Access to Binge is blocked for this IP address.'),403
                return '<!doctype html><title>Access blocked — Binge</title><h1>Access blocked</h1><p>Future visits from this IP address have been blocked by the site administrator.</p>',403
        if request.method not in {'GET','HEAD','OPTIONS'}:
            if request.headers.get('X-Binge-Request')!='1':abort(403,description='Missing request header.')
            origin=request.headers.get('Origin');expected=os.environ.get('BINGE_PUBLIC_URL') or os.environ.get('RENDER_EXTERNAL_URL')
            allowed=urlsplit(expected).netloc if expected else request.host
            if origin and urlsplit(origin).netloc!=allowed:abort(403,description='Invalid request origin.')
    @app.after_request
    def security(response):
        response.headers.update({'X-Content-Type-Options':'nosniff','X-Frame-Options':'SAMEORIGIN','Referrer-Policy':'same-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; media-src 'self'; frame-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'"})
        if request.path.startswith('/api/') or response.mimetype=='text/html':response.headers['Cache-Control']='no-store'
        if response.mimetype in {'text/javascript','application/javascript','text/css'}:response.headers['Cache-Control']='no-cache'
        if app.config['SECURE_COOKIES']:response.headers['Strict-Transport-Security']='max-age=31536000'
        return response
    @app.errorhandler(HTTPException)
    def expected(error):
        if request.path.startswith('/api/'):return jsonify(error=error.description),error.code
        return f'<!doctype html><title>Binge</title><h1>{error.code}</h1><p>This page is unavailable.</p><a href="/">Return to Binge</a>',error.code
    @app.errorhandler(Exception)
    def unexpected(error):
        app.logger.exception('Request failed')
        return jsonify(error='The server could not complete this request. Please try again.'),500
    @app.get('/healthz')
    def health():
        with db() as conn:conn.execute('SELECT 1').fetchone()
        return jsonify(status='ok')
    @app.get('/api/config')
    def site_config():return jsonify(show_demo=app.config['SHOW_DEMO'],max_upload_bytes=app.config['MAX_CONTENT_LENGTH'])
    def read_site_settings():
        with db() as conn:row=conn.execute("SELECT value FROM settings WHERE key='site_settings'").fetchone()
        if row:return json.loads(row['value'])
        return {'notice':{'enabled':False,'title':'','message':''},'social_heading':'Find us on social media','socials':{}}
    def social_url(platform,value):
        value=str(value).strip()
        if not value:return ''
        if len(value)>500:abort(400,description=f'The {platform} link is too long.')
        hosts={'telegram':{'t.me','telegram.me'},'tiktok':{'tiktok.com'},'x':{'x.com','twitter.com'},'instagram':{'instagram.com'},'youtube':{'youtube.com','youtu.be'},'facebook':{'facebook.com','fb.com'},'whatsapp':{'wa.me','whatsapp.com','chat.whatsapp.com'}}
        if '://' in value:
            try:
                parsed=urlsplit(value);host=(parsed.hostname or '').removeprefix('www.')
                valid=parsed.scheme=='https' and host in hosts[platform] and not parsed.username and not parsed.password and parsed.port in (None,443)
            except ValueError:valid=False
            if not valid:abort(400,description=f'Enter a valid HTTPS {platform} profile link or handle.')
            return value
        handle=value.lstrip('@')
        if platform=='whatsapp':
            handle=re.sub(r'[ +()-]','',value)
            if not re.fullmatch(r'[0-9]{7,15}',handle):abort(400,description='Enter a WhatsApp number with country code, or a full HTTPS WhatsApp link.')
        elif not re.fullmatch(r'[a-zA-Z0-9_.-]{1,120}',handle):abort(400,description=f'Enter a valid {platform} handle or full HTTPS profile link.')
        prefixes={'telegram':'https://t.me/','tiktok':'https://www.tiktok.com/@','x':'https://x.com/','instagram':'https://www.instagram.com/','youtube':'https://www.youtube.com/@','facebook':'https://www.facebook.com/','whatsapp':'https://wa.me/'}
        return prefixes[platform]+handle
    @app.get('/api/site-settings')
    def public_site_settings():return jsonify(read_site_settings())
    @app.post('/api/site-settings')
    @admin
    def save_site_settings():
        value=body();notice=value.get('notice',{});socials=value.get('socials',{})
        if not isinstance(notice,dict) or not isinstance(socials,dict) or not isinstance(notice.get('enabled',False),bool):abort(400,description='Invalid notice or social settings.')
        title=str(notice.get('title','')).strip();message=str(notice.get('message','')).strip();heading=str(value.get('social_heading','')).strip()
        if len(title)>120 or len(message)>2000 or len(heading)>140:abort(400,description='Notice title: 120 characters; message: 2,000; social heading: 140.')
        if notice.get('enabled') and not message:abort(400,description='Write a notice message before publishing it.')
        links={}
        for platform in ['telegram','tiktok','x','instagram','youtube','facebook','whatsapp']:
            url=social_url(platform,socials.get(platform,''))
            if url:links[platform]=url
        settings={'notice':{'enabled':notice.get('enabled',False),'title':title,'message':message},'social_heading':heading or 'Find us on social media','socials':links}
        with write_lock,db() as conn:conn.execute("INSERT OR REPLACE INTO settings(key,value) VALUES('site_settings',?)",(json.dumps(settings),))
        return jsonify(ok=True)
    @app.get('/api/session')
    def session():return jsonify(authenticated=authorized(),name='BINGERET')
    @app.post('/api/login')
    def login():
        value=body();ip=client_ip();now=time.time()
        with write_lock,db() as conn:
            conn.execute('DELETE FROM login_attempts WHERE seen<?',(now-900,));conn.execute('DELETE FROM sessions WHERE expires<?',(now,))
            if conn.execute('SELECT count(*) FROM login_attempts WHERE ip=?',(ip,)).fetchone()[0]>=10:return jsonify(error='Too many attempts. Try again in 15 minutes.'),429
            salt,expected=conn.execute("SELECT value FROM settings WHERE key='password'").fetchone()[0].split(':')
            actual=hashlib.pbkdf2_hmac('sha256',str(value.get('password','')).encode(),salt.encode(),300000).hex()
            if value.get('username')!='BINGERET' or not hmac.compare_digest(actual,expected):
                conn.execute('INSERT INTO login_attempts VALUES(?,?)',(ip,now));return jsonify(error='Incorrect username or password.'),401
            conn.execute('DELETE FROM login_attempts WHERE ip=?',(ip,));conn.execute('DELETE FROM sessions WHERE token=?',(token_hash(),))
            token=secrets.token_urlsafe(32);conn.execute('INSERT INTO sessions VALUES(?,?)',(hashlib.sha256(token.encode()).hexdigest(),now+28800))
        response=jsonify(authenticated=True,name='BINGERET');response.set_cookie('binge_session',token,httponly=True,secure=app.config['SECURE_COOKIES'],samesite='Strict',max_age=28800)
        return response
    @app.post('/api/logout')
    @admin
    def logout():
        with db() as conn:conn.execute('DELETE FROM sessions WHERE token=?',(token_hash(),))
        response=jsonify(ok=True);response.delete_cookie('binge_session',secure=app.config['SECURE_COOKIES'],httponly=True,samesite='Strict');return response
    @app.get('/api/content')
    def contents():
        with db() as conn:return jsonify([dict(r) for r in conn.execute('SELECT * FROM content ORDER BY rowid DESC')])
    @app.get('/api/comments/<ident>')
    def get_comments(ident):
        if not re.fullmatch(r'[a-zA-Z0-9_-]{1,80}',ident):abort(400,description='Invalid title ID.')
        with db() as conn:
            rows=conn.execute('SELECT id,content_id,name,body,created_at FROM comments WHERE content_id=? ORDER BY created_at DESC,id DESC LIMIT 100',(ident,))
            return jsonify([dict(row) for row in rows])
    @app.post('/api/comments/<ident>')
    def add_comment(ident):
        if not re.fullmatch(r'[a-zA-Z0-9_-]{1,80}',ident):abort(400,description='Invalid title ID.')
        value=body();name=str(value.get('name','')).strip();message=str(value.get('body','')).strip()
        if not name or len(name)>60:abort(400,description='Enter a name of 1 to 60 characters.')
        if not message or len(message)>1200:abort(400,description='Enter a comment of 1 to 1,200 characters.')
        with write_lock,db() as conn:
            cursor=conn.execute('INSERT INTO comments(content_id,name,body,created_at) VALUES(?,?,?,?)',(ident,name,message,time.time()))
            row=conn.execute('SELECT id,content_id,name,body,created_at FROM comments WHERE id=?',(cursor.lastrowid,)).fetchone()
            return jsonify(dict(row)),201
    def safe_file(name,kind):
        if not isinstance(name,str) or not FILE_NAME.fullmatch(name) or Path(name).suffix not in ALLOWED[kind] or not (uploads/name).is_file():abort(400,description='Upload a supported file first.')
        return name
    def cleanup_file(conn,name):
        if name and FILE_NAME.fullmatch(name) and not conn.execute('SELECT 1 FROM content WHERE file=? OR poster_file=?',(name,name)).fetchone():(uploads/name).unlink(missing_ok=True)
    @app.post('/api/upload')
    @admin
    def upload():
        kind=request.headers.get('X-Kind','');extension=Path(unquote(request.headers.get('X-Filename',''))).suffix.lower()
        if kind not in ALLOWED or extension not in ALLOWED[kind]:abort(400,description='Unsupported file format.')
        length=request.content_length;maximum=10*1024**2 if kind=='poster' else app.config['MAX_CONTENT_LENGTH']
        if not length or not 0<length<=maximum:abort(413,description='File exceeds the upload size limit.')
        name=secrets.token_hex(20)+extension;temporary=uploads/(name+'.part');destination=uploads/name
        with upload_lock:
            total=sum(p.stat().st_size for p in uploads.iterdir() if p.is_file())
            if total+length>app.config['MAX_STORAGE_BYTES'] or shutil.disk_usage(data).free<length+64*1024**2:return jsonify(error='Upload storage is full. Delete content or increase the persistent disk.'),507
            try:
                with temporary.open('wb') as output:
                    remaining=length
                    while remaining:
                        chunk=request.stream.read(min(1024**2,remaining))
                        if not chunk:abort(400,description='Upload was interrupted. Try again.')
                        output.write(chunk);remaining-=len(chunk)
                with temporary.open('rb') as uploaded:signature=uploaded.read(16)
                if kind=='poster':
                    valid=(extension in {'.jpg','.jpeg'} and signature.startswith(b'\xff\xd8\xff')) or (extension=='.png' and signature.startswith(b'\x89PNG\r\n\x1a\n')) or (extension=='.webp' and signature.startswith(b'RIFF') and signature[8:12]==b'WEBP')
                    if not valid:abort(400,description='The poster is not a valid JPG, PNG or WebP image.')
                elif extension=='.pdf' and not signature.startswith(b'%PDF-'):abort(400,description='The file is not a valid PDF.')
                temporary.replace(destination)
            finally:temporary.unlink(missing_ok=True)
        return jsonify(file=name,extension=extension),201
    @app.post('/api/content')
    @admin
    def save_content():
        value=body();kind=value.get('kind');title=str(value.get('title','')).strip()
        if kind not in {'video','book','story'} or not title or len(title)>200:abort(400,description='Enter a title up to 200 characters and select a content type.')
        filename=safe_file(value.get('file'),kind);poster=value.get('poster_file') or ''
        if poster:safe_file(poster,'poster')
        try:
            year=int(value.get('year') or 2026);season=int(value.get('season')) if kind=='video' and value.get('format')=='Series' else None;episode=int(value.get('episode')) if season is not None else None
        except (ValueError,TypeError):abort(400,description='Enter valid year, season and episode numbers.')
        if not 1888<=year<=2200 or (season is not None and not (1<=season<=9999 and 1<=episode<=9999)):abort(400,description='Invalid year, season or episode.')
        section=value.get('section','movies')
        if section not in SECTIONS:abort(400,description='Select a valid collection.')
        license_id=str(value.get('license','all-rights-reserved'))
        attribution=str(value.get('attribution','')).strip()[:500]
        source_url=str(value.get('source_url','')).strip()[:500]
        licenses={'all-rights-reserved','cc0','cc-by-4.0','cc-by-sa-4.0','cc-by-nd-4.0','cc-by-nc-4.0','cc-by-nc-sa-4.0','cc-by-nc-nd-4.0'}
        if license_id not in licenses:abort(400,description='Select a valid rights or Creative Commons license.')
        if license_id.startswith('cc-by') and not attribution:abort(400,description='Add the creator or required attribution for this Creative Commons license.')
        if source_url and (not re.fullmatch(r'https://[^\s]+',source_url,re.I) or not urlsplit(source_url).netloc):abort(400,description='The source link must be a valid HTTPS URL.')
        ident=value.get('id') or secrets.token_hex(12)
        if not isinstance(ident,str) or not re.fullmatch(r'[a-zA-Z0-9_-]{1,80}',ident):abort(400,description='Invalid record ID.')
        with write_lock,db() as conn:
            old=conn.execute('SELECT * FROM content WHERE id=?',(ident,)).fetchone()
            same=conn.execute('SELECT id FROM content WHERE file=? AND id<>?',(filename,ident)).fetchone()
            if same:return jsonify(id=same['id'])
            if season is not None and conn.execute("SELECT id FROM content WHERE kind='video' AND format='Series' AND lower(trim(title))=lower(?) AND section=? AND season=? AND episode=? AND id<>?",(title,section,season,episode,ident)).fetchone():abort(409,description=f'Season {season}, episode {episode} already exists. Edit it instead.')
            conn.execute('INSERT OR REPLACE INTO content(id,kind,title,description,genre,section,format,year,author,file,extension,poster_file,season,episode,license,attribution,source_url) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',(ident,kind,title,str(value.get('description',''))[:10000],str(value.get('genre','Drama'))[:60],section,'Series' if season else 'Movie',year,str(value.get('author',''))[:200],filename,Path(filename).suffix,poster,season,episode,license_id,attribution,source_url))
            if old:
                for previous in (old['file'],old['poster_file']):
                    if previous not in {filename,poster}:cleanup_file(conn,previous)
        return jsonify(id=ident)
    @app.delete('/api/content/<ident>')
    @admin
    def delete_content(ident):
        with write_lock,db() as conn:
            row=conn.execute('SELECT * FROM content WHERE id=?',(ident,)).fetchone()
            if not row:abort(404,description='Content not found.')
            conn.execute('DELETE FROM content WHERE id=?',(ident,))
            conn.execute('DELETE FROM comments WHERE content_id=?',(ident,))
            for name in (row['file'],row['poster_file']):cleanup_file(conn,name)
        return jsonify(ok=True)
    def expire_visits(conn):conn.execute("DELETE FROM visits WHERE seen < datetime('now','-30 days')")
    @app.get('/api/visits')
    @admin
    def visits():
        with db() as conn:
            expire_visits(conn);return jsonify([dict(r) for r in conn.execute('SELECT * FROM visits ORDER BY id DESC LIMIT 1000')])
    @app.delete('/api/visits/<ident>')
    @admin
    def delete_visits(ident):
        with db() as conn:
            if ident=='all':conn.execute('DELETE FROM visits')
            else:conn.execute('DELETE FROM visits WHERE id=?',(ident,))
        return jsonify(ok=True)
    @app.delete('/api/visitors/<int:record_id>')
    @admin
    def delete_visitor(record_id):
        with write_lock,db() as conn:
            visitor=conn.execute('SELECT ip FROM visits WHERE id=?',(record_id,)).fetchone()
            if not visitor:abort(404,description='This visitor record no longer exists. Refresh the list.')
            deleted=conn.execute('DELETE FROM visits WHERE ip=?',(visitor['ip'],)).rowcount
        return jsonify(ok=True,deleted=deleted)
    @app.post('/api/visitors/<int:record_id>/block')
    @admin
    def block_visitor(record_id):
        if body().get('confirm') is not True:abort(400,description='Confirm that this action blocks future visits from this IP address.')
        with write_lock,db() as conn:
            visitor=conn.execute('SELECT ip FROM visits WHERE id=?',(record_id,)).fetchone()
            if not visitor:abort(404,description='This visitor record no longer exists. Refresh the list.')
            if visitor['ip']==client_ip():abort(400,description='You cannot block your current IP address because that would lock you out of BINGERET.')
            conn.execute("INSERT OR IGNORE INTO blocked_visitors(ip,blocked_at) VALUES(?,datetime('now'))",(visitor['ip'],))
        return jsonify(ok=True)
    @app.get('/api/blocks')
    @admin
    def list_blocks():
        with db() as conn:return jsonify([dict(row) for row in conn.execute('SELECT * FROM blocked_visitors ORDER BY id DESC')])
    @app.delete('/api/blocks/<int:block_id>')
    @admin
    def unblock_visitor(block_id):
        with write_lock,db() as conn:conn.execute('DELETE FROM blocked_visitors WHERE id=?',(block_id,))
        return jsonify(ok=True)
    @app.get('/media/<name>')
    def media(name):
        if not FILE_NAME.fullmatch(name):abort(404)
        with db() as conn:row=conn.execute('SELECT * FROM content WHERE file=? OR poster_file=?',(name,name)).fetchone()
        if (not row and not authorized()) or not (uploads/name).is_file():abort(404)
        filename=name
        if row:
            title=row['title']
            if row['format']=='Series' and row['season']:title+=f" - S{row['season']:02d}E{row['episode']:02d}"
            filename=(''.join(ch for ch in title if ch.isprintable() and ch not in '<>:"/\\|?*').strip(' .')[:160] or 'Binge download')+Path(name).suffix
        return send_file(uploads/name,as_attachment=request.args.get('download')=='1',download_name=filename,conditional=True,max_age=3600)
    @app.get('/')
    @app.get('/<path:asset>')
    def site(asset='index.html'):
        if asset in {'admin','admin/'}:asset='admin.html'
        target=(ROOT/asset).resolve()
        if ROOT not in target.parents or not target.is_file() or data in target.parents:abort(404)
        public={'index.html','admin.html','books.html','privacy.html','styles.css','manage.css','app.js','catalog.js','updates.js','site-settings.js','admin-nav.js','admin.js','books.js','episode-upload.js','favicon.svg','robots.txt'}
        if asset not in public and not (asset.startswith('pages/') and target.parent==ROOT/'pages' and target.suffix=='.html'):abort(404)
        if target.suffix=='.html' and target.name!='admin.html':
            with db() as conn:
                expire_visits(conn);conn.execute("INSERT INTO visits(ip,path,seen) VALUES(?,?,datetime('now'))",(client_ip(),request.path[:500]))
                conn.execute('DELETE FROM visits WHERE id NOT IN (SELECT id FROM visits ORDER BY id DESC LIMIT 10000)')
        return send_file(target,conditional=True,max_age=0)
    return app

def main():
    from waitress import serve
    logging.basicConfig(level=logging.INFO)
    app=create_app();port=int(os.environ.get('PORT','8000'))
    print(f'Binge ready at http://localhost:{port} — admin: /admin',flush=True)
    serve(app,host=os.environ.get('BINGE_HOST','127.0.0.1'),port=port,threads=8,max_request_body_size=app.config['MAX_CONTENT_LENGTH'],expose_tracebacks=False,channel_timeout=300,inbuf_overflow=1024**2)
