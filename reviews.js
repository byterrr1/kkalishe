document.addEventListener('DOMContentLoaded', function() {
    // Оценка звездами
    const stars = document.querySelectorAll('.rating-stars i');
    const ratingInput = document.getElementById('reviewRating');
    
    stars.forEach(star => {
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            highlightStars(rating);
        });
        
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            ratingInput.value = rating;
        });
    });
    
    document.querySelector('.rating-stars').addEventListener('mouseleave', function() {
        const currentRating = parseInt(ratingInput.value);
        highlightStars(currentRating);
    });
    
    function highlightStars(rating) {
        stars.forEach(star => {
            const starRating = parseInt(star.getAttribute('data-rating'));
            if (starRating <= rating) {
                star.classList.add('fas');
                star.classList.remove('far');
            } else {
                star.classList.add('far');
                star.classList.remove('fas');
            }
        });
    }
    
    // Обработка формы отзыва
    const reviewForm = document.getElementById('reviewForm');
    
    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('reviewName').value;
        const email = document.getElementById('reviewEmail').value;
        const rating = parseInt(ratingInput.value);
        const text = document.getElementById('reviewText').value;
        
        if (rating === 0) {
            alert('Пожалуйста, поставьте оценку');
            return;
        }
        
        // Добавление нового отзыва
        addNewReview(name, rating, text);
        
        // Сброс формы
        reviewForm.reset();
        ratingInput.value = 0;
        highlightStars(0);
        
        // Обновление статистики
        updateReviewsStats();
    });
    
    function addNewReview(name, rating, text) {
        const reviewsList = document.querySelector('.reviews-list');
        const now = new Date();
        const date = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth()+1).toString().padStart(2, '0')}.${now.getFullYear()}`;
        
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card animate-card';
        
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }
        
        reviewCard.innerHTML = `
            <div class="review-header">
                <div class="review-author">${name}</div>
                <div class="review-date">${date}</div>
                <div class="review-rating">
                    ${starsHtml}
                </div>
            </div>
            <div class="review-text">
                ${text}
            </div>
        `;
        
        reviewsList.prepend(reviewCard);
    }
    
    function updateReviewsStats() {
        // В реальном проекте здесь была бы логика подсчета статистики
        // Для примера просто увеличим общий рейтинг немного
        const totalRatingElement = document.querySelector('.total-rating');
        let currentRating = parseFloat(totalRatingElement.textContent);
        currentRating = Math.min(5, currentRating + 0.1);
        totalRatingElement.textContent = currentRating.toFixed(1);
    }
});