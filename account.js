document.addEventListener('DOMContentLoaded', function() {
    // Загрузка данных пользователя
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    
    // Заполнение формы данными (если есть сохраненные данные)
    if (userData.name) document.getElementById('userName').value = userData.name;
    if (userData.email) document.getElementById('userEmail').value = userData.email;
    if (userData.phone) document.getElementById('userPhone').value = userData.phone;

    // Сохранение данных
    document.getElementById('personalDataForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newUserData = {
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            phone: document.getElementById('userPhone').value
        };
        
        localStorage.setItem('userData', JSON.stringify(newUserData));
        
        // Показываем уведомление об успешном сохранении
        showNotification('Данные успешно сохранены!', 'success');
    });

    // Загрузка истории заказов
    loadOrderHistory();
});

function loadOrderHistory() {
    const ordersList = document.getElementById('ordersList');
    const orders = JSON.parse(localStorage.getItem('userOrders')) || [];
    
    if (orders.length === 0) {
        // Показываем стандартный блок "нет заказов"
        ordersList.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-box-open"></i>
                <p>У вас пока нет заказов</p>
                <a href="products.html" class="btn btn-secondary">Перейти в каталог</a>
            </div>
        `;
        return;
    }
    
    // Очищаем список и добавляем заказы
    ordersList.innerHTML = '';
    
    // Сортируем заказы по дате (новые сначала)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    orders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'order-card';
        orderElement.innerHTML = `
            <div class="order-header">
                <span class="order-number">Заказ #${order.id}</span>
                <span class="order-date">${order.date}</span>
                <span class="order-status status-completed">${order.status || 'Оформлен'}</span>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.image}" alt="${item.name}" class="order-item-img">
                        <div class="order-item-info">
                            <div class="item-name">${item.name}</div>
                            <div class="item-details">${item.quantity} × ${item.price.toLocaleString()} ₽</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                <strong>Итого: ${order.total.toLocaleString()} ₽</strong>
            </div>
            ${order.comment ? `<div class="order-comment"><strong>Комментарий:</strong> ${order.comment}</div>` : ''}
        `;
        
        ordersList.appendChild(orderElement);
    });
}

function showNotification(message, type = 'info') {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Добавляем стили
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00b894' : '#6c5ce7'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Кнопка закрытия
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Автоматическое закрытие через 3 секунды
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}