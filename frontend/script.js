const signInBtn = document.querySelector('.signin-btn');
const signUpBtn = document.querySelector('.signup-btn');
const formBox = document.querySelector('.form-box');
const body = document.body;

// Формы
const signinForm = document.querySelector('.form_signin');
const signupForm = document.querySelector('.form_signup');

// Переключение между формами
signUpBtn.addEventListener('click', function() {
    formBox.classList.add('active');
    body.classList.add('active');
});

signInBtn.addEventListener('click', function() {
    formBox.classList.remove('active');
    body.classList.remove('active');
});

// Сохранение токена в localStorage
function saveToken(token) {
    localStorage.setItem('access_token', token);
}

// Получение токена из localStorage
function getToken() {
    return localStorage.getItem('access_token');
}

// Удаление токена
function removeToken() {
    localStorage.removeItem('access_token');
}

// Проверка авторизации
function isAuthenticated() {
    return getToken() !== null;
}

// Редирект на главную если авторизован
if (isAuthenticated() && window.location.pathname.includes('auth.html')) {
    window.location.href = 'index.html';
}

// Обработка входа
signinForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = this.querySelector('input[type="text"]').value;
    const password = this.querySelector('input[type="password"]').value;
    
    try {
        // Отправляем данные для входа
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        
        const response = await fetch('http://localhost:8000/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            saveToken(data.access_token);
            alert('Вход выполнен успешно!');
            window.location.href = 'index.html';
        } else {
            const error = await response.json();
            alert(`Ошибка входа: ${error.detail}`);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка подключения к серверу');
    }
});

// Обработка регистрации
signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = this.querySelectorAll('input[type="text"]')[0].value;
    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelectorAll('input[type="password"]')[0].value;
    const confirmPassword = this.querySelectorAll('input[type="password"]')[1].value;
    
    // Проверка паролей
    if (password !== confirmPassword) {
        alert('Пароли не совпадают!');
        return;
    }
    
    try {
        const userData = {
            username: username,
            email: email,
            password: password,
            full_name: username
        };
        
        const response = await fetch('http://localhost:8000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            alert('Регистрация успешна! Теперь войдите в систему.');
            // Переключаем на форму входа
            signInBtn.click();
        } else {
            const error = await response.json();
            alert(`Ошибка регистрации: ${error.detail}`);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка подключения к серверу');
    }
});

// Функция для авторизованных запросов
async function makeAuthRequest(url, method = 'GET', body = null) {
    const token = getToken();
    if (!token) {
        throw new Error('Пользователь не авторизован');
    }
    
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    const config = {
        method: method,
        headers: headers
    };
    
    if (body) {
        config.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, config);
    
    if (response.status === 401) {
        // Токен истек или недействителен
        removeToken();
        window.location.href = 'auth.html';
        throw new Error('Сессия истекла');
    }
    
    return response;
}

// Выход из системы
function logout() {
    removeToken();
    window.location.href = 'auth.html';
}

// Добавляем кнопку выхода на главную страницу
if (window.location.pathname.includes('index.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        // Проверяем авторизацию
        if (!isAuthenticated()) {
            window.location.href = 'auth.html';
            return;
        }
        
        // Добавляем кнопку выхода
        const header = document.querySelector('h1');
        if (header) {
            const logoutBtn = document.createElement('button');
            logoutBtn.textContent = 'Выйти';
            logoutBtn.style.cssText = `
                position: absolute;
                top: 20px;
                right: 20px;
                padding: 8px 16px;
                background: #ff4444;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            `;
            logoutBtn.onclick = logout;
            document.body.appendChild(logoutBtn);
            
            // Получаем информацию о пользователе
            async function loadUserInfo() {
                try {
                    const response = await makeAuthRequest('http://localhost:8000/api/users/me');
                    if (response.ok) {
                        const user = await response.json();
                        const userInfo = document.createElement('div');
                        userInfo.textContent = `Вы вошли как: ${user.username}`;
                        userInfo.style.cssText = `
                            position: absolute;
                            top: 20px;
                            left: 20px;
                            background: #f0f0f0;
                            padding: 8px 16px;
                            border-radius: 4px;
                        `;
                        document.body.appendChild(userInfo);
                    }
                } catch (error) {
                    console.error('Ошибка загрузки информации:', error);
                }
            }
            
            loadUserInfo();
        }
    });
}