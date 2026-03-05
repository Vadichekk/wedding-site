// 1. ТАЙМЕР
const weddingDate = new Date(2026, 6, 3, 16, 0); // 3 июля 2026, 16:00

function updateTimer() {
    const now = new Date();
    const diff = weddingDate - now;

    if (diff <= 0) {
        document.getElementById('days').innerText = '00';
        document.getElementById('hours').innerText = '00';
        document.getElementById('minutes').innerText = '00';
        document.getElementById('seconds').innerText = '00';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = days < 10 ? '0' + days : days;
    document.getElementById('hours').innerText = hours < 10 ? '0' + hours : hours;
    document.getElementById('minutes').innerText = minutes < 10 ? '0' + minutes : minutes;
    document.getElementById('seconds').innerText = seconds < 10 ? '0' + seconds : seconds;
}
updateTimer();
setInterval(updateTimer, 1000);

// 2. АНИМАЦИЯ ПРИ СКРОЛЛЕ
const fadeElements = document.querySelectorAll('.fade-up');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.2 });

fadeElements.forEach(el => observer.observe(el));

// 3. МУЗЫКАЛЬНЫЙ ПЛЕЕР
const musicPlayer = document.getElementById('musicPlayer');
const audio = document.getElementById('bgMusic');
const playBtn = document.getElementById('playPauseBtn');
const musicStatus = document.getElementById('musicStatus');
let isPlaying = false;

// Пытаемся загрузить музыку заранее
audio.load();

playBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    if (isPlaying) {
        audio.pause();
        musicStatus.textContent = 'Музыка выключена';
        playBtn.classList.remove('playing');
    } else {
        // Важно: воспроизведение только после действия пользователя
        audio.play()
            .then(() => {
                musicStatus.textContent = 'Сейчас играет';
                playBtn.classList.add('playing');
                console.log('Музыка играет');
            })
            .catch(error => {
                console.log('Ошибка воспроизведения:', error);
                musicStatus.textContent = 'Нажмите ещё раз';
                // Показываем сообщение об ошибке
                alert('Чтобы включить музыку, нажмите на кнопку ещё раз. Это требование браузера.');
            });
    }
    isPlaying = !isPlaying;
});

// Если музыка закончилась (не должно, т.к. loop, но на всякий случай)
audio.addEventListener('ended', function() {
    isPlaying = false;
    playBtn.classList.remove('playing');
    musicStatus.textContent = 'Музыка выключена';
});

// 4. ОТПРАВКА В ГУГЛ-ТАБЛИЦУ
const scriptURL = 'https://script.google.com/macros/s/AKfycbzVJkHZ3WUuLGjZJ9zQ_xUJXa6nPxL05fS2D3hzGj3p8XuTtD0xFjNCqcgRzcruKol2Va4/exec';

document.getElementById('rsvpForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const statusEl = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');
    
    const name = document.getElementById('name').value.trim();
    if (!name) {
        statusEl.style.color = 'red';
        statusEl.innerText = 'Пожалуйста, введите имена';
        return;
    }

    const attendance = document.querySelector('input[name="attendance"]:checked').value;
    const meal = document.getElementById('meal').value;
    const alcohol = document.getElementById('alcohol').value;
    const wishes = document.getElementById('wishes').value;

    submitBtn.disabled = true;
    submitBtn.innerText = 'Отправка...';
    statusEl.style.color = '#3a7b5b';
    statusEl.innerText = 'Отправляем...';

    try {
        await fetch(scriptURL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                sheetName: 'Лист5',
                name: name,
                attendance: attendance,
                meal: meal,
                alcohol: alcohol,
                wishes: wishes,
                timestamp: new Date().toLocaleString('ru-RU')
            })
        });

        statusEl.innerText = '✓ Спасибо! Ваш ответ записан.';
        document.getElementById('rsvpForm').reset();
    } catch (error) {
        console.error('Ошибка:', error);
        statusEl.style.color = 'red';
        statusEl.innerText = 'Ошибка при отправке. Попробуйте позже или напишите нам в Telegram.';
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Отправить подтверждение';
        setTimeout(() => { statusEl.innerText = ''; }, 5000);
    }
});