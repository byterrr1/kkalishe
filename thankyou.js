document.addEventListener('DOMContentLoaded', function() {
    // Получаем данные последнего заказа из localStorage
    const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));
    const orderDetails = document.getElementById('orderDetails');
    
    if (lastOrder) {
        orderDetails.innerHTML = `
            <div class="order-summary">
                <h3>Детали заказа</h3>
                <div class="order-info">
                    <p><strong>Номер заказа:</strong> #${lastOrder.id}</p>
                    <p><strong>Дата:</strong> ${lastOrder.date}</p>
                    <p><strong>Сумма:</strong> ${lastOrder.total.toLocaleString()} ₽</p>
                </div>
                <div class="order-items-summary">
                    <h4>Товары в заказе:</h4>
                    ${lastOrder.items.map(item => `
                        <div class="order-item-summary">
                            <img src="${item.image}" alt="${item.name}" class="item-thumbnail">
                            <div class="item-details">
                                <div class="item-name">${item.name}</div>
                                <div class="item-quantity">${item.quantity} × ${item.price.toLocaleString()} ₽</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        orderDetails.innerHTML = `
            <div class="order-summary">
                <p>Информация о заказе временно недоступна.</p>
            </div>
        `;
    }
}); 