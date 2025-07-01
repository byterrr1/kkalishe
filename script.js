document.addEventListener('DOMContentLoaded', function() {
    // Инициализация корзины
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount();
    
    // Меню бургер
    const burgerMenu = document.querySelector('.burger-menu');
    const navMenu = document.querySelector('.main-nav ul');
    
    burgerMenu.addEventListener('click', function() {
        navMenu.classList.toggle('show');
    });
    
    // Кнопка для слабовидящих
    const accessibilityBtn = document.getElementById('accessibilityBtn');
    
    accessibilityBtn.addEventListener('click', function() {
        document.body.classList.toggle('accessibility-mode');
    });
    
    // Корзина - открытие/закрытие
    document.querySelector('.cart a').addEventListener('click', function(e) {
        e.preventDefault();
        openCart();
    });

    document.querySelector('.close-cart')?.addEventListener('click', closeCart);
    document.querySelector('.cart-modal')?.addEventListener('click', function(e) {
        if (e.target === this) closeCart();
    });

    // Загрузка популярных товаров
    loadFeaturedProducts();
    
    // Функции корзины
    function openCart() {
        document.getElementById('cartModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
        renderCart();
    }

    function closeCart() {
        document.getElementById('cartModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    function renderCart() {
        const cartItems = document.getElementById('cartItems');
        cartItems.innerHTML = '';

        if (cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Ваша корзина пуста</div>';
            document.getElementById('cartTotal').textContent = '0 ₽';
            return;
        }

        let total = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
                    <div class="cart-item-controls">
                        <div class="quantity-control">
                            <button class="quantity-btn minus" data-index="${index}">-</button>
                            <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                            <button class="quantity-btn plus" data-index="${index}">+</button>
                        </div>
                        <button class="remove-item" data-index="${index}">Удалить</button>
                    </div>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });

        document.getElementById('cartTotal').textContent = `${total.toLocaleString()} ₽`;

        // Обработчики для кнопок в корзине
        document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                updateQuantity(index, -1);
            });
        });

        document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                updateQuantity(index, 1);
            });
        });

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removeFromCart(index);
            });
        });
    }

    function updateQuantity(index, change) {
        cart[index].quantity += change;

        if (cart[index].quantity < 1) {
            cart[index].quantity = 1;
        }

        saveCart();
        renderCart();
        updateCartCount();
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        saveCart();
        renderCart();
        updateCartCount();
    }

    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        updateCartCount();
        saveCart();
        
        // Обновляем корзину если она открыта
        if (document.getElementById('cartModal').style.display === 'block') {
            renderCart();
        }
        
        // Анимация добавления
        const button = document.querySelector(`.add-to-cart[data-id="${product.id}"]`);
        if (button) {
            button.textContent = 'Добавлено!';
            button.style.backgroundColor = 'var(--success-color)';
            
            setTimeout(() => {
                button.textContent = 'В корзину';
                button.style.backgroundColor = 'var(--primary-color)';
            }, 2000);
        }
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelector('.cart-count').textContent = count;
    }

 // Функция загрузки товаров
    function loadFeaturedProducts() {
        const products = [
            {
                id: 1,
                name: 'Игровая клавиатура',
                price: 5490,
                image: 'img/yasral.jpg',
                rating: 4.5
            },
            {
                id: 2,
                name: 'Беспроводная игровая мышь',
                price: 3990,
                image: 'img/yassal.jpg',
                rating: 4.8
            },
            {
                id: 3,
                name: 'Игровая гарнитура',
                price: 6990,
                image: 'img/dermo.jpg',
                rating: 4.7
            },
            {
                id: 4,
                name: 'Геймпад для ПК/консолей',
                price: 4590,
                image: 'img/ssanina.jpg',
                rating: 4.6
            }
        ];

        
        const productGrid = document.querySelector('.product-grid');
        if (productGrid) {
            productGrid.innerHTML = '';
            
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card animate-card';
                
                const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
                
                productCard.innerHTML = `
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-price">${product.price.toLocaleString()} ₽</div>
                        <div class="product-rating">${stars} (${product.rating})</div>
                        <button class="add-to-cart" data-id="${product.id}">В корзину</button>
                    </div>
                `;
                
                productGrid.appendChild(productCard);
            });
            
            // Обработчики для кнопок "В корзину"
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    const product = products.find(p => p.id === productId);
                    
                    addToCart(product);
                });
            });
        }
    }
    
    // Инициализация анимаций при скролле
    initScrollAnimations();

    // Обновляем счетчик корзины
    updateCartCount();
    
    // Таймер обратного отсчета для акций
    updatePromoTimer();
    setInterval(updatePromoTimer, 1000);
});

function initScrollAnimations() {
    const animateElements = document.querySelectorAll('.animate-card');
    
    function checkScroll() {
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }
    
    window.addEventListener('scroll', checkScroll);
    checkScroll();
}
// Замените старый код оформления заказа на:
document.querySelector('.checkout-btn').addEventListener('click', function(e) {
    e.preventDefault();
    
    // Проверяем, есть ли товары в корзине
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Ваша корзина пуста');
        return;
    }
    
    // Перенаправляем на страницу оформления
    window.location.href = 'checkout.html';
});
// Кнопка "Наверх"
const backToTopBtn = document.createElement('div');
backToTopBtn.className = 'back-to-top';
backToTopBtn.innerHTML = '↑';
document.body.appendChild(backToTopBtn);

window.addEventListener('scroll', function() {
  if (window.pageYOffset > 300) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
});

backToTopBtn.addEventListener('click', function() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    this.classList.add('active');
    document.getElementById(this.dataset.tab).classList.add('active');
  });
});

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
        background: ${type === 'success' ? '#00b894' : '#6c5ce7'};
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

// Функция обновления счетчика корзины
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Функция таймера обратного отсчета для акций
function updatePromoTimer() {
    const timerElement = document.getElementById('promoTimer');
    if (!timerElement) return;
    
    const endDate = new Date('2024-12-31T23:59:59');
    const now = new Date();
    const diff = endDate - now;
    
    if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        timerElement.textContent = '00:00:00';
    }
}

// === Счетчик посещений ===
(function() {
    // Проверяем, был ли уже засчитан визит в этой сессии
    if (!sessionStorage.getItem('siteVisitedThisSession')) {
        // Получаем текущее значение счетчика из localStorage
        let visits = localStorage.getItem('siteVisits');
        if (!visits) {
            visits = 1;
        } else {
            visits = parseInt(visits, 10) + 1;
        }
        localStorage.setItem('siteVisits', visits);
        sessionStorage.setItem('siteVisitedThisSession', '1');
    }
    // Показываем счетчик (берём актуальное значение из localStorage)
    const visits = localStorage.getItem('siteVisits') || 1;
    const counterDiv = document.createElement('div');
    counterDiv.id = 'visitor-counter';
    counterDiv.textContent = `Вы посетили этот сайт ${visits} раз(а)`;
    counterDiv.style.cssText = `
        position: fixed;
        left: 20px;
        bottom: 20px;
        background: rgba(0,0,0,0.7);
        color: #fff;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 15px;
        z-index: 9999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        pointer-events: none;
    `;
    document.body.appendChild(counterDiv);
})();