// js/definite.js
document.addEventListener('DOMContentLoaded', function() {
    // ========== КОНСТАНТЫ И ПЕРЕМЕННЫЕ ==========
    let currentCity = null;
    let selectedPlaces = [];
    let allPlaces = [];
    
    // Типы мест
    const placeTypes = {
        restaurant: { icon: 'fa-utensils', color: 'text-red-500', bg: 'bg-red-100' },
        museum: { icon: 'fa-landmark', color: 'text-blue-500', bg: 'bg-blue-100' },
        landmark: { icon: 'fa-monument', color: 'text-green-500', bg: 'bg-green-100' },
        park: { icon: 'fa-tree', color: 'text-emerald-500', bg: 'bg-emerald-100' },
        shopping: { icon: 'fa-shopping-bag', color: 'text-purple-500', bg: 'bg-purple-100' },
        cafe: { icon: 'fa-coffee', color: 'text-amber-500', bg: 'bg-amber-100' }
    };

    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    init();

    function init() {
        checkAuth();
        loadCities();
        updateProgress(1);
        setupEventListeners();
    }

    function setupEventListeners() {
        // Поиск города
        document.getElementById('searchButton').addEventListener('click', searchCity);
        document.getElementById('citySearch').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchCity();
        });
        
        // Применение фильтров
        document.getElementById('applyFiltersButton').addEventListener('click', applyFilters);
        
        // Генерация плана
        document.getElementById('generatePlanButton').addEventListener('click', generatePlan);
    }

    // ========== АВТОРИЗАЦИЯ ==========
    function checkAuth() {
        const token = localStorage.getItem('access_token');
        const container = document.getElementById('authContainer');
        
        if (token) {
            // Если авторизован - показываем имя пользователя
            api.getCurrentUser()
                .then(user => {
                    container.innerHTML = `
                        <div class="flex items-center space-x-3">
                            <span class="text-white/90">Привет, ${user.username}!</span>
                            <a href="profile.html" class="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-full hover:bg-white/30">
                                <i class="fas fa-user mr-2"></i>Профиль
                            </a>
                        </div>
                    `;
                })
                .catch(() => {
                    // Если ошибка - удаляем токен
                    localStorage.removeItem('access_token');
                    showGuestButton(container);
                });
        } else {
            // Если не авторизован - просто кнопка входа
            showGuestButton(container);
        }
    }

    // ========== ФУНКЦИИ ДЛЯ ГОРОДОВ ==========
    async function loadCities() {
        const container = document.getElementById('citiesContainer');
        
        try {
            const cities = await api.getCities();
            
            if (cities.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-center py-8">Нет городов в базе</p>';
                return;
            }
            
            container.innerHTML = cities.map(city => `
                <div class="card-hover bg-white border rounded-xl p-5 hover:border-purple-300">
                    <div class="flex items-start mb-3">
                        <div class="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center text-white mr-4">
                            <i class="fas fa-city"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-gray-800">${city.name}</h4>
                            <p class="text-gray-500 text-sm">${city.climate}</p>
                        </div>
                    </div>
                    <p class="text-gray-600 text-sm mb-4 line-clamp-2">${city.description || ''}</p>
                    <button onclick="window.selectCity(${city.id}, '${city.name}')" 
                            class="w-full gradient-bg text-white py-2 rounded-lg font-medium hover:opacity-90">
                        Выбрать
                    </button>
                </div>
            `).join('');
            
        } catch (error) {
            container.innerHTML = `
                <div class="col-span-2 text-center py-8">
                    <p class="text-red-500">Ошибка загрузки: ${error.message}</p>
                    <button onclick="window.loadCities()" class="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg">
                        Повторить
                    </button>
                </div>
            `;
        }
    }

    function showGuestButton(container) {
        container.innerHTML = `
            <a href="auth.html" class="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-full hover:bg-white/30">
                Войти
            </a>
        `;
    }

    async function searchCity() {
        const input = document.getElementById('citySearch');
        const result = document.getElementById('searchResult');
        const query = input.value.trim();
        
        if (!query) {
            result.innerHTML = '<span class="text-red-500">Введите название</span>';
            return;
        }
        
        try {
            result.innerHTML = '<span class="text-blue-500"><i class="fas fa-spinner fa-spin mr-2"></i>Поиск...</span>';
            const cities = await api.getCities(query);
            
            if (cities.length === 0) {
                result.innerHTML = `<span class="text-gray-600">"${query}" не найден</span>`;
            } else if (cities.length === 1) {
                const city = cities[0];
                result.innerHTML = `
                    <span class="text-green-600">Найден: ${city.name}</span>
                    <button onclick="window.selectCity(${city.id}, '${city.name}')" 
                            class="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                        Выбрать
                    </button>
                `;
            } else {
                result.innerHTML = `
                    <span class="text-green-600">Найдено ${cities.length} городов:</span>
                    <div class="mt-2 space-y-1">
                        ${cities.map(city => `
                            <div class="flex justify-between">
                                <span>${city.name}</span>
                                <button onclick="window.selectCity(${city.id}, '${city.name}')" 
                                        class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Выбрать
                                </button>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        } catch (error) {
            result.innerHTML = `<span class="text-red-500">Ошибка: ${error.message}</span>`;
        }
    }

    function selectCity(id, name) {
        currentCity = { id, name };
        document.getElementById('selectedCity').textContent = name;
        
        // Переход к шагу 2
        document.getElementById('step1Section').classList.add('hidden');
        document.getElementById('step2Section').classList.remove('hidden');
        updateProgress(2);
    }

    // ========== ФУНКЦИИ ДЛЯ МЕСТ ==========
    function applyFilters() {
        // Получаем выбранные типы
        const checkboxes = document.querySelectorAll('#step2Section input[type="checkbox"]:checked');
        const types = Array.from(checkboxes).map(cb => cb.value);
        
        // Переход к шагу 3
        document.getElementById('step2Section').classList.add('hidden');
        document.getElementById('step3Section').classList.remove('hidden');
        updateProgress(3);
        
        // Загружаем места
        loadPlaces(types);
    }

    async function loadPlaces(types = []) {
        const container = document.getElementById('placesContainer');
        const countElement = document.getElementById('placesCount');
        
        try {
            // ГРУЗИМ МЕСТА - ЭТО НЕ ТРЕБУЕТ АВТОРИЗАЦИИ
            allPlaces = await api.getCityPlaces(currentCity.id);
            
            // Фильтруем по типам если выбраны
            let filteredPlaces = allPlaces;
            if (types.length > 0) {
                filteredPlaces = allPlaces.filter(p => types.includes(p.type));
            }
            
            countElement.textContent = `Найдено ${filteredPlaces.length} мест`;
            
            if (filteredPlaces.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8">
                        <p class="text-gray-500">Нет мест по выбранным фильтрам</p>
                        <button onclick="window.goBackToFilters()" class="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg">
                            Изменить фильтры
                        </button>
                    </div>
                `;
                return;
            }
            
            // ПРОВЕРЯЕМ ИЗБРАННОЕ ТОЛЬКО ЕСЛИ АВТОРИЗОВАН
            const token = localStorage.getItem('access_token');
            let placesWithFavorites;
            
            if (token) {
                // Если авторизован - пробуем проверить избранное
                placesWithFavorites = await Promise.all(
                    filteredPlaces.map(async (place) => {
                        try {
                            const favData = await api.checkFavorite(place.id);
                            return { place, isFavorite: favData.is_favorite };
                        } catch (error) {
                            // Если ошибка при проверке избранного - просто показываем не избранным
                            return { place, isFavorite: false };
                        }
                    })
                );
            } else {
                // Если не авторизован - просто места
                placesWithFavorites = filteredPlaces.map(place => ({ place, isFavorite: false }));
            }
            
            // Отображаем места
            container.innerHTML = placesWithFavorites.map(({ place, isFavorite }) => {
                const type = placeTypes[place.type] || { icon: 'fa-map-marker', color: 'text-gray-500', bg: 'bg-gray-100' };
                const stars = '★'.repeat(Math.floor(place.rating)) + '☆'.repeat(5 - Math.floor(place.rating));
                
                return `
                    <div class="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50">
                        <div class="flex items-center">
                            <div class="w-12 h-12 ${type.bg} rounded-lg flex items-center justify-center ${type.color} mr-4">
                                <i class="fas ${type.icon}"></i>
                            </div>
                            <div>
                                <h5 class="font-bold text-gray-800">${place.name}</h5>
                                <p class="text-gray-500 text-sm">${place.type}</p>
                                <div class="text-yellow-500 text-sm">${stars} ${place.rating.toFixed(1)}</div>
                            </div>
                        </div>
                        <div>
                            <button onclick="window.toggleFavorite(${place.id}, '${place.name.replace(/'/g, "\\'")}')" 
                                    class="flex items-center space-x-1 ${isFavorite ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600 hover:bg-red-200'} px-3 py-2 rounded-lg">
                                <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                                <span>${token ? (isFavorite ? 'В избранном' : 'В избранное') : 'В избранное'}</span>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
            
        } catch (error) {
            // ЕСЛИ ОШИБКА ПРИ ЗАГРУЗКЕ МЕСТ - просто показываем сообщение
            console.error('Ошибка загрузки мест:', error);
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-red-500">Ошибка загрузки мест</p>
                    <p class="text-gray-500 text-sm mt-2">Попробуйте позже</p>
                </div>
            `;
        }
    }

    async function toggleFavorite(placeId, placeName) {
        const token = localStorage.getItem('access_token');
        
        // Если не авторизован - предлагаем войти
        if (!token) {
            const confirmed = await UIUtils.confirm(
                'Чтобы добавить место в избранное, нужно войти в систему. Перейти на страницу входа?',
                'Требуется авторизация'
            );
            
            if (confirmed) {
                // Сохраняем текущую страницу для возврата
                sessionStorage.setItem('returnUrl', window.location.href);
                window.location.href = 'auth.html';
            }
            return;
        }
        
        try {
            // Проверяем, есть ли уже в избранном
            const favData = await api.checkFavorite(placeId);
            
            if (!favData.is_favorite) {
                // Добавляем в избранное
                await api.addFavorite(placeId);
                UIUtils.showNotification(`"${placeName}" добавлено в избранное! ❤️`, 'success');
            } else {
                // Удаляем из избранного
                await api.removeFavorite(placeId);
                UIUtils.showNotification(`"${placeName}" удалено из избранного`, 'info');
            }
            
            // Перезагружаем список мест
            const checkboxes = document.querySelectorAll('#step2Section input[type="checkbox"]:checked');
            const types = Array.from(checkboxes).map(cb => cb.value);
            loadPlaces(types);
            
        } catch (error) {
            // Если ошибка авторизации - предлагаем войти заново
            if (error.message.includes('Неавторизованный доступ')) {
                UIUtils.showNotification('Сессия истекла. Войдите заново', 'error');
                localStorage.removeItem('access_token');
                setTimeout(() => window.location.href = 'auth.html', 1500);
            } else {
                UIUtils.showNotification('Ошибка при работе с избранным', 'error');
            }
        }
    }

    function goBackToStep0() {
        // На шаге 1 уже ничего, это начало
    }

    function goBackToStep1() {
        // Возвращаемся к выбору города
        document.getElementById('step2Section').classList.add('hidden');
        document.getElementById('step1Section').classList.remove('hidden');
        updateProgress(1);
        
        // Сбрасываем выбранный город
        currentCity = null;
        document.getElementById('selectedCity').textContent = '';
    }

    function goBackToStep2() {
        // Возвращаемся к фильтрам
        document.getElementById('step3Section').classList.add('hidden');
        document.getElementById('step2Section').classList.remove('hidden');
        updateProgress(2);
        
        // Сбрасываем выбранные места
        selectedPlaces = [];
        document.getElementById('selectedCount').textContent = '0';
    }

    function goBackToFilters() {
        document.getElementById('step3Section').classList.add('hidden');
        document.getElementById('step2Section').classList.remove('hidden');
        updateProgress(2);
    }

    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
    function updateProgress(step) {
        // Обновляем индикаторы шагов
        document.querySelectorAll('.step-indicator div').forEach((div, index) => {
            div.className = index < step ? 'step-active w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2' 
                                       : 'step-inactive w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2';
        });
        
        // Обновляем текст
        document.querySelectorAll('.step-indicator span').forEach((span, index) => {
            span.className = index < step ? 'text-sm font-medium' : 'text-sm text-gray-500';
        });
        
        // Обновляем прогресс-бар
        document.getElementById('progressBar').style.width = `${step * 33}%`;
    }

    function generatePlan() {
        if (selectedPlaces.length === 0) {
            UIUtils.showNotification('Добавьте хотя бы одно место', 'info');
            return;
        }
        
        const plan = `
            🗺️ План путешествия в ${currentCity.name}
            
            📍 Выбрано мест: ${selectedPlaces.length}
            
            🎯 Маршрут:
            ${selectedPlaces.map((p, i) => `${i+1}. ${p.name}`).join('\n')}
            
            💡 Совет: Распределите места логично по дням!
        `;
        
        alert(plan);
    }

    // ========== ЭКСПОРТ ФУНКЦИЙ В ГЛОБАЛЬНУЮ ОБЛАСТЬ ==========
    // Это важно! Чтобы onclick в HTML работал
    window.selectCity = selectCity;
    window.searchCity = searchCity;
    window.applyFilters = applyFilters;
    window.toggleFavorite = toggleFavorite;
    window.goBackToFilters = goBackToFilters;
    window.loadCities = loadCities;
    window.goBackToStep0 = goBackToStep0;
    window.goBackToStep1 = goBackToStep1;
    window.goBackToStep2 = goBackToStep2;
});