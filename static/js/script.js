document.addEventListener('DOMContentLoaded', function() {
    // فقط اگر در صفحه ادیتور هستیم این کدها را اجرا کن
    if (document.getElementById('pythonCode')) {
        const editor = document.getElementById('pythonCode');
        const highlightedCode = document.getElementById('highlighted-code');
        const lineNumbers = document.querySelector('.line-numbers');
        const runButton = document.getElementById('runCode');
        const saveButton = document.getElementById('saveCode');
        const clearButton = document.getElementById('clearCode');
        const clearTerminalButton = document.getElementById('clearTerminal');
        const terminalOutput = document.getElementById('terminalOutput');
        
        // شماره خطوط
        function updateLineNumbers() {
            const lines = editor.value.split('\n');
            lineNumbers.innerHTML = '';
            
            for (let i = 0; i < lines.length; i++) {
                const lineNumber = document.createElement('div');
                lineNumber.textContent = i + 1;
                lineNumbers.appendChild(lineNumber);
            }
        }
        
        // هایلایت سینتکس
        function highlightSyntax() {
            highlightedCode.textContent = editor.value;
            hljs.highlightElement(highlightedCode);
        }
        
        // رویدادهای ادیتور
        editor.addEventListener('input', function() {
            updateLineNumbers();
            highlightSyntax();
        });
        
        // اجرای کد
        runButton.addEventListener('click', function() {
            const code = editor.value;
            
            fetch('/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: code }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    terminalOutput.innerHTML += `<div class="error">${data.output}</div>`;
                } else {
                    terminalOutput.innerHTML += `<div class="output">${data.output}</div>`;
                }
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
            })
            .catch(error => {
                terminalOutput.innerHTML += `<div class="error">خطا در ارتباط با سرور: ${error}</div>`;
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
            });
        });
        
        // ذخیره کد
        saveButton.addEventListener('click', function() {
            const codeId = 'python_code_' + Date.now();
            const code = editor.value;
            
            fetch('/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: codeId, code: code }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    terminalOutput.innerHTML += `<div class="success">کد با موفقیت ذخیره شد (ID: ${codeId})</div>`;
                    terminalOutput.scrollTop = terminalOutput.scrollHeight;
                }
            })
            .catch(error => {
                terminalOutput.innerHTML += `<div class="error">خطا در ذخیره کد: ${error}</div>`;
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
            });
        });
        
        // پاک‌کردن ادیتور
        clearButton.addEventListener('click', function() {
            if (confirm('آیا از پاک‌کردن کد مطمئن هستید؟')) {
                editor.value = '';
                updateLineNumbers();
                highlightSyntax();
            }
        });
        
        // پاک‌کردن ترمینال
        clearTerminalButton.addEventListener('click', function() {
            terminalOutput.innerHTML = '';
        });
        
        // مقداردهی اولیه
        updateLineNumbers();
        highlightSyntax();
    }
    
    // انیمیشن کارت‌ها
    const languageCards = document.querySelectorAll('.language-card');
    languageCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});