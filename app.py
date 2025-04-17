from flask import Flask, render_template, request, jsonify
from compiler import execute_python_code
from database import save_code, get_recent_codes
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

@app.route('/')
def home():
    recent_codes = get_recent_codes()
    return render_template('index.html', recent_codes=recent_codes)

@app.route('/editor')
def editor():
    return render_template('editor.html')

@app.route('/execute', methods=['POST'])
def execute():
    data = request.get_json()
    code = data.get('code', '')
    user_input = data.get('input', '')
    
    result = execute_python_code(code, user_input)
    return jsonify(result)

@app.route('/save', methods=['POST'])
def save():
    data = request.get_json()
    title = data.get('title', 'Untitled')
    code = data.get('code', '')
    
    code_id = save_code(title, code)
    return jsonify({
        'status': 'success',
        'code_id': code_id,
        'message': 'Code saved successfully'
    })

if __name__ == '__main__':
    app.run(debug=True)