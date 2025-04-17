class PythonCompiler {
    constructor() {
        this.editor = null;
        this.terminal = document.getElementById('terminal-output');
        this.isWaitingForInput = false;
        this.inputBuffer = [];
        
        this.initEditor();
        this.initEvents();
    }

    initEditor() {
        this.editor = CodeMirror.fromTextArea(
            document.getElementById('python-editor'), 
            {
                mode: 'python',
                theme: 'dracula',
                lineNumbers: true,
                indentUnit: 4,
                tabSize: 4,
                matchBrackets: true,
                extraKeys: {
                    'Ctrl-Enter': () => this.runCode(),
                    'Ctrl-S': () => this.saveCode(),
                    'Shift-Enter': () => this.focusInput()
                }
            }
        );
    }

    initEvents() {
        document.getElementById('run-btn').addEventListener('click', () => this.runCode());
        document.getElementById('save-btn').addEventListener('click', () => this.saveCode());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearEditor());
        document.getElementById('clear-terminal').addEventListener('click', () => this.clearTerminal());
        document.getElementById('submit-input').addEventListener('click', () => this.submitInput());
        document.getElementById('user-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitInput();
        });
    }

    async runCode() {
        const code = this.editor.getValue();
        this.printToTerminal(`$ python script.py`, 'command');
        
        try {
            const response = await fetch('/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            
            const result = await response.json();
            
            if (result.error) {
                this.printToTerminal(result.error, 'error');
            } else {
                this.printToTerminal(result.output, 'output');
                
                if (result.output.includes('input()') || 
                    result.output.toLowerCase().includes('enter')) {
                    this.showInputPrompt();
                }
            }
        } catch (error) {
            this.printToTerminal(`Error: ${error.message}`, 'error');
        }
    }

    printToTerminal(text, type = 'output') {
        const div = document.createElement('div');
        div.className = type;
        div.textContent = text;
        this.terminal.appendChild(div);
        this.terminal.scrollTop = this.terminal.scrollHeight;
    }

    showInputPrompt() {
        this.isWaitingForInput = true;
        document.getElementById('input-panel').classList.remove('hidden');
        document.getElementById('user-input').focus();
    }

    hideInputPrompt() {
        this.isWaitingForInput = false;
        document.getElementById('input-panel').classList.add('hidden');
        document.getElementById('user-input').value = '';
    }

    async submitInput() {
        const input = document.getElementById('user-input').value;
        this.printToTerminal(input, 'input');
        
        try {
            const response = await fetch('/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: this.editor.getValue(),
                    input: input
                })
            });
            
            const result = await response.json();
            
            if (result.error) {
                this.printToTerminal(result.error, 'error');
            } else {
                this.printToTerminal(result.output, 'output');
            }
        } catch (error) {
            this.printToTerminal(`Error: ${error.message}`, 'error');
        }
        
        this.hideInputPrompt();
    }

    focusInput() {
        if (this.isWaitingForInput) {
            document.getElementById('user-input').focus();
        }
    }

    clearTerminal() {
        this.terminal.innerHTML = '';
    }

    clearEditor() {
        if (confirm('Are you sure you want to clear the editor?')) {
            this.editor.setValue('');
        }
    }

    async saveCode() {
        const title = prompt('Enter a title for your code:', 'Python Script');
        if (!title) return;
        
        try {
            const response = await fetch('/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title,
                    code: this.editor.getValue()
                })
            });
            
            const result = await response.json();
            if (result.status === 'success') {
                this.printToTerminal(`Code saved successfully (ID: ${result.code_id})`, 'success');
            }
        } catch (error) {
            this.printToTerminal(`Error saving code: ${error}`, 'error');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PythonCompiler();
});