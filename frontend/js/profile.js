document.addEventListener('DOMContentLoaded', function() {
    // Элементы
    const tabProfile = document.getElementById('tabProfile');
    const tabFavorites = document.getElementById('tabFavorites');
    const logoutButton = document.getElementById('logoutButton');
    
    // Инициализация
    checkAuth();
    setupEventListeners();
    
    // Проверяем URL параметр
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tab') === 'favorites') {
        showTab('favorites');
    }

    function setupEventListeners() {
        tabProfile.addEventListener('click', () => showTab('profile'));
        tabFavorites.addEventListener('click', () => showTab('favorites'));
        logoutButton.addEventListener('click', logout);
    }

    function checkAuth() {
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = 'auth.html';
            return;
        }
        loadProfile();
    }

    async function loadProfile() {
        try {
            const user = await api.getCurrentUser();
            displayProfile(user);
        } catch (error) {
            UIUtils.showNotification('Ошибка загрузки профиля', 'error');
            setTimeout(() => window.location.href = 'auth.html', 2000);
        }
    }

    function displayProfile(user) {
        document.getElementById('fullName').textContent = user.full_name || 'Не указано';
        document.getElementById('username').textContent = user.username;
        document.getElementById('email').textContent = user.email;
        
        const createdDate = new Date(user.created_at);
        document.getElementById('createdAt').textContent = 
            createdDate.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
    }

    function showTab(tabName) {
        // Обновляем кнопки
        tabProfile.className = tabName === 'profile' ? 'tab-active px-6 py-3 text-lg' : 'tab-inactive px-6 py-3 text-lg';
        tabFavorites.className = tabName === 'favorites' ? 'tab-active px-6 py-3 text-lg' : 'tab-inactive px-6 py-3 text-lg';
        
        // Показываем контент
        document.getElementById('profileContent').classList.toggle('hidden', tabName !== 'profile');
        document.getElementById('favoritesContent').classList.toggle('hidden', tabName !== 'favorites');
        
        if (tabName === 'favorites') {
            loadFavorites();
        }
    }

    async function loadFavorites() {
        const container = document.getElementById('favoritesList');
        
        try {
            container.innerHTML = `
                <div class="text-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p class="mt-2 text-gray-600">Загрузка...</p>
                </div>
            `;
            
            const favorites = await api.getFavorites();
            displayFavorites(favorites);
            
        } catch (error) {
            container.innerHTML = `
                <div class="text-center py-8 text-red-500">
                    <p>Ошибка загрузки избранного</p>
                    <button onclick="window.location.reload()" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Повторить</button>
                </div>
            `;
        }
    }

    function displayFavorites(favorites) {
        const container = document.getElementById('favoritesList');
        
        if (!favorites || favorites.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <i class="far fa-heart text-4xl mb-4"></i>
                    <p>У вас пока нет избранных мест</p>
                    <p class="text-sm mt-2">Добавляйте места во время планирования поездок</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = favorites.map(fav => `
            <div class="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50">
                <div class="flex items-center">
                    <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-500 mr-3">
                        <i class="fas fa-heart"></i>
                    </div>
                    <div>
                        <h5 class="font-bold text-gray-800">${fav.place.name}</h5>
                        <p class="text-gray-500 text-sm">${fav.place.type}</p>
                        <p class="text-gray-400 text-xs">Добавлено: ${new Date(fav.created_at).toLocaleDateString('ru-RU')}</p>
                    </div>
                </div>
                <div>
                    <button onclick="window.removeFavorite(${fav.place_id}, '${fav.place.name.replace(/'/g, "\\'")}')" 
                            class="px-3 py-1 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm">
                        <i class="fas fa-trash mr-1"></i>Удалить
                    </button>
                </div>
            </div>
        `).join('');
    }

    async function removeFavorite(placeId, placeName) {
        const confirmed = await UIUtils.confirm(`Удалить "${placeName}" из избранного?`, 'Подтверждение удаления');
        if (!confirmed) return;
        
        try {
            await api.removeFavorite(placeId);
            UIUtils.showNotification('Удалено из избранного', 'success');
            loadFavorites();
        } catch (error) {
            UIUtils.showNotification('Ошибка удаления', 'error');
        }
    }

    function logout() {
        localStorage.removeItem('access_token');
        UIUtils.showNotification('Вы вышли из системы', 'info');
        setTimeout(() => window.location.href = 'index.html', 1000);
    }

    // Экспорт в глобальную область
    window.removeFavorite = removeFavorite;
});