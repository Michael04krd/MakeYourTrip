document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию
    if (localStorage.getItem('access_token')) {
        window.location.href = 'index.html';
        return;
    }

    // Элементы
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');
    const errorElement = document.getElementById('error');
    const regErrorElement = document.getElementById('regError');

    // Переключение форм
    showRegisterLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        clearErrors();
    });

    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        clearErrors();
    });

    // Очистка ошибок
    function clearErrors() {
        errorElement.textContent = '';
        regErrorElement.textContent = '';
        errorElement.className = 'error';
        regErrorElement.className = 'error';
    }

    // Валидация email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Валидация пароля
    function isValidPassword(password) {
        return password.length >= 6;
    }

    // Валидация имени пользователя
    function isValidUsername(username) {
        return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
    }

    // Показать ошибку в поле
    function showFieldError(inputId, message) {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(inputId + 'Error') || createErrorSpan(inputId);
        errorSpan.textContent = message;
        input.style.borderColor = '#ef4444';
        input.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
    }

    // Убрать ошибку с поля
    function clearFieldError(inputId) {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(inputId + 'Error');
        if (errorSpan) errorSpan.textContent = '';
        input.style.borderColor = '';
        input.style.boxShadow = '';
    }

    // Создать спан для ошибки поля
    function createErrorSpan(inputId) {
        const input = document.getElementById(inputId);
        const errorSpan = document.createElement('span');
        errorSpan.id = inputId + 'Error';
        errorSpan.className = 'field-error';
        errorSpan.style.cssText = `
            display: block;
            color: #ef4444;
            font-size: 13px;
            margin-top: 4px;
            margin-bottom: 10px;
        `;
        input.parentNode.insertBefore(errorSpan, input.nextSibling);
        return errorSpan;
    }

    // Вход
    loginButton.addEventListener('click', async function() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        clearErrors();
        
        // Валидация
        let isValid = true;
        
        if (!username) {
            showFieldError('username', 'Введите имя пользователя');
            isValid = false;
        } else {
            clearFieldError('username');
        }
        
        if (!password) {
            showFieldError('password', 'Введите пароль');
            isValid = false;
        } else {
            clearFieldError('password');
        }
        
        if (!isValid) return;
        
        const originalText = loginButton.innerHTML;
        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
        loginButton.disabled = true;
        
        try {
            await api.login(username, password);

            if (window.UIUtils) {
                window.UIUtils.showNotification('Вход выполнен успешно!', 'success');
            }

            // Проверяем, есть ли сохранённый URL для возврата
            const returnUrl = sessionStorage.getItem('returnUrl');
            if (returnUrl) {
                sessionStorage.removeItem('returnUrl');
                setTimeout(() => {
                    window.location.href = returnUrl;
                }, 800);
            } else {
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 800);
            }
            
        } catch (error) {
            errorElement.textContent = error.message || 'Ошибка входа';
            loginButton.innerHTML = originalText;
            loginButton.disabled = false;
        }
    });

    // Регистрация
    registerButton.addEventListener('click', async function() {
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const fullName = document.getElementById('regFullName').value.trim();
        
        clearErrors();
        
        // Валидация
        let isValid = true;
        
        // Имя пользователя
        if (!username) {
            showFieldError('regUsername', 'Введите имя пользователя');
            isValid = false;
        } else if (!isValidUsername(username)) {
            showFieldError('regUsername', 'Имя пользователя должно содержать только латинские буквы, цифры и подчеркивание, минимум 3 символа');
            isValid = false;
        } else {
            clearFieldError('regUsername');
        }
        
        // Email
        if (!email) {
            showFieldError('regEmail', 'Введите email');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showFieldError('regEmail', 'Введите корректный email адрес');
            isValid = false;
        } else {
            clearFieldError('regEmail');
        }
        
        // Пароль
        if (!password) {
            showFieldError('regPassword', 'Введите пароль');
            isValid = false;
        } else if (!isValidPassword(password)) {
            showFieldError('regPassword', 'Пароль должен быть не менее 6 символов');
            isValid = false;
        } else {
            clearFieldError('regPassword');
        }
        
        // Подтверждение пароля
        if (!confirmPassword) {
            showFieldError('regConfirmPassword', 'Подтвердите пароль');
            isValid = false;
        } else if (password !== confirmPassword) {
            showFieldError('regConfirmPassword', 'Пароли не совпадают');
            isValid = false;
        } else {
            clearFieldError('regConfirmPassword');
        }
        
        if (!isValid) return;
        
        const originalText = registerButton.innerHTML;
        registerButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Регистрация...';
        registerButton.disabled = true;
        
        try {
            const userData = {
                username: username,
                email: email,
                password: password,
                full_name: fullName || null
            };
            
            await api.register(userData);
            
            if (window.UIUtils) {
                window.UIUtils.showNotification('Регистрация успешна! Теперь войдите в систему.', 'success');
            }
            
            setTimeout(() => {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
                registerButton.innerHTML = originalText;
                registerButton.disabled = false;
                
                // Очищаем поля и ошибки
                ['regUsername', 'regEmail', 'regPassword', 'regConfirmPassword', 'regFullName'].forEach(id => {
                    document.getElementById(id).value = '';
                    clearFieldError(id);
                });
            }, 1500);
            
        } catch (error) {
            regErrorElement.textContent = error.message || 'Ошибка регистрации';
            registerButton.innerHTML = originalText;
            registerButton.disabled = false;
        }
    });

    // Реальная валидация при вводе
    document.getElementById('regEmail').addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !isValidEmail(email)) {
            showFieldError('regEmail', 'Введите корректный email адрес');
        } else {
            clearFieldError('regEmail');
        }
    });

    document.getElementById('regPassword').addEventListener('input', function() {
        const password = this.value;
        if (password && !isValidPassword(password)) {
            showFieldError('regPassword', 'Пароль должен быть не менее 6 символов');
        } else {
            clearFieldError('regPassword');
        }
    });

    document.getElementById('regConfirmPassword').addEventListener('input', function() {
        const password = document.getElementById('regPassword').value;
        const confirmPassword = this.value;
        if (confirmPassword && password !== confirmPassword) {
            showFieldError('regConfirmPassword', 'Пароли не совпадают');
        } else {
            clearFieldError('regConfirmPassword');
        }
    });

    // Enter для отправки форм
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') loginButton.click();
    });

    document.getElementById('regConfirmPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') registerButton.click();
    });

    // Добавляем CSS для ошибок полей
    const style = document.createElement('style');
    style.textContent = `
        .field-error {
            display: block;
            color: #ef4444;
            font-size: 13px;
            margin-top: 4px;
            margin-bottom: 10px;
            font-weight: 500;
        }
        
        input.error-border {
            border-color: #ef4444 !important;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }
    `;
    document.head.appendChild(style);
});