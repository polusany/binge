from pathlib import Path
import os
import sys

if __name__ == '__main__':
    try:
        import flask
        import waitress
    except ImportError:
        local = Path(__file__).resolve().parent / '.venv' / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
        if local.is_file() and Path(sys.executable).resolve() != local.resolve():
            os.execv(str(local), [str(local), str(Path(__file__).resolve())])
        raise SystemExit('Dependencies are missing. Run START.bat on Windows, or install requirements.txt in a virtual environment.')
    from production import main
    main()
else:
    from production import create_app
