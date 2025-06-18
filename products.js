document.addEventListener('DOMContentLoaded', function() {
    // Инициализация корзины
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount();
    
    // Инициализация слайдера цены
    const priceSlider = document.getElementById('price-slider');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    
    if (priceSlider) {
        noUiSlider.create(priceSlider, {
            start: [0, 30000],
            connect: true,
            range: {
                'min': 0,
                'max': 30000
            },
            step: 100
        });
        
        priceSlider.noUiSlider.on('update', function(values, handle) {
            const value = values[handle];
            if (handle) {
                maxPriceInput.value = Math.round(value);
            } else {
                minPriceInput.value = Math.round(value);
            }
        });
        
        minPriceInput.addEventListener('change', function() {
            priceSlider.noUiSlider.set([this.value, null]);
        });
        
        maxPriceInput.addEventListener('change', function() {
            priceSlider.noUiSlider.set([null, this.value]);
        });
    }

    // Используем глобальную переменную products
    const products = window.products;

    // Обработчик добавления в корзину
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            const product = products.find(p => p.id === productId);
            if (product) addToCart(product);
        }
    });

    // Функции корзины
    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                existingItem.quantity += 1;
            } else {
                alert('Извините, товар закончился на складе!');
                return;
            }
        } else {
            if (product.stock > 0) {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: 1,
                    stock: product.stock
                });
            } else {
                alert('Извините, товар закончился на складе!');
                return;
            }
        }
        
        updateCartCount();
        saveCart();
        
        // Показываем уведомление
        showNotification(`${product.name} добавлен в корзину!`);
    }

    function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) cartCount.textContent = count;
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function renderCart() {
        const cartItems = document.getElementById('cartItems');
        if (!cartItems) return;
        
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
        if (cart[index].quantity < 1) cart[index].quantity = 1;
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

    // Открытие/закрытие корзины
    document.querySelector('.cart a')?.addEventListener('click', function(e) {
        e.preventDefault();
        openCart();
    });

    document.querySelector('.close-cart')?.addEventListener('click', closeCart);
    document.querySelector('.cart-modal')?.addEventListener('click', function(e) {
        if (e.target === this) closeCart();
    });

    function openCart() {
        document.getElementById('cartModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
        renderCart();
    }

    function closeCart() {
        document.getElementById('cartModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Фильтрация и сортировка товаров
    let filteredProducts = [...products];
    let currentPage = 1;
    const productsPerPage = 6;
    
    document.getElementById('applyFilters')?.addEventListener('click', applyFilters);
    document.getElementById('resetFilters')?.addEventListener('click', resetFilters);
    document.getElementById('sortSelect')?.addEventListener('change', applyFilters);
    document.getElementById('searchBtn')?.addEventListener('click', applyFilters);
    document.getElementById('searchInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') applyFilters();
    });
    
    document.querySelectorAll('.category-list a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('.category-list a.active').classList.remove('active');
            this.classList.add('active');
            applyFilters();
        });
    });
    
    function applyFilters() {
        currentPage = 1;
        const activeCategory = document.querySelector('.category-list a.active')?.dataset.category;
        const minPrice = parseInt(minPriceInput.value) || 0;
        const maxPrice = parseInt(maxPriceInput.value) || 30000;
        const searchQuery = document.getElementById('searchInput')?.value.toLowerCase();
        const sortOption = document.getElementById('sortSelect')?.value;
        
        const selectedBrands = [];
        document.querySelectorAll('.brand-checkboxes input:checked').forEach(checkbox => {
            selectedBrands.push(checkbox.value);
        });
        
        const selectedConnections = [];
        document.querySelectorAll('.connection-checkboxes input:checked').forEach(checkbox => {
            selectedConnections.push(checkbox.value);
        });
        
        const selectedRatings = [];
        document.querySelectorAll('.rating-stars input:checked').forEach(checkbox => {
            selectedRatings.push(parseInt(checkbox.value));
        });
        
        filteredProducts = products.filter(product => {
            if (product.category === 'secret') return true;
            if (activeCategory && activeCategory !== 'all' && product.category !== activeCategory) return false;
            if (product.price < minPrice || product.price > maxPrice) return false;
            if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;
            if (product.connection && selectedConnections.length > 0 && !selectedConnections.includes(product.connection)) return false;
            if (selectedRatings.length > 0 && !selectedRatings.some(r => Math.floor(product.rating) >= r)) return false;
            if (searchQuery && !product.name.toLowerCase().includes(searchQuery)) return false;
            return true;
        });
        
            filteredProducts.sort((a, b) => {
        if (a.category === 'secret') return 1;
        if (b.category === 'secret') return -1;
        return 0;
        });

        switch (sortOption) {
            case 'price-asc': filteredProducts.sort((a, b) => a.price - b.price); break;
            case 'price-desc': filteredProducts.sort((a, b) => b.price - a.price); break;
            case 'rating-desc': filteredProducts.sort((a, b) => b.rating - a.rating); break;
            case 'name-asc': filteredProducts.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'name-desc': filteredProducts.sort((a, b) => b.name.localeCompare(a.name)); break;
        }
        
        displayProducts();
    }
    
    function resetFilters() {
        document.querySelector('.category-list a[data-category="all"]').classList.add('active');
        document.querySelectorAll('.category-list a:not([data-category="all"])').forEach(link => {
            link.classList.remove('active');
        });
        
        if (priceSlider.noUiSlider) {
            priceSlider.noUiSlider.set([0, 30000]);
        }
        minPriceInput.value = '';
        maxPriceInput.value = '';
        
        document.querySelectorAll('.brand-checkboxes input, .connection-checkboxes input, .rating-stars input').forEach(checkbox => {
            checkbox.checked = true;
        });
        
        document.getElementById('searchInput').value = '';
        document.getElementById('sortSelect').value = 'default';
        
        applyFilters();
    }
    
    function displayProducts() {
        const productsGrid = document.getElementById('productsGrid');
        productsGrid.innerHTML = '';
        if (!productsGrid) return;
        
        productsGrid.innerHTML = '';
        
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = Math.min(startIndex + productsPerPage, filteredProducts.length);
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        if (paginatedProducts.length === 0) {
            productsGrid.innerHTML = '<div class="no-products">Товары не найдены. Попробуйте изменить параметры фильтрации.</div>';
        } else {
            paginatedProducts.forEach(product => {
                const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
                const isSecret = product.category === 'secret';
                
                // Определяем статус остатков
                let stockStatus = '';
                let stockClass = '';
                if (product.stock === 0) {
                    stockStatus = 'Нет в наличии';
                    stockClass = 'out-of-stock';
                } else if (product.stock <= 5) {
                    stockStatus = `Осталось: ${product.stock} шт.`;
                    stockClass = 'low-stock';
                } else {
                    stockStatus = `В наличии: ${product.stock} шт.`;
                    stockClass = 'in-stock';
                }
                
                const productCard = document.createElement('div');
                productCard.className = `product-card ${isSecret ? 'secret-item' : ''}`;
                productCard.innerHTML = `
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-price">${product.price.toLocaleString()} ₽</div>
                        <div class="product-rating">${stars} (${product.rating})</div>
                        <div class="product-stock ${stockClass}">${stockStatus}</div>
                        <p class="product-description">${product.description}</p>
                        <button class="add-to-cart" data-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
                            ${product.stock === 0 ? 'Нет в наличии' : 'В корзину'}
                        </button>
                    </div>
                `;
                
                // Добавляем обработчик клика для секретных товаров
                if (isSecret) {
                    productCard.addEventListener('click', function(e) {
                        // Открываем модальное окно только если клик не по кнопке "В корзину"
                        if (!e.target.closest('.add-to-cart')) {
                            openArtModal(product);
                        }
                    });
                    
                    // Добавляем курсор-указатель для секретных товаров
                    productCard.style.cursor = 'pointer';
                }
                
                productsGrid.appendChild(productCard);
            });
        }
        
        if (document.getElementById('productsCount')) {
            document.getElementById('productsCount').textContent = filteredProducts.length;
        }
        if (document.getElementById('currentPage')) {
            document.getElementById('currentPage').textContent = currentPage;
        }
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        if (document.getElementById('totalPages')) {
            document.getElementById('totalPages').textContent = totalPages;
        }
        
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        if (prevBtn) prevBtn.disabled = currentPage === 1;
        if (nextBtn) nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    }
    
    // Пагинация
    document.getElementById('prevPage')?.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            displayProducts();
        }
    });
    
    document.getElementById('nextPage')?.addEventListener('click', function() {
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayProducts();
        }
    });
    
    // Инициализация
    applyFilters();
    
    // Обработчик для кнопки оформления заказа
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('checkout-btn')) {
            e.preventDefault();
            
            // Проверяем, есть ли товары в корзине
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart.length === 0) {
                alert('Ваша корзина пуста');
                return;
            }
            
            // Перенаправляем на страницу оформления
            window.location.href = 'checkout.html';
        }
    });
    
    // Обработчик клика по секретным товарам (картинам)
    document.addEventListener('click', function(e) {
        const card = e.target.closest('.product-card.secret-item');
        if (card && !e.target.closest('.add-to-cart')) {
            e.preventDefault();
            const productId = parseInt(card.querySelector('.add-to-cart').getAttribute('data-id'));
            const product = products.find(p => p.id === productId);
            if (product) {
                openArtModal(product);
            }
        }
    });
    
    // Функция открытия модального окна для картины
    function openArtModal(product) {
        const modal = document.getElementById('artModal');
        const modalImg = document.getElementById('artModalImage');
        const modalTitle = document.getElementById('artModalTitle');
        const modalPrice = document.getElementById('artModalPrice');
        const modalDesc = document.getElementById('artModalDescription');
        const addToCartBtn = document.getElementById('addToCartFromModal');
        
        if (modal && modalImg && modalTitle && modalPrice && modalDesc && addToCartBtn) {
            modalImg.src = product.image;
            modalImg.alt = product.name;
            modalTitle.textContent = product.name;
            modalPrice.textContent = `${product.price.toLocaleString()} ₽`;
            modalDesc.textContent = product.description;
            
            // Обновляем data-id для кнопки добавления
            addToCartBtn.setAttribute('data-id', product.id);
            addToCartBtn.textContent = 'В корзину';
            addToCartBtn.style.backgroundColor = 'var(--primary-color)';
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Функция закрытия модального окна
    function closeArtModal() {
        console.log('Попытка закрыть модальное окно');
        const modal = document.getElementById('artModal');
        if (modal) {
            console.log('Модальное окно найдено, закрываю...');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            console.log('Модальное окно закрыто');
        } else {
            console.log('Модальное окно не найдено!');
        }
    }
    
    // Обработчики закрытия модального окна
    document.addEventListener('DOMContentLoaded', function() {
        // Клик по крестику
        const closeBtn = document.querySelector('.close-art-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                closeArtModal();
            });
        }
        
        // Клик вне модального окна
        const modal = document.getElementById('artModal');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeArtModal();
                }
            });
        }
        
        // Закрытие по клавише Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modal = document.getElementById('artModal');
                if (modal && modal.style.display === 'block') {
                    closeArtModal();
                }
            }
        });
        
        // Добавление в корзину из модального окна
        const addToCartBtn = document.getElementById('addToCartFromModal');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                const product = window.products.find(p => p.id === productId);
                
                if (product) {
                    window.addToCart(product);
                    
                    // Меняем вид кнопки на короткое время
                    this.textContent = 'Добавлено!';
                    this.style.backgroundColor = 'var(--success-color)';
                    
                    setTimeout(() => {
                        closeArtModal();
                    }, 1000);
                }
            });
        }
    });
    
    // Делаем функцию глобально доступной
    window.closeArtModal = closeArtModal;
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

// Глобальная функция для добавления в корзину (доступна для модального окна)
window.addToCart = function(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity += 1;
        } else {
            alert('Извините, товар закончился на складе!');
            return;
        }
    } else {
        if (product.stock > 0) {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1,
                stock: product.stock
            });
        } else {
            alert('Извините, товар закончился на складе!');
            return;
        }
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Обновляем счетчик корзины
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
    
    // Показываем уведомление
    showNotification(`${product.name} добавлен в корзину!`);
};

// Глобальная переменная для товаров
window.products = [
    {
        id: 1,
        name: 'Razer BlackWidow V3',
        price: 8990,
        category: 'keyboards',
        brand: 'razer',
        connection: 'wired',
        rating: 4.7,
        image: 'img/razer.jpg',
        description: 'Механическая игровая клавиатура с переключателями Razer Green',
        stock: 45
    },
    {
        id: 2,
        name: 'Logitech G Pro X',
        price: 10990,
        category: 'keyboards',
        brand: 'logitech',
        connection: 'wired',
        rating: 4.8,
        image: 'img/prox.jpg',
        description: 'Игровые наушники с микрофонной технологией BLUE VO!',
        stock: 32
    },
    {
        id: 3,
        name: 'SteelSeries Apex Pro',
        price: 14990,
        category: 'keyboards',
        brand: 'steelseries',
        connection: 'wired',
        rating: 4.9,
        image: 'img/steel.jpeg',
        description: 'Клавиатура с регулируемым ходом переключателей',
        stock: 28
    },
    {
        id: 4,
        name: 'Razer DeathAdder V2',
        price: 5990,
        category: 'mice',
        brand: 'razer',
        connection: 'wired',
        rating: 4.8,
        image: 'img/raza.jpg',
        description: 'Эргономичная игровая мышь с сенсором 20K DPI',
        stock: 67
    },
    {
        id: 5,
        name: 'Logitech G Pro Wireless',
        price: 9990,
        category: 'mice',
        brand: 'logitech',
        connection: 'wireless',
        rating: 4.9,
        image: 'img/logi.jpg',
        description: 'Беспроводная игровая мышь для киберспорта',
        stock: 23
    },
    {
        id: 6,
        name: 'SteelSeries Rival 3',
        price: 3990,
        category: 'mice',
        brand: 'steelseries',
        connection: 'wired',
        rating: 4.5,
        image: 'img/rival.jpg',
        description: 'Игровая мышь с RGB-подсветкой и 8K DPI',
        stock: 89
    },
    {
        id: 7,
        name: 'HyperX Cloud II',
        price: 7990,
        category: 'headsets',
        brand: 'hyperx',
        connection: 'wired',
        rating: 4.8,
        image: 'img/hyper.jpg',
        description: 'Игровая гарнитура с виртуальным 7.1 звуком',
        stock: 54
    },
    {
        id: 8,
        name: 'Razer BlackShark V2',
        price: 8990,
        category: 'headsets',
        brand: 'razer',
        connection: 'wired',
        rating: 4.7,
        image: 'img/raze.jpg',
        description: 'Гарнитура с микрофоном THX Spatial Audio',
        stock: 41
    },
    {
        id: 9,
        name: 'Corsair HS70 Pro',
        price: 8990,
        category: 'headsets',
        brand: 'corsair',
        connection: 'wireless',
        rating: 4.6,
        image: 'img/corsair.jpg',
        description: 'Беспроводная гарнитура с памятью формы ушей',
        stock: 38
    },
    {
        id: 11,
        name: 'Razer Raion',
        price: 6990,
        category: 'controllers',
        brand: 'razer',
        connection: 'wired',
        rating: 4.5,
        image: 'img/raion.jpg',
        description: 'Турнирный геймпад для PlayStation 4',
        stock: 15
    },
    {
        id: 12,
        name: 'Razer Goliathus Extended',
        price: 2990,
        category: 'mousepads',
        brand: 'razer',
        rating: 4.4,
        image: 'img/covyor.jpg',
        description: 'Расширенный игровой коврик для мыши',
        stock: 120
    },
    {
        id: 13,
        name: 'Авторская картина',
        price: 250000,
        category: 'secret',
        brand: 'art',
        connection: 'none',
        rating: 5,
        image: 'img/imba.PNG',
        description: 'Эксклюзивная картина ручной работы для истинных ценителей игрового искусства',
        stock: 1
    }
];

// Дополнительная инициализация модального окна
function initializeArtModal() {
    const closeBtn = document.querySelector('.close-art-modal');
    const modal = document.getElementById('artModal');
    const addToCartBtn = document.getElementById('addToCartFromModal');
    
    // Клик по крестику
    if (closeBtn) {
        closeBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeArtModal();
        };
    }
    
    // Клик вне модального окна
    if (modal) {
        modal.onclick = function(e) {
            if (e.target === modal) {
                closeArtModal();
            }
        };
    }
    
    // Добавление в корзину из модального окна
    if (addToCartBtn) {
        addToCartBtn.onclick = function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const product = window.products.find(p => p.id === productId);
            
            if (product) {
                window.addToCart(product);
                
                // Меняем вид кнопки на короткое время
                this.textContent = 'Добавлено!';
                this.style.backgroundColor = 'var(--success-color)';
                
                setTimeout(() => {
                    closeArtModal();
                }, 1000);
            }
        };
    }
}

// Инициализация при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeArtModal);
} else {
    initializeArtModal();
}

// Закрытие по клавише Escape (глобальный обработчик)
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('artModal');
        if (modal && modal.style.display === 'block') {
            closeArtModal();
        }
    }
});