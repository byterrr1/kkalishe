// Функциональность для страницы оформления заказа
document.addEventListener('DOMContentLoaded', function() {
    
    // Инициализация
    loadCart();
    updateCartCount();
    initStepNavigation();
    initDeliveryOptions();
    initPaymentOptions();
    initPromocode();
    
    // Обработка поиска
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `products.html?search=${encodeURIComponent(query)}`;
            }
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
                }
            }
        });
    }
    
    // Обработка мобильного меню
    const burgerMenu = document.querySelector('.burger-menu');
    const navMenu = document.querySelector('.main-nav ul');
    
    if (burgerMenu && navMenu) {
        burgerMenu.addEventListener('click', function() {
            navMenu.classList.toggle('show');
        });
    }
    
    // Кнопка для слабовидящих
    const accessibilityBtn = document.getElementById('accessibilityBtn');
    if (accessibilityBtn) {
        accessibilityBtn.addEventListener('click', function() {
            document.body.classList.toggle('accessibility-mode');
        });
    }
});

// Загрузка корзины
function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderItems = document.getElementById('orderItems');
    
    if (cart.length === 0) {
        orderItems.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
        return;
    }
    
    let itemsHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        itemsHTML += `
            <div class="order-item">
                <img src="${item.image}" alt="${item.name}" class="item-image">
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">Количество: ${item.quantity}</div>
                    <div class="item-price">${item.price.toLocaleString()} ₽</div>
                </div>
            </div>
        `;
    });
    
    orderItems.innerHTML = itemsHTML;
    updateOrderCalculations(subtotal);
}

// Обновление расчетов заказа
function updateOrderCalculations(subtotal) {
    const deliveryCost = getDeliveryCost();
    const discount = getDiscount();
    const total = subtotal + deliveryCost - discount;
    
    document.getElementById('subtotal').textContent = `${subtotal.toLocaleString()} ₽`;
    document.getElementById('deliveryCost').textContent = `${deliveryCost.toLocaleString()} ₽`;
    document.getElementById('orderTotal').textContent = `${total.toLocaleString()} ₽`;
    
    // Показываем скидку если есть
    const discountRow = document.getElementById('discountRow');
    const discountAmount = document.getElementById('discountAmount');
    
    if (discount > 0) {
        discountRow.style.display = 'flex';
        discountAmount.textContent = `-${discount.toLocaleString()} ₽`;
    } else {
        discountRow.style.display = 'none';
    }
}

// Получение стоимости доставки
function getDeliveryCost() {
    const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
    if (!selectedDelivery) return 0;
    
    const deliveryCosts = {
        'courier': 300,
        'pickup': 0,
        'post': 200
    };
    
    return deliveryCosts[selectedDelivery.value] || 0;
}

// Получение скидки
function getDiscount() {
    const appliedPromocode = localStorage.getItem('appliedPromocode');
    if (!appliedPromocode) return 0;
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const promocodes = {
        'WELCOME10': 0.1,
        'GAMER20': 0.2,
        'FREESHIP': 0
    };
    
    const discountRate = promocodes[appliedPromocode];
    if (discountRate === undefined) return 0;
    
    if (appliedPromocode === 'FREESHIP') {
        return getDeliveryCost();
    }
    
    return Math.round(subtotal * discountRate);
}

// Инициализация навигации по шагам
function initStepNavigation() {
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = this.closest('.form-step');
            const nextStepNumber = this.getAttribute('data-step');
            
            if (validateStep(currentStep)) {
                showStep(nextStepNumber);
                updateStepIndicator(nextStepNumber);
            }
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const prevStepNumber = this.getAttribute('data-step');
            showStep(prevStepNumber);
            updateStepIndicator(prevStepNumber);
        });
    });
}

// Показать определенный шаг
function showStep(stepNumber) {
    const steps = document.querySelectorAll('.form-step');
    steps.forEach(step => step.classList.remove('active'));
    
    const targetStep = document.getElementById(`step${stepNumber}`);
    if (targetStep) {
        targetStep.classList.add('active');
    }
}

// Обновление индикатора шагов
function updateStepIndicator(stepNumber) {
    const steps = document.querySelectorAll('.checkout-steps .step');
    steps.forEach((step, index) => {
        if (index + 1 <= stepNumber) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// Валидация шага
function validateStep(step) {
    const requiredFields = step.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });
    
    if (!isValid) {
        showNotification('Пожалуйста, заполните все обязательные поля', 'error');
    }
    
    return isValid;
}

// Инициализация опций доставки
function initDeliveryOptions() {
    const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
    
    deliveryOptions.forEach(option => {
        option.addEventListener('change', function() {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            updateOrderCalculations(subtotal);
        });
    });
}

// Инициализация опций оплаты
function initPaymentOptions() {
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            // Можно добавить дополнительную логику для разных способов оплаты
        });
    });
}

// Инициализация промокодов
function initPromocode() {
    const applyButton = document.getElementById('applyPromocode');
    const promocodeInput = document.getElementById('promocode');
    const messageDiv = document.getElementById('promocodeMessage');
    
    if (applyButton && promocodeInput) {
        applyButton.addEventListener('click', function() {
            const code = promocodeInput.value.trim().toUpperCase();
            
            const validPromocodes = ['WELCOME10', 'GAMER20', 'FREESHIP'];
            
            if (validPromocodes.includes(code)) {
                localStorage.setItem('appliedPromocode', code);
                messageDiv.innerHTML = `<span class="success">Промокод "${code}" применен!</span>`;
                messageDiv.className = 'success';
                
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                updateOrderCalculations(subtotal);
                
                showNotification(`Промокод "${code}" успешно применен!`, 'success');
            } else {
                messageDiv.innerHTML = `<span class="error">Неверный промокод</span>`;
                messageDiv.className = 'error';
                showNotification('Неверный промокод', 'error');
            }
        });
        
        promocodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyButton.click();
            }
        });
    }
}

// Обработка отправки формы
document.getElementById('checkoutForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        comment: document.getElementById('comment').value,
        delivery: document.querySelector('input[name="delivery"]:checked').value,
        payment: document.querySelector('input[name="payment"]:checked').value,
        promocode: localStorage.getItem('appliedPromocode') || null,
        items: JSON.parse(localStorage.getItem('cart')) || [],
        total: parseFloat(document.getElementById('orderTotal').textContent.replace(/[^\d]/g, '')),
        date: new Date().toISOString()
    };
    
    // Сохраняем заказ
    saveOrder(formData);
    
    // Очищаем корзину
    localStorage.removeItem('cart');
    localStorage.removeItem('appliedPromocode');
    
    // Перенаправляем на страницу благодарности
    window.location.href = 'thankyou.html';
});

// Сохранение заказа
function saveOrder(orderData) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orderData.id = Date.now(); // Простой ID заказа
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Также сохраняем заказ в userOrders для истории в личном кабинете
    let userOrders = JSON.parse(localStorage.getItem('userOrders')) || [];
    userOrders.push(orderData);
    localStorage.setItem('userOrders', JSON.stringify(userOrders));
    
    // Сохраняем последний заказ для страницы благодарности
    localStorage.setItem('lastOrder', JSON.stringify(orderData));
    
    // Сохраняем данные пользователя
    const userData = {
        fullName: orderData.fullName,
        phone: orderData.phone,
        email: orderData.email,
        address: orderData.address
    };
    localStorage.setItem('userData', JSON.stringify(userData));
}

// Обновление счетчика корзины
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Функция для показа уведомлений
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00b894' : type === 'error' ? '#e74c3c' : '#6c5ce7'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}