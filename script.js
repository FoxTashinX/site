// Close modal on outside click
document.getElementById('auth-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeAuthModal();
    }
});

const defaultContent = `
<div class="glass-panel p-10 md:p-16 max-w-3xl w-full mb-12">
    <h1 class="text-4xl md:text-6xl font-extrabold mb-6">Добро пожаловать в моё <span class="gradient-text">Портфолио</span></h1>
    <p class="text-lg text-gray-300 mb-8 leading-relaxed">
        Здесь собраны мои лучшие работы, мысли, творческие эксперименты и личный опыт. 
        Исследуйте проекты и следите за моей активностью!
    </p>
    <div class="flex justify-center gap-4">
        <a href="#" onclick="event.preventDefault(); openAuthModal();" class="bg-sky-500 hover:bg-sky-400 text-white font-semibold py-3 px-8 rounded-full transition-colors shadow-lg shadow-sky-500/30">
            Войти в систему
        </a>
    </div>
</div>

<div id="projects" class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
    <a href="https://www.youtube.com/@foxytashin1036" target="_blank" class="glass-panel p-8 card-hover flex flex-col items-center text-center group cursor-pointer decoration-none text-white">
        <div class="text-red-500 text-5xl mb-4 group-hover:scale-110 transition-transform">
            <i class="fa-brands fa-youtube"></i>
        </div>
        <h2 class="text-2xl font-bold mb-2">YouTube Канал</h2>
        <p class="text-gray-400 text-sm">Мои видео-проекты, нарезки и творческие эксперименты.</p>
    </a>
    <a href="https://www.twitch.tv/foxtashin" target="_blank" class="glass-panel p-8 card-hover flex flex-col items-center text-center group cursor-pointer decoration-none text-white">
        <div class="text-purple-500 text-5xl mb-4 group-hover:scale-110 transition-transform">
            <i class="fa-brands fa-twitch"></i>
        </div>
        <h2 class="text-2xl font-bold mb-2">Twitch Трансляции</h2>
        <p class="text-gray-400 text-sm">Прямые эфиры, игры и интерактивное общение со зрителями.</p>
    </a>
</div>`;

const recruiterContent = `
<div class="glass-panel p-8 w-full max-w-4xl mb-8 text-left">
    <h2 class="text-3xl font-bold mb-6 gradient-text">Мои задачи (Рекрутер)</h2>
    <form id="activity-form" class="mb-8" onsubmit="logActivity(event)">
        <div class="flex flex-col gap-4">
            <div>
                <label class="block text-sm text-gray-400 mb-1">Тип задачи</label>
                <select id="act-type" class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-400">
                    <option value="Обзвон" class="bg-gray-800 text-white">Обзвон</option>
                    <option value="Реклама" class="bg-gray-800 text-white">Реклама</option>
                    <option value="Удаление уволенных" class="bg-gray-800 text-white">Удаление людей (уволились)</option>
                    <option value="Проверка состава" class="bg-gray-800 text-white">Проверка соответствия состава с игрой</option>
                </select>
            </div>
            <div>
                <label class="block text-sm text-gray-400 mb-1">Описание (необязательно)</label>
                <textarea id="act-desc" rows="3" class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-400"></textarea>
            </div>
            <button type="submit" class="bg-sky-500 hover:bg-sky-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors w-fit">
                Записать активность
            </button>
            <div id="act-status" class="text-sm mt-2 hidden"></div>
        </div>
    </form>
    
    <h3 class="text-xl font-bold mb-4">История активностей</h3>
    <div id="activity-list" class="space-y-4">
        <p class="text-gray-400 text-sm">Загрузка...</p>
    </div>
</div>
`;

const chiefContent = `
<div class="glass-panel p-8 w-full max-w-4xl mb-8 text-left">
    <h2 class="text-3xl font-bold mb-6 gradient-text">Сотрудники и Зарплаты (Chief)</h2>
    <div class="mb-8">
        <p class="text-gray-300 text-sm mb-4">Здесь вы можете отслеживать активность рекрутов и рассчитывать им зарплату.</p>
        <button onclick="loadActivities()" class="bg-sky-500 hover:bg-sky-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm">
            Обновить данные
        </button>
    </div>
    
    <div class="overflow-x-auto">
        <table class="w-full text-sm text-left text-gray-300">
            <thead class="text-xs text-gray-400 uppercase bg-white/5 border-b border-white/10">
                <tr>
                    <th scope="col" class="px-6 py-3">Дата</th>
                    <th scope="col" class="px-6 py-3">Рекрутер</th>
                    <th scope="col" class="px-6 py-3">Тип</th>
                    <th scope="col" class="px-6 py-3">Описание</th>
                </tr>
            </thead>
            <tbody id="chief-activity-list">
                <tr><td colspan="4" class="px-6 py-4 text-center">Загрузка...</td></tr>
            </tbody>
        </table>
    </div>
</div>
`;

// Build Nav
function buildNav(user) {
    const nav = document.getElementById('main-nav');
    if (!user) {
        nav.innerHTML = `
            <li><a href="index.html" class="nav-link active"><i class="fa-solid fa-house mr-1"></i> Главная</a></li>
            <li><a href="#" onclick="event.preventDefault(); openAuthModal();" class="nav-link text-sky-400"><i class="fa-solid fa-right-to-bracket mr-1"></i> Войти</a></li>
        `;
        return;
    }

    let links = `<li><a href="#" onclick="event.preventDefault(); renderView('${user.role}');" class="nav-link active"><i class="fa-solid fa-house mr-1"></i> Дашборд</a></li>`;
    
    if (user.role === 'chief') {
        links += `<li><a href="#" onclick="event.preventDefault(); renderView('chief');" class="nav-link"><i class="fa-solid fa-users mr-1"></i> Сотрудники</a></li>`;
    } else if (user.role === 'recruiter') {
        links += `<li><a href="#" onclick="event.preventDefault(); renderView('recruiter');" class="nav-link"><i class="fa-solid fa-list-check mr-1"></i> Мои задачи</a></li>`;
    }

    links += `<li><a href="#" onclick="event.preventDefault(); logout();" class="nav-link text-red-400"><i class="fa-solid fa-right-from-bracket mr-1"></i> Выйти (${user.username})</a></li>`;
    nav.innerHTML = links;
}

// Render Content
function renderView(role) {
    const main = document.getElementById('main-content');
    if (!role) {
        main.innerHTML = defaultContent;
    } else if (role === 'chief') {
        main.innerHTML = chiefContent;
        loadActivities();
    } else if (role === 'recruiter') {
        main.innerHTML = recruiterContent;
        loadActivities();
    }
}

// Auth state
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        buildNav(null);
        renderView(null);
        return;
    }

    try {
        const res = await fetch('/api/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const user = await res.json();
            buildNav(user);
            renderView(user.role);
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            buildNav(null);
            renderView(null);
        }
    } catch (e) {
        buildNav(null);
        renderView(null);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.reload();
}

// API Calls
async function logActivity(e) {
    e.preventDefault();
    const type = document.getElementById('act-type').value;
    const desc = document.getElementById('act-desc').value;
    const status = document.getElementById('act-status');
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch('/api/activities', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ type, description: desc })
        });
        
        if (res.ok) {
            status.textContent = 'Успешно сохранено!';
            status.className = 'text-green-400 text-sm mt-2 block';
            document.getElementById('act-desc').value = '';
            loadActivities();
        } else {
            status.textContent = 'Ошибка сохранения.';
            status.className = 'text-red-400 text-sm mt-2 block';
        }
    } catch (err) {
        status.textContent = 'Ошибка сети.';
        status.className = 'text-red-400 text-sm mt-2 block';
    }
    setTimeout(() => { status.classList.add('hidden'); }, 3000);
}

async function loadActivities() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('/api/activities', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const acts = await res.json();
            const chiefList = document.getElementById('chief-activity-list');
            const recList = document.getElementById('activity-list');
            
            if (chiefList) {
                if (acts.length === 0) {
                    chiefList.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center">Нет активностей</td></tr>';
                    return;
                }
                chiefList.innerHTML = acts.map(a => `
                    <tr class="border-b border-white/5 hover:bg-white/5">
                        <td class="px-6 py-4 whitespace-nowrap">${new Date(a.date).toLocaleString('ru-RU')}</td>
                        <td class="px-6 py-4 font-medium text-white">${a.username}</td>
                        <td class="px-6 py-4">${a.type}</td>
                        <td class="px-6 py-4">${a.description}</td>
                    </tr>
                `).join('');
            }
            
            if (recList) {
                if (acts.length === 0) {
                    recList.innerHTML = '<p class="text-gray-400 text-sm">Вы еще не добавили ни одной задачи.</p>';
                    return;
                }
                recList.innerHTML = acts.map(a => `
                    <div class="bg-white/5 border border-white/10 p-4 rounded-lg">
                        <div class="flex justify-between items-start mb-2">
                            <span class="font-bold text-sky-400">${a.type}</span>
                            <span class="text-xs text-gray-500">${new Date(a.date).toLocaleString('ru-RU')}</span>
                        </div>
                        <p class="text-sm text-gray-300">${a.description || 'Нет описания'}</p>
                    </div>
                `).join('');
            }
        }
    } catch(e) {
        console.error(e);
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});
