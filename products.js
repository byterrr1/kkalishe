document.addEventListener('DOMContentLoaded', function() {
    // Инициализация слайдера цены
    const priceSlider = document.getElementById('price-slider');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    
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
    
    // Загрузка товаров
    const products = [
        {
            id: 1,
            name: 'Razer BlackWidow V3',
            price: 8990,
            category: 'keyboards',
            brand: 'razer',
            connection: 'wired',
            rating: 4.7,
            image: 'img/razer.jpg',
            description: 'Механическая игровая клавиатура с переключателями Razer Green'
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
            description: 'Игровые наушники с микрофонной технологией BLUE VO!'
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
            description: 'Клавиатура с регулируемым ходом переключателей'
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
            description: 'Эргономичная игровая мышь с сенсором 20K DPI'
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
            description: 'Беспроводная игровая мышь для киберспорта'
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
            description: 'Игровая мышь с RGB-подсветкой и 8K DPI'
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
            description: 'Игровая гарнитура с виртуальным 7.1 звуком'
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
            description: 'Гарнитура с микрофоном THX Spatial Audio'
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
            description: 'Беспроводная гарнитура с памятью формы ушей'
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
            description: 'Турнирный геймпад для PlayStation 4'
        },
        {
            id: 12,
            name: 'Razer Goliathus Extended',
            price: 2990,
            category: 'mousepads',
            brand: 'razer',
            rating: 4.4,
            image: 'img/covyor.jpg',
            description: 'Расширенный игровой коврик для мыши'
        }
    ];
    
    let filteredProducts = [...products];
    let currentPage = 1;
    const productsPerPage = 6;
    
    // Применение фильтров
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    document.getElementById('sortSelect').addEventListener('change', applyFilters);
    document.getElementById('searchBtn').addEventListener('click', applyFilters);
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') applyFilters();
    });
    
    // Пагинация
    document.getElementById('prevPage').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            displayProducts();
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', function() {
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayProducts();
        }
    });
    
    // Категории
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
        
        // Получаем значения фильтров
        const activeCategory = document.querySelector('.category-list a.active').dataset.category;
        const minPrice = parseInt(minPriceInput.value) || 0;
        const maxPrice = parseInt(maxPriceInput.value) || 30000;
        const searchQuery = document.getElementById('searchInput').value.toLowerCase();
        const sortOption = document.getElementById('sortSelect').value;
        
        // Получаем выбранные бренды
        const selectedBrands = [];
        document.querySelectorAll('.brand-checkboxes input:checked').forEach(checkbox => {
            selectedBrands.push(checkbox.value);
        });
        
        // Получаем выбранные типы подключения
        const selectedConnections = [];
        document.querySelectorAll('.connection-checkboxes input:checked').forEach(checkbox => {
            selectedConnections.push(checkbox.value);
        });
        
        // Получаем выбранные рейтинги
        const selectedRatings = [];
        document.querySelectorAll('.rating-stars input:checked').forEach(checkbox => {
            selectedRatings.push(parseInt(checkbox.value));
        });
        
        // Фильтрация
        filteredProducts = products.filter(product => {
            // Фильтр по категории
            if (activeCategory !== 'all' && product.category !== activeCategory) return false;
            
            // Фильтр по цене
            if (product.price < minPrice || product.price > maxPrice) return false;
            
            // Фильтр по бренду
            if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;
            
            // Фильтр по подключению (если есть это свойство)
            if (product.connection && selectedConnections.length > 0 && !selectedConnections.includes(product.connection)) return false;
            
            // Фильтр по рейтингу
            if (selectedRatings.length > 0) {
                const productRating = Math.floor(product.rating);
                if (!selectedRatings.some(r => productRating >= r)) return false;
            }
            
            // Поиск по названию
            if (searchQuery && !product.name.toLowerCase().includes(searchQuery)) return false;
            
            return true;
        });
        
        // Сортировка
        switch (sortOption) {
            case 'price-asc':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'rating-desc':
                filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
            case 'name-asc':
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
        }
        
        displayProducts();
    }
    
    function resetFilters() {
        // Сброс категории
        document.querySelector('.category-list a[data-category="all"]').classList.add('active');
        document.querySelectorAll('.category-list a:not([data-category="all"])').forEach(link => {
            link.classList.remove('active');
        });
        
        // Сброс слайдера цены
        priceSlider.noUiSlider.set([0, 30000]);
        minPriceInput.value = '';
        maxPriceInput.value = '';
        
        // Сброс чекбоксов
        document.querySelectorAll('.brand-checkboxes input, .connection-checkboxes input, .rating-stars input').forEach(checkbox => {
            checkbox.checked = true;
        });
        
        // Сброс поиска
        document.getElementById('searchInput').value = '';
        
        // Сброс сортировки
        document.getElementById('sortSelect').value = 'default';
        
        applyFilters();
    }
    
    function displayProducts() {
        const productsGrid = document.getElementById('productsGrid');
        productsGrid.innerHTML = '';
        
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = Math.min(startIndex + productsPerPage, filteredProducts.length);
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        if (paginatedProducts.length === 0) {
            productsGrid.innerHTML = '<div class="no-products">Товары не найдены. Попробуйте изменить параметры фильтрации.</div>';
        } else {
            paginatedProducts.forEach(product => {
                const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
                
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-price">${product.price.toLocaleString()} ₽</div>
                        <div class="product-rating">${stars} (${product.rating})</div>
                        <p class="product-description">${product.description}</p>
                        <button class="add-to-cart" data-id="${product.id}">В корзину</button>
                    </div>
                `;
                productsGrid.appendChild(productCard);
            });
        }
        
        // Обновление информации о пагинации
        document.getElementById('productsCount').textContent = filteredProducts.length;
        document.getElementById('currentPage').textContent = currentPage;
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        document.getElementById('totalPages').textContent = totalPages;
        
        // Блокировка/разблокировка кнопок пагинации
        document.getElementById('prevPage').disabled = currentPage === 1;
        document.getElementById('nextPage').disabled = currentPage === totalPages || totalPages === 0;
        
        // Добавление обработчиков для кнопок "В корзину"
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                const product = products.find(p => p.id === productId);
                
                addToCart(product);
            });
        });
    }
    
    // Инициализация
    applyFilters();
});