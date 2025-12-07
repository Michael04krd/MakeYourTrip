// js/api.js
class ApiClient {
    constructor() {
        this.BASE_URL = 'http://127.0.0.1:8000/api';
    }

    getToken() {
        return localStorage.getItem('access_token');
    }

    setToken(token) {
        localStorage.setItem('access_token', token);
    }

    removeToken() {
        localStorage.removeItem('access_token');
    }

    async request(endpoint, options = {}) {
        const url = `${this.BASE_URL}${endpoint}`;
        const token = this.getToken();
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
    
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    
        try {
            const response = await fetch(url, {
                ...options,
                headers
            });
            if (response.status === 401) {
                this.removeToken();
                throw new Error('Неавторизованный доступ');
            }
    
            if (!response.ok) {
                let errorMessage = `Ошибка ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorMessage;
                } catch (e) {
                    // Не удалось распарсить JSON
                }
                throw new Error(errorMessage);
            }
    
            if (response.status === 204 || options.method === 'DELETE') {
                return null;
            }
    
            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Auth methods
    async login(username, password) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        
        const response = await fetch(`${this.BASE_URL}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Ошибка входа');
        }
        
        const data = await response.json();
        this.setToken(data.access_token);
        return data;
    }

    async register(userData) {
        return await this.request('/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // User methods
    async getCurrentUser() {
        return await this.request('/users/me');
    }

    // Cities methods
    async getCities(search = '') {
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        return await this.request(`/cities${params}`);
    }

    async getCity(id) {
        return await this.request(`/cities/${id}`);
    }

    // Places methods
    async getPlaces(filters = {}) {
        const params = new URLSearchParams();
        if (filters.city_id) params.append('city_id', filters.city_id);
        if (filters.type) params.append('type', filters.type);
        if (filters.min_rating) params.append('min_rating', filters.min_rating);
        
        const query = params.toString();
        return await this.request(`/places${query ? `?${query}` : ''}`);
    }

    async getCityPlaces(cityId) {
        return await this.request(`/cities/${cityId}/places`);
    }

    // Favorites methods
    async getFavorites() {
        return await this.request('/favorites');
    }

    async addFavorite(placeId) {
        return await this.request('/favorites', {
            method: 'POST',
            body: JSON.stringify({ place_id: placeId })
        });
    }

    async removeFavorite(placeId) {
        return await this.request(`/favorites/${placeId}`, {
            method: 'DELETE'
        });
    }

    async checkFavorite(placeId) {
        return await this.request(`/favorites/${placeId}/check`);
    }
}

// Создаем глобальный экземпляр
const api = new ApiClient();
window.api = api;