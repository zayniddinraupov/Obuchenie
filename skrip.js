// Глобальные переменные
var trainingData = [];
var trainers = [];
var currentSort = { column: null, direction: 'asc' };
var useFirebase = false;
var isFirebaseConfigured = false;
var actionHistory = []; // История действий

// Функция переключения боковой панели
function toggleSidebar() {
    var sidebar = document.getElementById('sidebar');
    var mainContent = document.querySelector('.main-content');
    var menuToggle = document.querySelector('.menu-toggle');
    
    if (sidebar) {
        sidebar.classList.toggle('hidden');
        if (mainContent) {
            mainContent.classList.toggle('full-width');
        }
        if (menuToggle) {
            menuToggle.style.display = sidebar.classList.contains('hidden') ? 'flex' : 'none';
        }
    }
}

function closeSidebarMobile() {
    var sidebar = document.getElementById('sidebar');
    if (window.innerWidth <= 1024 && sidebar) {
        sidebar.classList.remove('active');
    }
}

// Делаем функции глобальными для onclick
window.openModal = openModal;
window.closeModal = closeModal;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.deleteEmployee = deleteEmployee;
window.sortTable = sortTable;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.exportToCSV = exportToCSV;
window.printTable = printTable;
window.deleteAll = deleteAll;
window.toggleSidebar = toggleSidebar;
window.closeSidebarMobile = closeSidebarMobile;
window.showHistory = showHistory;
window.recoverFromFirebase = recoverFromFirebase;
window.recoverDeletedData = recoverDeletedData;
window.isAdmin = isAdmin;
window.canEdit = canEdit;
window.openAdminLogin = openAdminLogin;
window.closeAdminLogin = closeAdminLogin;
window.logoutAdmin = logoutAdmin;
window.updateAdminPanel = updateAdminPanel;
window.showNotification = showNotification;

// Админ
var adminName = "Раупов Зайниддин Абдураимович";
var adminCode = "3020";

// Супервайзеры
var supervisors = [
    { name: "Ахмедов Сардорбек Комилжон ўғли", id: "supervisor_1" },
    { name: "Ўлмасова Нигина Азизовна", id: "supervisor_2" },
    { name: "Носиров Жафар Носир ўғли", id: "supervisor_3" }
];

var currentSupervisor = null;

// Проверка: является ли текущий пользователь админом
function isAdmin() {
    return isAdminLoggedIn;
}

// Состояние админа
var isAdminLoggedIn = false;

// Функции выбора супервайзера
function openSupervisorSelect() {
    var modal = document.getElementById('supervisorModal');
    var list = document.getElementById('supervisorList');
    
    // Подсчитываем статистику для каждого супервайзера
    var stats = {};
    supervisors.forEach(function(s) { stats[s.id] = 0; });
    trainingData.forEach(function(item) {
        if (item.addedBy && stats[item.addedBy] !== undefined) stats[item.addedBy]++;
    });
    
    var html = '';
    
    // Кнопка "Все сотрудники" - показать всех
    html += '<button class="supervisor-option" onclick="selectSupervisor(\'all\')">';
    html += '<span><strong>🏠 Все сотрудники</strong></span>';
    html += '<span class="supervisor-count">' + trainingData.length + '</span>';
    html += '</button>';
    
    // Список супервайзеров
    supervisors.forEach(function(supervisor) {
        var count = stats[supervisor.id] || 0;
        html += '<button class="supervisor-option" onclick="selectSupervisor(\'' + supervisor.id + '\')">';
        html += '<span><strong>' + supervisor.name + '</strong></span>';
        html += '<span class="supervisor-count">' + count + '</span>';
        html += '</button>';
    });
    
    // Кнопка админа
    html += '<button class="supervisor-option admin" onclick="openAdminLogin(); closeSupervisorModal();">';
    html += '<span><strong>🔐 Админ-панель</strong></span>';
    html += '<span class="supervisor-count">👑</span>';
    html += '</button>';
    
    list.innerHTML = html;
    modal.classList.add('active');
}

function closeSupervisorModal() {
    document.getElementById('supervisorModal').classList.remove('active');
}

function selectSupervisor(supervisorId) {
    if (supervisorId === 'all') {
        // Показать всех
        currentSupervisor = 'all';
        isAdminLoggedIn = false;
    } else {
        currentSupervisor = supervisorId;
        isAdminLoggedIn = false;
    }
    
    closeSupervisorModal();
    applyFilters();
    updateStatsVisibility();
    updateAdminPanel();
    updateCurrentUserDisplay();
    
    // Показать уведомление
    if (currentSupervisor === 'all') {
        showNotification('Показаны все сотрудники');
    } else {
        var sup = supervisors.find(function(s) { return s.id === currentSupervisor; });
        if (sup) {
            var count = 0;
            trainingData.forEach(function(item) {
                if (item.addedBy === currentSupervisor) count++;
            });
            showNotification('Фильтр: ' + sup.name + ' (' + count + ' сотрудников)');
        }
    }
}
    
// Вход в админ-панель
function openAdminLogin() {
    document.getElementById('adminLoginModal').classList.add('active');
    document.getElementById('adminCodeInput').value = '';
    document.getElementById('adminCodeInput').focus();
}

function closeAdminLogin() {
    document.getElementById('adminLoginModal').classList.remove('active');
}

// Обработка входа админа
document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var code = document.getElementById('adminCodeInput').value;
    if (code === adminCode) {
        isAdminLoggedIn = true;
        currentSupervisor = 'all'; // Админ видит всех
        closeAdminLogin();
        updateAdminPanel();
        updateCurrentUserDisplay();
        applyFilters();
        showNotification('✅ Добро пожаловать, админ!');
    } else {
        alert('❌ Неверный код!');
    }
});

// Выход из админ-панели
function logoutAdmin() {
    isAdminLoggedIn = false;
    currentSupervisor = 'all'; // Возврат к просмотру всех
    updateAdminPanel();
    updateCurrentUserDisplay();
    applyFilters();
    showNotification('Вы вышли из админ-панели');
}

// Уведомление
function showNotification(message) {
    // Просто показываем alert
    alert(message);
}

// Обновление отображения текущего пользователя
function updateCurrentUserDisplay() {
    var display = document.getElementById('currentUserDisplay');
    var nameEl = document.getElementById('currentUserName');
    
    if (display && nameEl) {
        if (isAdminLoggedIn) {
            display.style.display = 'block';
            nameEl.textContent = '👑 Админ';
            nameEl.style.color = '#f59e0b';
        } else if (currentSupervisor && currentSupervisor !== 'all') {
            var sup = supervisors.find(function(s) { return s.id === currentSupervisor; });
            if (sup) {
                display.style.display = 'block';
                nameEl.textContent = sup.name;
                nameEl.style.color = '#00d9ff';
            } else {
                display.style.display = 'none';
            }
        } else {
            display.style.display = 'none';
        }
    }
}

// Обновление отображения админ-панели
function updateAdminPanel() {
    var loginBtn = document.getElementById('adminLoginBtn');
    var logoutBtn = document.getElementById('adminLogoutBtn');
    var adminItems = document.querySelectorAll('.admin-only');
    
    if (isAdminLoggedIn) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'flex';
        adminItems.forEach(function(btn) {
            btn.style.display = 'flex';
        });
    } else {
        if (loginBtn) loginBtn.style.display = 'flex';
        if (logoutBtn) logoutBtn.style.display = 'none';
        adminItems.forEach(function(btn) {
            btn.style.display = 'none';
        });
    }
}
    
// Проверка: может ли редактировать (только админ)
function canEdit(employee) {
    return isAdmin();
}

// Тренеры (только супервайзеры)
var defaultTrainers = [
    "Ахмедов Сардорбек Комилжон ўғли",
    "Ўлмасова Нигина Азизовна",
    "Носиров Жафар Носир ўғли"
];

// Данные по умолчанию (пустой список)
function getDefaultData() {
    return [];
}

// История действий
function logAction(action, employeeName, supervisorId) {
    var entry = {
        action: action,
        employee: employeeName,
        supervisor: supervisorId,
        supervisorName: getSupervisorName(supervisorId) || 'Админ',
        timestamp: new Date().toISOString()
    };
    actionHistory.unshift(entry);
    
    // Ограничиваем историю 50 записями
    if (actionHistory.length > 50) actionHistory = actionHistory.slice(0, 50);
    
    localStorage.setItem('actionHistory', JSON.stringify(actionHistory));
}

function loadActionHistory() {
    var history = localStorage.getItem('actionHistory');
    if (history) {
        try { actionHistory = JSON.parse(history); } catch (e) {}
    }
}

function showHistory() {
    if (actionHistory.length === 0) {
        alert('История действий пуста');
        return;
    }
    
    var html = '📋 История действий:\n\n';
    actionHistory.slice(0, 20).forEach(function(entry) {
        var date = new Date(entry.timestamp);
        var dateStr = date.toLocaleDateString('ru');
        var timeStr = date.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
        html += '[' + dateStr + ' ' + timeStr + '] ' + entry.supervisorName + ' - ' + entry.action + ': ' + entry.employee + '\n';
    });
    
    alert(html);
}

function getSupervisorName(supervisorId) {
    if (!supervisorId) return '';
    var sup = supervisors.find(function(s) { return s.id === supervisorId; });
    return sup ? sup.name : '';
}

function updateSidebarStats() {
    var totalEl = document.getElementById('statTotal');
    var todayEl = document.getElementById('statToday');
    
    // Подсчитываем данные с учётом текущего фильтра
    var filteredData = trainingData.slice();
    if (currentSupervisor && currentSupervisor !== 'all') {
        filteredData = filteredData.filter(function(item) { 
            return item.addedBy === currentSupervisor; 
        });
    }
    
    if (totalEl) {
        totalEl.textContent = filteredData.length;
    }
    
    if (todayEl) {
        var today = new Date();
        var todayStr = ('0' + today.getDate()).slice(-2) + '.' + ('0' + (today.getMonth() + 1)).slice(-2) + '.' + today.getFullYear();
        var countToday = 0;
        filteredData.forEach(function(item) {
            if (item.date === todayStr) countToday++;
        });
        todayEl.textContent = countToday;
    }
}

// Заглушки для обратной совместимости (удалены из основного кода)
function renderSupervisorStats() { /* устарела */ }
function updateStatsVisibility() { /* устарела */ }

// ==================== СТАТИСТИКА И ДИАГРАММА ====================

// Функция парсинга даты
function parseDate(dateStr) {
    if (!dateStr) return null;
    var parts = dateStr.split('.');
    if (parts.length === 3) {
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return null;
}

// Отображение статистики супервайзеров
function renderSupervisorStatsList() {
    var container = document.getElementById('supervisorStatsList');
    if (!container) return;
    
    // Маппинг имени тренера к ID супервайзера
    var trainerToSupervisor = {};
    supervisors.forEach(function(s) { 
        trainerToSupervisor[s.name] = s.id;
    });
    
    // Подсчитываем для каждого супервайзера
    var stats = {};
    supervisors.forEach(function(s) { 
        stats[s.id] = { count: 0, name: s.name, lastDate: null }; 
    });
    
    // Считаем по полю trainer (кто обучил) и определяем последнюю дату
    trainingData.forEach(function(item) {
        if (item.trainer && trainerToSupervisor[item.trainer]) {
            var supId = trainerToSupervisor[item.trainer];
            stats[supId].count++;
            
            // Сравниваем даты для определения последней
            var itemDate = parseDate(item.date);
            var lastDate = stats[supId].lastDate ? parseDate(stats[supId].lastDate) : null;
            
            if (!lastDate || (itemDate && itemDate > lastDate)) {
                stats[supId].lastDate = item.date;
            }
        }
    });
    
    // Сортируем по количеству
    var sorted = Object.keys(stats).sort(function(a, b) {
        return stats[b].count - stats[a].count;
    });
    
    var maxCount = 0;
    sorted.forEach(function(id) {
        if (stats[id].count > maxCount) maxCount = stats[id].count;
    });
    
    var html = '';
    sorted.forEach(function(id) {
        var item = stats[id];
        var percent = maxCount > 0 ? (item.count / maxCount * 100) : 0;
        var isCurrentUser = currentSupervisor === id;
        
        // Формируем дату последнего обучения
        var lastDateDisplay = item.lastDate ? item.lastDate : '—';
        
        html += '<div class="supervisor-stat-item' + (isCurrentUser ? ' active' : '') + '">';
        html += '<div class="supervisor-stat-name" onclick="showLastTrainingDate(\'' + id + '\')" title="Нажмите, чтобы увидеть дату последнего обучения">' + item.name + '</div>';
        html += '<div class="supervisor-last-date" id="lastDate-' + id + '">Посл. обучение: ' + lastDateDisplay + '</div>';
        html += '<div class="supervisor-stat-bar">';
        html += '<div class="supervisor-stat-fill" style="width:' + percent + '%"></div>';
        html += '</div>';
        html += '<div class="supervisor-stat-count">' + item.count + '</div>';
        html += '</div>';
    });
    
    container.innerHTML = html;
    
    // Рисуем диаграмму
    drawChart();
}

// Функция показа даты последнего обучения при клике
function showLastTrainingDate(supervisorId) {
    var sup = supervisors.find(function(s) { return s.id === supervisorId; });
    if (!sup) return;
    
    // Находим последнюю дату обучения для этого супервайзера
    var trainerToSupervisor = {};
    supervisors.forEach(function(s) { 
        trainerToSupervisor[s.name] = s.id;
    });
    
    var lastDate = null;
    var lastEmployee = '';
    
    trainingData.forEach(function(item) {
        if (item.trainer && trainerToSupervisor[item.trainer] === supervisorId) {
            var itemDate = parseDate(item.date);
            var currentLastDate = lastDate ? parseDate(lastDate) : null;
            
            if (!currentLastDate || (itemDate && itemDate > currentLastDate)) {
                lastDate = item.date;
                lastEmployee = item.name;
            }
        }
    });
    
    if (lastDate) {
        alert('📅 Последнее обучение:\n\n' + sup.name + '\nОбучил: ' + lastEmployee + '\nДата: ' + lastDate);
    } else {
        alert('📅 Последнее обучение:\n\n' + sup.name + '\n\nПока нет данных об обучении');
    }
}
    
// Делаем функцию глобальной
window.showLastTrainingDate = showLastTrainingDate;

// Функция сворачивания/разворачивания панели супервайзеров
function toggleSupervisorStats() {
    var list = document.getElementById('supervisorStatsList');
    var toggle = document.getElementById('supervisorStatsToggle');
    
    if (list.style.display === 'none') {
        list.style.display = 'block';
        toggle.textContent = '▼';
    } else {
        list.style.display = 'none';
        toggle.textContent = '▶';
    }
}
    
window.toggleSupervisorStats = toggleSupervisorStats;

// Функция переключения мобильного меню
function toggleMobileSidebar() {
    var sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
    }
}

window.toggleMobileSidebar = toggleMobileSidebar;

// Рисование диаграммы
function drawChart() {
    var canvas = document.getElementById('trainingChart');
    if (!canvas) return;
    
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    
    // Очищаем - заливаем тёмным фоном
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, height);
    
    // Подсчитываем по месяцам
    var months = {};
    var monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    
    trainingData.forEach(function(item) {
        if (item.date) {
            var parts = item.date.split('.');
            if (parts.length === 3) {
                var month = parseInt(parts[1]) - 1;
                var year = parts[2];
                var key = monthNames[month] + ' ' + year.slice(2);
                months[key] = (months[key] || 0) + 1;
            }
        }
    });
    
    // Берём последние 6 месяцев
    var labels = Object.keys(months).slice(-6);
    var data = labels.map(function(l) { return months[l]; });
    
    if (data.length === 0) {
        // Нет данных - показываем заглушку
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 12px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText('📊 Нет данных', width/2, height/2);
        return;
    }
    
    var maxVal = Math.max.apply(null, data);
    var barWidth = (width - 30) / data.length;
    var chartHeight = height - 30;
    
    // Яркие цвета для столбиков
    var colors = ['#00d9ff', '#00ff88', '#ffd700', '#ff6b6b', '#a855f7', '#f97316'];
    
    // Рисуем столбики
    data.forEach(function(val, i) {
        var barHeight = (val / maxVal) * chartHeight;
        var x = 15 + i * barWidth + 3;
        var y = height - 20 - barHeight;
        
        // Цвет столбика
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(x, y, barWidth - 6, barHeight);
        
        // Значение сверху
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText(val, x + (barWidth - 6) / 2, y - 3);
        
        // Подпись снизу
        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px Segoe UI';
        ctx.fillText(labels[i], x + (barWidth - 6) / 2, height - 5);
    });
}

// Основные функции
function openModal() {
    if (currentSupervisor) {
        var sup = supervisors.find(function(s) { return s.id === currentSupervisor; });
        if (sup) alert('Вы вошли как: ' + sup.name + '\nВы добавляете сотрудника от своего имени.');
    }
    document.getElementById('modalOverlay').classList.add('active');
    document.getElementById('trainingDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('trainingTime').value = "09:00";
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.getElementById('addForm').reset();
}

function openEditModal(id) {
    var employee = null;
    for (var i = 0; i < trainingData.length; i++) {
        if (trainingData[i].id === id) { employee = trainingData[i]; break; }
    }
    if (!employee) return;
    
    // Проверка: только админ или создатель может редактировать
    if (!canEdit(employee)) {
        var addedByName = getSupervisorName(employee.addedBy) || 'Админ';
        alert('⛔ Нельзя изменить!\n\nЭтого сотрудника добавил: ' + addedByName);
        return;
    }
    
    document.getElementById('editEmployeeId').value = employee.id;
    document.getElementById('editEmployeeName').value = employee.name;
    document.getElementById('editTrainingTheme').value = employee.theme;
    
    var dateParts = employee.date.split('.');
    document.getElementById('editTrainingDate').value = dateParts[2] + '-' + dateParts[1] + '-' + dateParts[0];
    document.getElementById('editTrainingTime').value = employee.time;
    
    populateTrainerSelect('editTrainerSelect', employee.trainer);
    populateAddedBySelect('editAddedBySelect', employee.addedBy);
    document.getElementById('editModalOverlay').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModalOverlay').classList.remove('active');
    document.getElementById('editForm').reset();
}

// Корзина для удалённых сотрудников
var trashBin = [];

// Удаление сотрудника (в корзину)
function deleteEmployee(id) {
    if (!trainingData || trainingData.length === 0) return;
    
    var employee = null;
    var index = -1;
    for (var i = 0; i < trainingData.length; i++) {
        if (trainingData[i].id === id) { employee = trainingData[i]; index = i; break; }
    }
    
    if (!employee) { alert('Сотрудник не найден'); return; }
    
    // Проверка: только админ может удалить
    if (!canEdit(employee)) {
        alert('⛔ Нельзя удалить!\nТолько админ может удалять сотрудников.');
        return;
    }
    
    // Защита от случайного удаления
    if (!confirm('Переместить в корзину сотрудника "' + employee.name + '"?')) {
        return;
    }
    
    // Добавляем в корзину с датой удаления
    employee.deletedAt = new Date().toISOString();
    trashBin.unshift(employee);
    
    // Ограничиваем корзину 50 записями
    if (trashBin.length > 50) trashBin = trashBin.slice(0, 50);
    localStorage.setItem('trashBin', JSON.stringify(trashBin));
    
    // Удаляем из основного списка
    trainingData.splice(index, 1);
    
    logAction('Удалён в корзину', employee.name, employee.addedBy);
    saveData();
    applyFilters();
    renderSupervisorStatsList();
    alert('Сотрудник перемещён в корзину. Вы можете восстановить его.');
}
    
// Восстановить из корзины
function restoreFromTrash(id) {
    var employee = null;
    var index = -1;
    for (var i = 0; i < trashBin.length; i++) {
        if (trashBin[i].id === id) { employee = trashBin[i]; index = i; break; }
    }
    
    if (!employee) { alert('Сотрудник не найден в корзине'); return; }
    
    // Удаляем дату удаления
    delete employee.deletedAt;
    
    // Возвращаем в основной список
    trainingData.unshift(employee);
    trashBin.splice(index, 1);
    
    localStorage.setItem('trashBin', JSON.stringify(trashBin));
    logAction('Восстановлен из корзины', employee.name, employee.addedBy);
    saveData();
    applyFilters();
    renderSupervisorStatsList();
    alert('Сотрудник восстановлен!');
}

// Показать корзину
function showTrash() {
    if (trashBin.length === 0) {
        alert('Корзина пуста');
        return;
    }
    
    var html = '🗑️ КОРЗИНА\n\n';
    trashBin.forEach(function(emp, i) {
        var date = emp.deletedAt ? new Date(emp.deletedAt).toLocaleString('ru') : '?';
        html += (i+1) + '. ' + emp.name + '\n   Дата удаления: ' + date + '\n\n';
    });
    html += '\nВведите номер для восстановления (или 0 для выхода):';
    
    var num = prompt(html);
    if (num && num > 0 && num <= trashBin.length) {
        restoreFromTrash(trashBin[num-1].id);
    }
}

// Загрузить корзину
function loadTrash() {
    var trash = localStorage.getItem('trashBin');
    if (trash) {
        try { trashBin = JSON.parse(trash); } catch (e) { trashBin = []; }
    }
}

// Очистить корзину
function emptyTrash() {
    if (trashBin.length === 0) {
        alert('Корзина уже пуста');
        return;
    }
    
    if (confirm('🗑️ Очистить корзину? Все сотрудники будут удалены безвозвратно!\n\nКоличество: ' + trashBin.length)) {
        trashBin = [];
        localStorage.setItem('trashBin', JSON.stringify(trashBin));
        alert('Корзина очищена');
    }
}
    
// Сортировка таблицы
function sortTable(column) {
    var headers = document.querySelectorAll('th.sortable');
    headers.forEach(function(h) { h.classList.remove('sort-asc', 'sort-desc'); });
    
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }
    
    var header = document.querySelector("th[onclick=\"sortTable('" + column + "')\"]");
    if (header) header.classList.add(currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc');
    
    trainingData.sort(function(a, b) {
        var valA = a[column], valB = b[column];
        if (column === 'date') {
            var dA = valA.split('.'), dB = valB.split('.');
            valA = new Date(dA[2], dA[1] - 1, dA[0]);
            valB = new Date(dB[2], dB[1] - 1, dB[0]);
        }
        if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });
    
    applyFilters();
}

// Применение фильтров
function applyFilters() {
    var filtered = trainingData.slice();
    
    // Фильтр по супервайзеру
    if (currentSupervisor && currentSupervisor !== 'all') {
        filtered = filtered.filter(function(item) { 
            return item.addedBy === currentSupervisor; 
        });
    }
    
    // Поиск
    var searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(function(item) {
            return item.name.toLowerCase().includes(searchTerm) ||
                   item.theme.toLowerCase().includes(searchTerm) ||
                   item.date.toLowerCase().includes(searchTerm) ||
                   item.trainer.toLowerCase().includes(searchTerm);
        });
    }
    
    // Дата от
    var dateFrom = document.getElementById('dateFrom').value;
    if (dateFrom) {
        var fromDate = new Date(dateFrom);
        filtered = filtered.filter(function(item) {
            var d = item.date.split('.');
            return new Date(d[2], d[1] - 1, d[0]) >= fromDate;
        });
    }
    
    // Дата до
    var dateTo = document.getElementById('dateTo').value;
    if (dateTo) {
        var toDate = new Date(dateTo);
        filtered = filtered.filter(function(item) {
            var d = item.date.split('.');
            return new Date(d[2], d[1] - 1, d[0]) <= toDate;
        });
    }
    
    renderTable(filtered);
    updateSidebarStats();
    renderSupervisorStatsList();
}

// Очистить фильтры
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    currentSort = { column: null, direction: 'asc' };
    var sortableHeaders = document.querySelectorAll('th.sortable');
    if (sortableHeaders) sortableHeaders.forEach(function(h) { h.classList.remove('sort-asc', 'sort-desc'); });
    applyFilters();
}

// Экспорт в CSV
function exportToCSV() {
    var filtered = trainingData.slice();
    
    var headers = ['№', 'Ф.И.О', 'Тема обучения', 'Дата', 'Время', 'Обучивший'];
    var rows = filtered.map(function(item) { 
        return [item.id, item.name, item.theme, item.date, item.time, item.trainer]; 
    });
    
    var csvContent = '\uFEFF';
    csvContent += headers.join(';') + '\n';
    rows.forEach(function(row) {
        csvContent += row.map(function(cell) {
            var str = String(cell || '');
            return (str.indexOf(';') !== -1 || str.indexOf('"') !== -1) ? '"' + str.replace(/"/g, '""') + '"' : str;
        }).join(';') + '\n';
    });
    
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'обучение_' + new Date().toISOString().split('T')[0] + '.csv';
    link.click();
}

// Печать
function printTable() { window.print(); }

// Удалить всех
function deleteAll() {
    if (confirm('⚠️ ВНИМАНИЕ! Вы собираетесь удалить ВСЕХ сотрудников.\n\nДля полного удаления нажмите "ОК".')) {
        localStorage.setItem('emergencyBackup', JSON.stringify(trainingData));
        trainingData = [];
        saveData();
        applyFilters();
        renderSupervisorStatsList();
        alert('⚠️ Все данные удалены.');
    }
}

// Заполнение списка тренеров
function populateTrainerSelect(selectId, selectedTrainer) {
    var select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Выберите сотрудника --</option>';
    trainers.forEach(function(trainer) {
        var option = document.createElement('option');
        option.value = trainer;
        option.textContent = trainer;
        if (trainer === selectedTrainer) option.selected = true;
        select.appendChild(option);
    });
}

// Заполнение списка "Кто добавил"
function populateAddedBySelect(selectId, selectedValue) {
    var select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Выберите --</option>';
    
    // Добавляем админа
    var adminOption = document.createElement('option');
    adminOption.value = 'admin';
    adminOption.textContent = '👑 Админ';
    if (selectedValue === 'admin') adminOption.selected = true;
    select.appendChild(adminOption);
    
    // Добавляем супервайзеров
    supervisors.forEach(function(supervisor) {
        var option = document.createElement('option');
        option.value = supervisor.id;
        option.textContent = supervisor.name;
        if (supervisor.id === selectedValue) option.selected = true;
        select.appendChild(option);
    });
}

// Сохранение данных
function saveData() {
    if (trainingData && trainingData.length >= 0) {
        // Всегда создаём резервную копию
        localStorage.setItem('emergencyBackup', JSON.stringify(trainingData));
        
        // История бэкапов (последние 5)
        var backups = JSON.parse(localStorage.getItem('backupHistory') || '[]');
        var today = new Date().toLocaleDateString('ru');
        if (backups.length === 0 || backups[0].date !== today) {
            backups.unshift({ date: today, data: JSON.stringify(trainingData) });
            if (backups.length > 5) backups = backups.slice(0, 5);
            localStorage.setItem('backupHistory', JSON.stringify(backups));
        }
        
        localStorage.setItem('trainingData', JSON.stringify(trainingData));
        localStorage.setItem('trainers', JSON.stringify(trainers));
        
        if (useFirebase) {
            try {
                saveDataToFirebase(trainingData);
                saveTrainersToFirebase(trainers);
            } catch (e) { 
                console.error('Firebase save error:', e); 
            }
        }
    }
}

// Рендер таблицы
function renderTable(data) {
    var tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-results">Ничего не найдено</td></tr>';
        return;
    }
    
    var html = '';
    data.forEach(function(item) {
        var canEditThis = canEdit(item);
        
        html += '<tr>';
        html += '<td class="row-number">' + item.id + '</td>';
        html += '<td><strong>' + item.name + '</strong></td>';
        html += '<td class="theme-cell">' + item.theme + '</td>';
        html += '<td class="date-cell">' + item.date + '</td>';
        html += '<td class="time-cell">' + item.time + '</td>';
        html += '<td><span class="trainer-badge">' + item.trainer + '</span></td>';
        html += '<td class="actions-cell">';
        
        if (canEditThis) {
            html += '<button class="edit-btn" onclick="openEditModal(' + item.id + ')">✏️</button>';
            html += '<button class="delete-btn" onclick="deleteEmployee(' + item.id + ')">🗑️</button>';
        } else {
            html += '<span style="color:#999;font-size:0.8rem" title="Только админ может редактировать">🔒</span>';
        }
        
        html += '</td></tr>';
    });
    tbody.innerHTML = html;
}

// Восстановить удалённые данные
function recoverDeletedData() {
    var emergency = localStorage.getItem('emergencyBackup');
    if (emergency) {
        try {
            var recovered = JSON.parse(emergency);
            if (recovered && recovered.length > 0) {
                trainingData = recovered;
                saveData();
                applyFilters();
                renderSupervisorStatsList();
                alert('Данные восстановлены! (' + recovered.length + ' сотрудников)');
                return true;
            }
        } catch (e) { console.error('Ошибка:', e); }
    }
    alert('Резервная копия не найдена.');
    return false;
}
    
// Восстановить из Firebase
function recoverFromFirebase() {
    if (useFirebase) {
        loadDataFromFirebase(function(fbData) {
            if (fbData && fbData.length > 0) {
                trainingData = fbData;
                saveData();
                applyFilters();
                renderSupervisorStatsList();
                alert('Данные восстановлены из Firebase! (' + fbData.length + ' сотрудников)');
            } else {
                alert('Данные в Firebase не найдены.');
            }
        });
    } else {
        alert('Firebase недоступен.');
    }
}

// Проверка Firebase
function initFirebaseCheck() {
    if (typeof firebase === 'undefined') return false;
    if (typeof initFirebase === 'function') {
        return initFirebase();
    }
    return false;
}

// Инициализация приложения
async function initializeApp() {
    // Загружаем корзину
    loadTrash();
    
    // Загружаем историю действий
    loadActionHistory();
    
    // Загружаем из localStorage
    var localData = localStorage.getItem('trainingData');
    var localTrainers = localStorage.getItem('trainers');
    
    if (localData) {
        try { trainingData = JSON.parse(localData); } catch (e) {}
    }
    if (localTrainers) {
        try { trainers = JSON.parse(localTrainers); } catch (e) {}
    }
    
    if (trainingData.length === 0) {
        trainingData = getDefaultData();
        trainers = defaultTrainers.slice();
    }
    
    // Показываем данные
    populateTrainerSelect('trainerSelect');
    populateAddedBySelect('addedBySelect');
    renderTable(trainingData);
    renderSupervisorStatsList();
    updateAdminPanel();
    updateCurrentUserDisplay();
    
    // Инициализируем Firebase
    var firebaseInit = initFirebaseCheck();
    if (firebaseInit) {
        useFirebase = true;
        
        setTimeout(function() {
            loadDataFromFirebase(function(fbData) {
                if (fbData && fbData.length > 0) {
                    if (JSON.stringify(fbData) !== JSON.stringify(trainingData)) {
                        trainingData = fbData;
                        localStorage.setItem('trainingData', JSON.stringify(trainingData));
                        applyFilters();
                        renderSupervisorStatsList();
                    }
                }
            });
        }, 500);
    }
    
    // Автообновление из Firebase
    if (useFirebase) {
        setInterval(function() {
            loadDataFromFirebase(function(fbData) {
                if (fbData && fbData.length > 0) {
                    if (JSON.stringify(fbData) !== JSON.stringify(trainingData)) {
                        trainingData = fbData;
                        localStorage.setItem('trainingData', JSON.stringify(trainingData));
                        applyFilters();
                        renderSupervisorStatsList();
                    }
                }
            });
        }, 5000);
    }
}

// Обработчики событий
document.addEventListener('DOMContentLoaded', function() {
    // Поиск
    var searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    
    // Закрытие модальных окон
    var modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) modalOverlay.addEventListener('click', function(e) { 
        if (e.target === modalOverlay) closeModal(); 
    });
    
    var editModalOverlay = document.getElementById('editModalOverlay');
    if (editModalOverlay) editModalOverlay.addEventListener('click', function(e) { 
        if (e.target === editModalOverlay) closeEditModal(); 
    });
    
    var supervisorModal = document.getElementById('supervisorModal');
    if (supervisorModal) supervisorModal.addEventListener('click', function(e) { 
        if (e.target === supervisorModal) closeSupervisorModal(); 
    });
    
    // Форма добавления
    var addForm = document.getElementById('addForm');
    if (addForm) {
        addForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            var name = document.getElementById('employeeName').value.trim();
            var theme = document.getElementById('trainingTheme').value.trim();
            var dateInput = document.getElementById('trainingDate').value;
            var time = document.getElementById('trainingTime').value;
            var trainer = document.getElementById('trainerSelect').value;
            
            var dateParts = dateInput.split('-');
            var formattedDate = dateParts[2] + '.' + dateParts[1] + '.' + dateParts[0];
            
            var newId = trainingData.length > 0 ? Math.max.apply(null, trainingData.map(function(item) { return item.id; })) + 1 : 1;
            
            trainingData.unshift({
                id: newId, name: name, theme: theme, date: formattedDate, time: time, trainer: trainer
            });
            
            logAction('Добавлен', name, 'admin');
            
            if (trainers.indexOf(trainer) === -1) {
                trainers.push(trainer);
                populateTrainerSelect('trainerSelect');
            }
            
            saveData();
            applyFilters();
            renderSupervisorStatsList();
            closeModal();
            alert('Сотрудник добавлен!');
        });
    }
    
    // Форма редактирования
    var editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            var id = parseInt(document.getElementById('editEmployeeId').value);
            var name = document.getElementById('editEmployeeName').value.trim();
            var theme = document.getElementById('editTrainingTheme').value.trim();
            var dateInput = document.getElementById('editTrainingDate').value;
            var time = document.getElementById('editTrainingTime').value;
            var trainer = document.getElementById('editTrainerSelect').value;
            
            var dateParts = dateInput.split('-');
            var formattedDate = dateParts[2] + '.' + dateParts[1] + '.' + dateParts[0];
            
            var index = -1;
            for (var i = 0; i < trainingData.length; i++) {
                if (trainingData[i].id === id) { index = i; break; }
            }
            
            if (index !== -1) {
                var oldName = trainingData[index].name;
                trainingData[index] = { id: id, name: name, theme: theme, date: formattedDate, time: time, trainer: trainer };
                
                if (oldName !== name) {
                    logAction('Изменён', oldName + ' → ' + name, 'admin');
                }
                
                if (trainers.indexOf(trainer) === -1) {
                    trainers.push(trainer);
                    populateTrainerSelect('trainerSelect');
                }
                
                saveData();
                applyFilters();
                renderSupervisorStatsList();
            }
            
            closeEditModal();
            alert('Данные обновлены!');
        });
    }
    
    // Форма входа админа
    var adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var code = document.getElementById('adminCodeInput').value;
            if (code === adminCode) {
                isAdminLoggedIn = true;
                currentSupervisor = 'all';
                closeAdminLogin();
                updateAdminPanel();
                updateCurrentUserDisplay();
                applyFilters();
                showNotification('✅ Добро пожаловать, админ!');
            } else {
                alert('❌ Неверный код!');
            }
        });
    }
});

// Запуск после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

