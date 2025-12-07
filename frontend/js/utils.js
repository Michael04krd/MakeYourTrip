// js/utils.js
class UIUtils {
    static showNotification(message, type = 'success', duration = 3000) {
        // Удаляем старые уведомления
        const oldNotifications = document.querySelectorAll('.custom-notification');
        oldNotifications.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `custom-notification notification-${type}`;
        
        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
        
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icon}</span>
                <span class="notification-text">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Стили
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            min-width: 300px;
            max-width: 400px;
            border-left: 4px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            animation: notificationSlideIn 0.3s ease;
        `;
        
        const content = notification.querySelector('.notification-content');
        content.style.cssText = `
            display: flex;
            align-items: center;
            padding: 12px 16px;
        `;
        
        const iconEl = notification.querySelector('.notification-icon');
        iconEl.style.cssText = `
            font-size: 20px;
            margin-right: 12px;
        `;
        
        const text = notification.querySelector('.notification-text');
        text.style.cssText = `
            flex: 1;
            font-size: 14px;
            color: #1f2937;
        `;
        
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #6b7280;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            margin-left: 8px;
        `;
        
        closeBtn.onmouseover = () => closeBtn.style.background = '#f3f4f6';
        closeBtn.onmouseout = () => closeBtn.style.background = 'none';
        
        closeBtn.onclick = () => {
            notification.style.animation = 'notificationSlideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        };
        
        document.body.appendChild(notification);
        
        // Анимации
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes notificationSlideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes notificationSlideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'notificationSlideOut 0.3s ease forwards';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        }
        
        return notification;
    }

    static showLoader(container, text = 'Загрузка...') {
        const loaderId = 'loader-' + Date.now();
        const loader = document.createElement('div');
        loader.id = loaderId;
        loader.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; padding: 40px 0;">
                <div style="width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top-color: #8b5cf6; border-radius: 50%; animation: loaderSpin 1s linear infinite;"></div>
                <div style="margin-top: 12px; color: #6b7280; font-size: 14px;">${text}</div>
            </div>
        `;
        
        // Сохраняем оригинальный контент
        loader.dataset.originalContent = container.innerHTML;
        
        container.innerHTML = '';
        container.appendChild(loader);
        
        // Добавляем стили для анимации если их нет
        if (!document.querySelector('#loader-styles')) {
            const style = document.createElement('style');
            style.id = 'loader-styles';
            style.textContent = `
                @keyframes loaderSpin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        return {
            remove: () => {
                const loaderEl = document.getElementById(loaderId);
                if (loaderEl) {
                    container.innerHTML = loaderEl.dataset.originalContent || '';
                }
            }
        };
    }

    static confirm(message, title = 'Подтверждение') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: modalFadeIn 0.3s ease;
            `;
            
            modal.innerHTML = `
                <div style="background: white; border-radius: 12px; width: 90%; max-width: 400px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #e5e7eb;">
                        <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;">${title}</h3>
                        <button class="modal-close" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">&times;</button>
                    </div>
                    <div style="padding: 20px; color: #4b5563;">
                        ${message}
                    </div>
                    <div style="padding: 16px 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
                        <button class="btn-cancel" style="padding: 8px 16px; border-radius: 6px; font-weight: 500; cursor: pointer; background: #e5e7eb; color: #374151; border: none;">Отмена</button>
                        <button class="btn-confirm" style="padding: 8px 16px; border-radius: 6px; font-weight: 500; cursor: pointer; background: #8b5cf6; color: white; border: none;">Подтвердить</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Добавляем стили для анимации если их нет
            if (!document.querySelector('#modal-styles')) {
                const style = document.createElement('style');
                style.id = 'modal-styles';
                style.textContent = `
                    @keyframes modalFadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .modal-close:hover { background: #f3f4f6 !important; }
                    .btn-cancel:hover { background: #d1d5db !important; }
                    .btn-confirm:hover { background: #7c3aed !important; }
                `;
                document.head.appendChild(style);
            }
            
            const closeModal = (result) => {
                modal.style.animation = 'modalFadeIn 0.3s ease reverse forwards';
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.remove();
                    }
                }, 300);
                resolve(result);
            };
            
            modal.querySelector('.modal-close').onclick = () => closeModal(false);
            modal.querySelector('.btn-cancel').onclick = () => closeModal(false);
            modal.querySelector('.btn-confirm').onclick = () => closeModal(true);
        });
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
}

// Делаем доступным глобально
window.UIUtils = UIUtils;