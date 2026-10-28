"""Local Flask development entry point. Render continues to use server.py."""
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
try:
    import flask
except ImportError:
    python = ROOT / '.venv' / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
    if python.is_file() and Path(sys.executable).resolve() != python.resolve():
        os.execv(str(python), [str(python), str(Path(__file__).resolve())])
    raise SystemExit('Run START.bat once to install dependencies, then run python app.py.')

if os.environ.get('BINGE_ENV') == 'production' or os.environ.get('RENDER') == 'true':
    raise SystemExit('Development mode is local only. Use python server.py in production.')

from production import create_app
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('BINGE_DEV_PORT', '5001'))
    if os.environ.get('WERKZEUG_RUN_MAIN') != 'true':
        print('\nBINGE — LOCAL DEVELOPMENT', flush=True)
        print(f'Editing folder: {ROOT}', flush=True)
        print(f'Website: http://localhost:{port}', flush=True)
        print(f'BINGERET admin: http://localhost:{port}/admin', flush=True)
        print('Python changes restart automatically. Refresh your browser after HTML, CSS or JavaScript edits.\n', flush=True)
    app.run(host='127.0.0.1', port=port, debug=False,
            use_reloader=os.environ.get('BINGE_RELOAD', '1') == '1', use_debugger=False)
