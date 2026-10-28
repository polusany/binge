"""Run: python -m unittest -v test_release. Uses isolated temporary data."""
import json, os, sqlite3, tempfile, unittest
from contextlib import closing
from pathlib import Path
from production import create_app

PASSWORD='Only-for-isolated-test-123'
PNG=b'\x89PNG\r\n\x1a\n'+b'example-image'

class ReleaseTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(ignore_cleanup_errors=True)
        self.config=dict(DATA_DIR=self.temp.name,ADMIN_PASSWORD=PASSWORD,PRODUCTION=False,SECURE_COOKIES=False,TESTING=True)
        self.app=create_app(self.config);self.client=self.app.test_client()
    def tearDown(self):self.temp.cleanup()
    def post(self,path,value=None,**kwargs):
        headers={'X-Binge-Request':'1',**kwargs.pop('headers',{})}
        return self.client.post(path,data=json.dumps(value) if value is not None else kwargs.pop('data',None),headers=headers,**kwargs)
    def login(self):
        response=self.post('/api/login',dict(username='BINGERET',password=PASSWORD))
        self.assertEqual(response.status_code,200);self.assertTrue(response.json['authenticated']);return response
    def upload(self,kind='video',filename='test.mp4',payload=b'video bytes'):
        response=self.post('/api/upload',data=payload,headers={'X-Kind':kind,'X-Filename':filename})
        self.assertEqual(response.status_code,201,response.json);return response.json['file']
    def save(self,**values):
        response=self.post('/api/content',dict(kind='video',title='Series',format='Series',season=1,episode=1,section='tv-series',year=2026,**values))
        return response
    def test_admin_edits_existing_content_and_replaces_files(self):
        self.login()
        for index,(kind,filename,payload) in enumerate([('video','film.mp4',b'video one'),('book','book.pdf',b'%PDF-1.4 original'),('story','story.txt',b'original story')]):
            file=self.upload(kind,filename,payload);poster=self.upload('poster','old.png',PNG)
            value=dict(kind=kind,title='Original '+kind,file=file,poster_file=poster,section='movies',year=2025,genre='Drama',description='Original description')
            ident=self.post('/api/content',value).json['id']
            value.update(id=ident,title='Edited '+kind,description='Edited description',year=2026,genre='Family')
            response=self.post('/api/content',value);self.assertEqual(response.status_code,200);self.assertEqual(response.json['id'],ident)
            rows=self.client.get('/api/content').json;self.assertEqual(len(rows),index+1)
            saved=next(x for x in rows if x['id']==ident)
            self.assertEqual(saved['title'],'Edited '+kind);self.assertEqual(saved['file'],file);self.assertEqual(saved['poster_file'],poster)
            replacement=self.upload(kind,filename,payload+b' replacement');new_poster=self.upload('poster','new.png',PNG+b'new')
            value.update(file=replacement,poster_file=new_poster)
            self.assertEqual(self.post('/api/content',value).status_code,200)
            self.assertEqual(self.client.get('/media/'+file).status_code,404)
            self.assertEqual(self.client.get('/media/'+poster).status_code,404)
            download=self.client.get('/media/'+replacement+'?download=1');self.assertEqual(download.data,payload+b' replacement');download.close()
            saved=next(x for x in self.client.get('/api/content').json if x['id']==ident)
            self.assertEqual(saved['file'],replacement);self.assertEqual(saved['poster_file'],new_poster)

    def test_delete_one_record_or_all_records_for_visitor(self):
        headers={'X-Binge-Request':'1'}
        self.assertEqual(self.client.delete('/api/visitors/1',headers=headers).status_code,401)
        self.login()
        with closing(sqlite3.connect(self.app.config['DATABASE'])) as conn,conn:
            for ip,path in [('192.0.2.1','/'),('192.0.2.1','/books.html'),('192.0.2.1','/pages/movies.html'),('192.0.2.2','/')]:
                conn.execute("INSERT INTO visits(ip,path,seen) VALUES(?,?,datetime('now'))",(ip,path))
        records=self.client.get('/api/visits').json
        visitor=[row for row in records if row['ip']=='192.0.2.1']
        self.assertEqual(self.client.delete('/api/visits/'+str(visitor[0]['id']),headers=headers).status_code,200)
        self.assertEqual(len(self.client.get('/api/visits').json),3)
        deleted=self.client.delete('/api/visitors/'+str(visitor[1]['id']),headers=headers)
        self.assertEqual(deleted.json['deleted'],2)
        remaining=self.client.get('/api/visits').json
        self.assertEqual(len(remaining),1);self.assertEqual(remaining[0]['ip'],'192.0.2.2')
        self.assertEqual(self.client.delete('/api/visitors/'+str(visitor[1]['id']),headers=headers).status_code,404)

    def test_block_visitor_confirmation_enforcement_persistence_and_unblock(self):
        headers={'X-Binge-Request':'1'}
        self.assertEqual(self.client.get('/api/blocks').status_code,401)
        self.assertEqual(self.post('/api/visitors/1/block',{'confirm':True}).status_code,401)
        self.login()
        with closing(sqlite3.connect(self.app.config['DATABASE'])) as conn,conn:
            ident=conn.execute("INSERT INTO visits(ip,path,seen) VALUES('198.51.100.42','/',datetime('now'))").lastrowid
            own=conn.execute("INSERT INTO visits(ip,path,seen) VALUES('127.0.0.1','/',datetime('now'))").lastrowid
        self.assertEqual(self.post('/api/visitors/'+str(ident)+'/block',{'confirm':False}).status_code,400)
        self.assertEqual(self.client.get('/api/blocks').json,[])
        self.assertEqual(self.post('/api/visitors/'+str(own)+'/block',{'confirm':True}).status_code,400)
        self.assertEqual(self.post('/api/visitors/'+str(ident)+'/block',{'confirm':True}).status_code,200)
        visitor=create_app(self.config).test_client()
        for path in ['/','/books.html','/api/content','/admin','/media/example.mp4']:
            response=visitor.get(path,environ_overrides={'REMOTE_ADDR':'198.51.100.42'})
            self.assertEqual(response.status_code,403,path)
        self.assertEqual(visitor.get('/healthz',environ_overrides={'REMOTE_ADDR':'198.51.100.42'}).status_code,200)
        self.client.delete('/api/visits/'+str(ident),headers=headers)
        self.assertEqual(visitor.get('/',environ_overrides={'REMOTE_ADDR':'198.51.100.42'}).status_code,403)
        block=self.client.get('/api/blocks').json[0]
        self.assertEqual(self.client.delete('/api/blocks/'+str(block['id']),headers=headers).status_code,200)
        response=visitor.get('/',environ_overrides={'REMOTE_ADDR':'198.51.100.42'});self.assertEqual(response.status_code,200);response.close()
        self.assertEqual(self.client.get('/api/blocks').json,[])

    def test_public_notices_and_social_settings_admin_publish_persist_and_hide(self):
        initial=self.client.get('/api/site-settings').json
        self.assertFalse(initial['notice']['enabled']);self.assertEqual(initial['socials'],{})
        value={'notice':{'enabled':True,'title':'New this weekend','message':'New episodes on Friday.\nStay tuned!'},'social_heading':'Follow Binge','socials':{'telegram':'@binge_updates','x':'@bingeret','tiktok':'@binge','whatsapp':'+234 800 123 4567'}}
        self.assertEqual(self.post('/api/site-settings',value).status_code,401)
        self.login();self.assertEqual(self.post('/api/site-settings',value).status_code,200)
        saved=self.client.get('/api/site-settings').json
        self.assertEqual(saved['notice']['title'],value['notice']['title']);self.assertEqual(saved['socials']['telegram'],'https://t.me/binge_updates')
        self.assertEqual(saved['socials']['x'],'https://x.com/bingeret');self.assertEqual(saved['socials']['whatsapp'],'https://wa.me/2348001234567')
        self.assertEqual(create_app(self.config).test_client().get('/api/site-settings').json,saved)
        for bad in ['javascript:alert(1)','https://attacker.example/profile','http://x.com/binge','https://x.com@attacker.example/binge']:
            value['socials']={'x':bad};self.assertEqual(self.post('/api/site-settings',value).status_code,400)
        value['socials']={};value['notice']['enabled']=False
        self.assertEqual(self.post('/api/site-settings',value).status_code,200)
        cleared=self.client.get('/api/site-settings').json;self.assertEqual(cleared['socials'],{});self.assertFalse(cleared['notice']['enabled'])
        value['notice']={'enabled':True,'message':''};self.assertEqual(self.post('/api/site-settings',value).status_code,400)

    def test_protected_and_private_routes(self):
        self.assertEqual(self.client.get('/api/visits').status_code,401)
        for route in ['/server.py','/production.py','/data/binge.sqlite3','/render.yaml','/requirements.txt','/maintenance.py','/../production.py','/.env','/test_release.py']:
            self.assertEqual(self.client.get(route).status_code,404,route)
        self.assertEqual(self.client.get('/healthz').json,{'status':'ok'})
        response=self.client.get('/admin');self.assertEqual(response.status_code,200);response.close()
    def test_login_response_cookie_and_restart(self):
        response=self.login()
        self.assertEqual(int(response.headers['Content-Length']),len(response.data))
        self.assertIn('HttpOnly',response.headers['Set-Cookie']);self.assertIn('SameSite=Strict',response.headers['Set-Cookie'])
        raw=self.client.get_cookie('binge_session').value
        restarted=create_app(self.config).test_client();restarted.set_cookie('binge_session',raw)
        self.assertTrue(restarted.get('/api/session').json['authenticated'])
        self.post('/api/logout');self.assertFalse(self.client.get('/api/session').json['authenticated'])
    def test_rate_limit_and_wrong_password(self):
        for _ in range(10):self.assertEqual(self.post('/api/login',dict(username='BINGERET',password='wrong')).status_code,401)
        self.assertEqual(self.post('/api/login',dict(username='BINGERET',password=PASSWORD)).status_code,429)
        restarted=create_app(self.config).test_client()
        self.assertEqual(restarted.post('/api/login',json=dict(username='BINGERET',password=PASSWORD),headers={'X-Binge-Request':'1'}).status_code,429)
    def test_csrf_and_invalid_json(self):
        self.assertEqual(self.client.post('/api/login',json={}).status_code,403)
        self.assertEqual(self.post('/api/login',{},headers={'Origin':'https://attacker.example'}).status_code,403)
        response=self.post('/api/login',data=b'not-json');self.assertEqual(response.status_code,400);self.assertIn('error',response.json)
        self.assertEqual(self.post('/api/login',[]).status_code,400)
    def test_45_distinct_episode_uploads_and_downloads(self):
        self.login()
        for episode in range(1,46):
            file=self.upload(payload=f'episode-{episode}'.encode())
            response=self.post('/api/content',dict(kind='video',title='Series',format='Series',season=2,episode=episode,section='tv-series',file=file))
            self.assertEqual(response.status_code,200,response.json)
        records=self.client.get('/api/content').json
        self.assertEqual(len(records),45);self.assertEqual(len({r['file'] for r in records}),45)
        for episode in (1,23,45):
            row=next(r for r in records if r['episode']==episode)
            response=self.client.get('/media/'+row['file']+'?download=1')
            self.assertEqual(response.data,f'episode-{episode}'.encode());self.assertIn('attachment',response.headers['Content-Disposition'])
            self.assertIn(f'S02E{episode:02}',response.headers['Content-Disposition']);response.close()
    def test_poster_books_stories_and_byte_ranges(self):
        self.login();poster=self.upload('poster','cover.png',PNG);video=self.upload(payload=b'0123456789')
        response=self.save(file=video,poster_file=poster);self.assertEqual(response.status_code,200)
        media=self.client.get('/media/'+video,headers={'Range':'bytes=2-5'});self.assertEqual(media.status_code,206);self.assertEqual(media.data,b'2345');media.close()
        head=self.client.head('/media/'+video);self.assertEqual(head.status_code,200);self.assertEqual(head.data,b'');self.assertEqual(head.headers['Content-Length'],'10');head.close()
        for kind,name,payload in [('book','book.pdf',b'%PDF-1.4 example'),('story','story.txt',b'Once upon a time')]:
            file=self.upload(kind,name,payload)
            self.assertEqual(self.post('/api/content',dict(kind=kind,title=name,file=file)).status_code,200)
    def test_invalid_uploads_and_storage_limit(self):
        self.login()
        self.assertEqual(self.post('/api/upload',data=b'bad',headers={'X-Kind':'poster','X-Filename':'cover.png'}).status_code,400)
        self.assertEqual(self.post('/api/upload',data=b'bad',headers={'X-Kind':'book','X-Filename':'book.pdf'}).status_code,400)
        self.assertEqual(self.post('/api/upload',data=b'<script>',headers={'X-Kind':'poster','X-Filename':'bad.svg'}).status_code,400)
        self.app.config['MAX_STORAGE_BYTES']=1
        self.assertEqual(self.post('/api/upload',data=b'abc',headers={'X-Kind':'video','X-Filename':'movie.mp4'}).status_code,507)
    def test_idempotency_and_duplicate_episode(self):
        self.login();file=self.upload();first=self.save(file=file)
        self.assertEqual(self.save(file=file).json['id'],first.json['id'])
        another=self.upload();self.assertEqual(self.save(file=another).status_code,409)
        self.assertEqual(len(self.client.get('/api/content').json),1)
    def test_delete_preserves_shared_poster(self):
        self.login();poster=self.upload('poster','cover.png',PNG);ids=[]
        for episode in (1,2):
            file=self.upload();value=dict(kind='video',title='Series',format='Series',season=1,episode=episode,file=file,poster_file=poster)
            ids.append(self.post('/api/content',value).json['id'])
        self.client.delete('/api/content/'+ids[0],headers={'X-Binge-Request':'1'})
        response=self.client.get('/media/'+poster);self.assertEqual(response.status_code,200);response.close()
        self.client.delete('/api/content/'+ids[1],headers={'X-Binge-Request':'1'})
        self.assertEqual(self.client.get('/media/'+poster).status_code,404)
    def test_log_retention_and_delete(self):
        self.login();self.client.get('/').close();self.client.get('/books.html').close()
        with closing(sqlite3.connect(self.app.config['DATABASE'])) as c, c:c.execute("INSERT INTO visits(ip,path,seen) VALUES('old','/',datetime('now','-31 days'))")
        visits=self.client.get('/api/visits').json;self.assertEqual(len(visits),2)
        self.client.delete('/api/visits/'+str(visits[0]['id']),headers={'X-Binge-Request':'1'})
        self.assertEqual(len(self.client.get('/api/visits').json),1)
        self.client.delete('/api/visits/all',headers={'X-Binge-Request':'1'});self.assertEqual(self.client.get('/api/visits').json,[])
    def test_security_headers_and_no_demo(self):
        response=self.client.get('/');self.assertIn("script-src 'self'",response.headers['Content-Security-Policy'])
        response.close();self.assertEqual(response.headers['Cache-Control'],'no-store');self.assertFalse(self.client.get('/api/config').json['show_demo'])
        secure=create_app({**self.config,'SECURE_COOKIES':True}).test_client()
        response=secure.post('/api/login',json=dict(username='BINGERET',password=PASSWORD),headers={'X-Binge-Request':'1'})
        self.assertIn('Secure',response.headers['Set-Cookie'])
    def test_production_missing_password_fails_clearly(self):
        with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as empty:
            with self.assertRaisesRegex(RuntimeError,'BINGE_ADMIN_PASSWORD'):
                create_app({**self.config,'DATA_DIR':empty,'PRODUCTION':True,'ADMIN_PASSWORD':None})
    def test_backup_restore_and_cleanup(self):
        from unittest.mock import patch
        import maintenance, zipfile
        self.login();file=self.upload();self.save(file=file)
        with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as output:
            backup=Path(output)/'backup.zip'
            with patch.dict(os.environ,{'BINGE_DATA_DIR':self.temp.name}), patch('sys.argv',['maintenance.py','backup','--output',str(backup)]):maintenance.main()
            with zipfile.ZipFile(backup) as archive:
                self.assertIn('binge.sqlite3',archive.namelist());self.assertIn('uploads/'+file,archive.namelist())
                restored=Path(output)/'restored';archive.extractall(restored)
            restored_app=create_app({**self.config,'DATA_DIR':str(restored)})
            self.assertEqual(len(restored_app.test_client().get('/api/content').json),1)
            old=Path(self.temp.name)/'uploads'/'orphan.mp4';old.write_bytes(b'orphan');os.utime(old,(1,1))
            with patch.dict(os.environ,{'BINGE_DATA_DIR':self.temp.name}),patch('sys.argv',['maintenance.py','cleanup']):maintenance.main()
            self.assertFalse(old.exists());self.assertTrue((Path(self.temp.name)/'uploads'/file).exists())
    def test_legacy_database_migration(self):
        with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as legacy:
            with closing(sqlite3.connect(Path(legacy)/'binge.sqlite3')) as c, c:
                c.execute('CREATE TABLE content(id TEXT PRIMARY KEY,kind TEXT,title TEXT,description TEXT,genre TEXT,section TEXT,format TEXT,year INTEGER,author TEXT,file TEXT,extension TEXT)')
                c.execute("INSERT INTO content VALUES('old','video','Old title','','Drama','movies','Movie',2026,'','legacy.mp4','.mp4')")
            app=create_app({**self.config,'DATA_DIR':legacy});row=app.test_client().get('/api/content').json[0]
            self.assertEqual(row['id'],'old');self.assertEqual(row['poster_file'],'')

if __name__=='__main__':unittest.main()
