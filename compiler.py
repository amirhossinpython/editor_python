import subprocess
import sys
import os
from io import StringIO
import contextlib
import tempfile

@contextlib.contextmanager
def temp_python_script(code):
    with tempfile.NamedTemporaryFile(suffix='.py', delete=False) as f:
        f.write(code.encode('utf-8'))
        f.flush()
        yield f.name
    os.unlink(f.name)

def execute_python_code(code, user_input=''):
    result = {
        'output': '',
        'error': '',
        'exit_code': 0,
        'success': False
    }
    
    try:
        with temp_python_script(code) as script_path:
            process = subprocess.Popen(
                [sys.executable, '-u', script_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            if user_input:
                try:
                    process.stdin.write(user_input + '\n')
                    process.stdin.flush()
                except BrokenPipeError:
                    pass
            
            stdout, stderr = process.communicate()
            
            result['output'] = stdout
            result['error'] = stderr
            result['exit_code'] = process.returncode
            result['success'] = process.returncode == 0
            
    except Exception as e:
        result['error'] = str(e)
    
    return result