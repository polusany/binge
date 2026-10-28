"""Offline maintenance. Stop Binge before backup, cleanup, or password reset."""
import argparse, getpass, hashlib, os, secrets, sqlite3, time, zipfile
from contextlib import closing
from pathlib import Path

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command',choices=['backup','cleanup','reset-password'])
    parser.add_argument('--output',help='Destination ZIP file for backup')
    args=parser.parse_args()
    data=Path(os.environ.get('BINGE_DATA_DIR',str(Path(__file__).parent/'data'))).resolve()
    if not (data/'binge.sqlite3').is_file():parser.error('No existing Binge database in the configured data directory.')
    conn=sqlite3.connect(data/'binge.sqlite3')
    try:
        if args.command=='reset-password':
            password=getpass.getpass('New BINGERET password (12+ characters): ')
            if len(password)<12 or password!=getpass.getpass('Confirm password: '):parser.error('Passwords must match and contain 12+ characters.')
            salt=secrets.token_hex(16);digest=hashlib.pbkdf2_hmac('sha256',password.encode(),salt.encode(),300000).hex()
            conn.execute("UPDATE settings SET value=? WHERE key='password'",(salt+':'+digest,));conn.execute('DELETE FROM sessions');conn.commit()
            print('Password changed. All admin sessions revoked.')
        elif args.command=='cleanup':
            referenced={name for row in conn.execute('SELECT file,poster_file FROM content') for name in row if name}
            removed=0
            for file in (data/'uploads').iterdir():
                if file.is_file() and file.name not in referenced and file.stat().st_mtime<time.time()-86400:
                    file.unlink();removed+=1
            print(f'Removed {removed} unreferenced uploads older than 24 hours.')
        else:
            if not args.output:parser.error('Supply --output with a private backup ZIP destination.')
            output=Path(args.output).resolve()
            if data==output or data in output.parents:parser.error('Store backups outside the data directory.')
            if output.exists():parser.error('Backup destination already exists; choose another filename.')
            output.parent.mkdir(parents=True,exist_ok=True)
            snapshot=output.with_suffix('.sqlite-snapshot')
            try:
                with closing(sqlite3.connect(snapshot)) as copy:conn.backup(copy)
                with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED) as archive:
                    archive.write(snapshot,'binge.sqlite3')
                    for file in (data/'uploads').iterdir():
                        if file.is_file():archive.write(file,'uploads/'+file.name)
                print('Backup created. It contains private data; keep it outside the public repository.')
            finally:snapshot.unlink(missing_ok=True)
    finally:conn.close()

if __name__=='__main__':main()
