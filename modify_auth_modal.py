import re

modal_html = """
    <!-- Auth Modal -->
    <div id="auth-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] hidden flex items-center justify-center p-4 opacity-0 transition-opacity duration-300">
        <div class="glass-panel p-8 max-w-md w-full relative transform scale-95 transition-transform duration-300" id="auth-modal-content">
            <button onclick="closeAuthModal()" class="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">
                <i class="fa-solid fa-xmark"></i>
            </button>
            
            <div class="text-center mb-8">
                <h2 class="text-2xl font-bold gradient-text mb-2">Вход для своих</h2>
                <p class="text-gray-400 text-sm">Доступ только по приглашениям</p>
            </div>

            <!-- Login Form -->
            <form id="form-login" class="flex flex-col gap-4" onsubmit="handleLogin(event)">
                <div>
                    <label class="block text-xs text-gray-400 mb-1">Имя пользователя (Логин)</label>
                    <input type="text" id="login-username" required class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400" placeholder="Логин">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1">Пароль</label>
                    <input type="password" id="login-password" required class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400" placeholder="••••••••">
                </div>
                
                <div id="login-error" class="text-red-400 text-sm hidden">Неверный логин или пароль</div>
                <div id="login-success" class="text-green-400 text-sm hidden">Успешный вход!</div>
                
                <button type="submit" id="login-btn" class="w-full bg-sky-500 hover:bg-sky-400 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-lg shadow-sky-500/30 mt-2 flex justify-center items-center">
                    Войти
                </button>
            </form>
        </div>
    </div>
"""

auth_scripts = """
        function openAuthModal() {
            const modal = document.getElementById('auth-modal');
            const content = document.getElementById('auth-modal-content');
            modal.classList.remove('hidden');
            // trigger reflow
            void modal.offsetWidth;
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-95');
        }

        function closeAuthModal() {
            const modal = document.getElementById('auth-modal');
            const content = document.getElementById('auth-modal-content');
            modal.classList.add('opacity-0');
            content.classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
        
        async function handleLogin(e) {
            e.preventDefault();
            
            const btn = document.getElementById('login-btn');
            const errorMsg = document.getElementById('login-error');
            const successMsg = document.getElementById('login-success');
            
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            
            errorMsg.classList.add('hidden');
            successMsg.classList.add('hidden');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Вход...';
            btn.disabled = true;
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    successMsg.classList.remove('hidden');
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('username', data.username);
                    setTimeout(() => {
                        closeAuthModal();
                        window.location.reload();
                    }, 1000);
                } else {
                    errorMsg.textContent = data.message || 'Ошибка входа';
                    errorMsg.classList.remove('hidden');
                }
            } catch (err) {
                errorMsg.textContent = 'Ошибка соединения с сервером';
                errorMsg.classList.remove('hidden');
            } finally {
                btn.innerHTML = 'Войти';
                btn.disabled = false;
            }
        }
        
        // Update nav UI if logged in
        document.addEventListener('DOMContentLoaded', () => {
            const token = localStorage.getItem('token');
            const username = localStorage.getItem('username');
            
            if (token && username) {
                // Find all login links and replace them with username and logout
                const navLinks = document.querySelectorAll('a[onclick*="openAuthModal()"]');
                navLinks.forEach(link => {
                    link.innerHTML = `<i class="fa-solid fa-user mr-1"></i> ${username} (Выйти)`;
                    link.className = "nav-link text-sky-400";
                    link.onclick = (e) => {
                        e.preventDefault();
                        localStorage.removeItem('token');
                        localStorage.removeItem('username');
                        window.location.reload();
                    };
                });
            }
        });
        
        // Close modal on outside click
        document.getElementById('auth-modal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeAuthModal();
            }
        });
"""

files_to_update = ['index.html', 'work/index.html', 'diary/index.html', 'depressive-corner/index.html']

for filepath in files_to_update:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Replace the entire old Auth Modal
    modal_pattern = r'<!-- Auth Modal -->.*?</div>\s*</div>'
    content = re.sub(modal_pattern, modal_html.strip(), content, flags=re.DOTALL)
    
    # 2. Replace old scripts block
    script_pattern = r'function openAuthModal\(\) \{.*?\n        \}\);'
    content = re.sub(script_pattern, auth_scripts.strip(), content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Removed registration and added real login logic to frontend.")
