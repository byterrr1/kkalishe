document.addEventListener('DOMContentLoaded', function() {
    // Обработка формы обратной связи
    const contactForm = document.getElementById('contactForm');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        const subject = document.getElementById('contactSubject').value;
        const message = document.getElementById('contactMessage').value;
        
        // Здесь должна быть логика отправки формы (AJAX и т.д.)
        // Для примера просто покажем сообщение
        alert(`Спасибо, ${name}! Ваше сообщение отправлено. Мы свяжемся с вами в ближайшее время.`);
        
        // Сброс формы
        contactForm.reset();
    });
});