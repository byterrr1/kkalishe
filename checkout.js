document.addEventListener('DOMContentLoaded', function() {
    // Загружаем корзину из localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderItems = document.getElementById('orderItems');
    const orderTotal = document.getElementById('orderTotal');
    
    // Отображаем товары в заказе
    function displayOrderItems() {
        orderItems.innerHTML = '';
        let total = 0;
        
        if (cart.length === 0) {
            orderItems.innerHTML = '<p>Ваша корзина пуста</p>';
            orderTotal.textContent = '0 ₽';
            return;
        }
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <div class="item-info">
                    <img src="${item.image}" alt="${item.name}" class="item-image">
                    <div>
                        <h4>${item.name}</h4>
                        <div>${item.price.toLocaleString()} ₽ × ${item.quantity}</div>
                    </div>
                </div>
                <div class="item-total">${itemTotal.toLocaleString()} ₽</div>
            `;
            orderItems.appendChild(itemElement);
        });
        
        orderTotal.textContent = `${total.toLocaleString()} ₽`;
    }
    
    // Обработка формы
    document.getElementById('checkoutForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Собираем данные
        const orderData = {
            customer: {
                name: document.getElementById('fullName').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                address: document.getElementById('address').value
            },
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            comment: document.getElementById('comment').value
        };
        
        // Здесь должна быть отправка данных на сервер
        console.log('Order data:', orderData);
        
        // Очищаем корзину
        localStorage.removeItem('cart');
        
        // Перенаправляем на страницу благодарности
        window.location.href = 'thankyou.html'; // Создайте эту страницу при необходимости
    });
    
    // Инициализация
    displayOrderItems();
});