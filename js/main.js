document.addEventListener('DOMContentLoaded', () => {
    // ========== ЭЛЕМЕНТЫ DOM ==========
    const quizContainer = document.getElementById('quizContainer');
    const questionText = document.getElementById('questionText');
    const answersGrid = document.getElementById('answersGrid');
    const questionCounter = document.getElementById('questionCounter');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const progressFill = document.getElementById('progressFill');
    const btnResults = document.getElementById('btnResults');
    const resultsContainer = document.getElementById('resultsContainer');
    const finalScore = document.getElementById('finalScore');
    const resultsMessage = document.getElementById('resultsMessage');
    const resultsEmoji = document.getElementById('resultsEmoji');
    const btnRestart = document.getElementById('btnRestart');
    const starCanvas = document.getElementById('starfield');
    const ctx = starCanvas.getContext('2d');
    const questions = [
        { question: "Какая планета известна как Красная планета?", answers: ["Земля", "Марс", "Юпитер", "Венера"], correct: 1 },
        { question: "Сколько естественных спутников у Марса?", answers: ["1", "2", "4", "0"], correct: 1 },
        { question: "Какая планета самая большая в Солнечной системе?", answers: ["Сатурн", "Юпитер", "Уран", "Нептун"], correct: 1 },
        { question: "Что является центром Солнечной системы?", answers: ["Земля", "Солнце", "Луна", "Юпитер"], correct: 1 },
        { question: "Какая планета известна своими яркими кольцами?", answers: ["Марс", "Венера", "Сатурн", "Меркурий"], correct: 2 },
        { question: "Самая близкая к Солнцу планета?", answers: ["Венера", "Меркурий", "Земля", "Марс"], correct: 1 },
        { question: "Млечный Путь — это...", answers: ["Созвездие", "Галактика", "Планета", "Чёрная дыра"], correct: 1 },
        { question: "Как называется наша галактика?", answers: ["Андромеда", "Млечный Путь", "Треугольник", "Большое Магелланово Облако"], correct: 1 },
        { question: "Сколько планет в Солнечной системе (по определению МАС)?", answers: ["7", "8", "9", "10"], correct: 1 },
        { question: "Какая планета укутана плотными облаками из серной кислоты?", answers: ["Венера", "Нептун", "Юпитер", "Уран"], correct: 0 }
    ];
    let currentQuestionIndex = 0;
    let score = 0;
    let canAnswer = true;
    function resizeCanvas() {
        starCanvas.width = window.innerWidth;
        starCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const stars = [];
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * starCanvas.width,
            y: Math.random() * starCanvas.height,
            radius: Math.random() * 2.5 + 0.5,
            speed: Math.random() * 0.5 + 0.2
        });
    }

    function drawStars() {
        ctx.clearRect(0, 0, starCanvas.width, starCanvas.height);
        ctx.fillStyle = 'white';
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fill();
            star.y += star.speed;
            if (star.y > starCanvas.height) {
                star.y = 0;
                star.x = Math.random() * starCanvas.width;
            }
        });
        requestAnimationFrame(drawStars);
    }
    drawStars();

    let audioCtx = null;
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playSound(type) {
        if (!audioCtx) return;
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.gain.value = 0.1;
        oscillator.type = 'sine';
        if (type === 'correct') {
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.15);
        } else {
            oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
        }
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.3);
    }

    function createParticles(x, y) {
        const colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff88'];
        for (let i = 0; i < 14; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${x + (Math.random() - 0.5) * 40}px`;
            particle.style.top = `${y + (Math.random() - 0.5) * 40}px`;
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.animationDuration = `${0.6 + Math.random() * 0.5}s`;
            quizContainer.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }
    }

    function loadQuestion(index) {
        const q = questions[index];
        questionText.textContent = q.question;
        answersGrid.innerHTML = '';
        q.answers.forEach((answer, i) => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.textContent = answer;
            btn.addEventListener('click', (e) => selectAnswer(i, e));
            answersGrid.appendChild(btn);
        });
        questionCounter.textContent = `Вопрос ${index + 1} из ${questions.length}`;
        progressFill.style.width = `${((index) / questions.length) * 100}%`;
        canAnswer = true;
        btnResults.classList.add('hidden');
    }

    function selectAnswer(selectedIndex, event) {
        if (!canAnswer) return;
        canAnswer = false;
        initAudio();

        const q = questions[currentQuestionIndex];
        const buttons = document.querySelectorAll('.answer-btn');
        const correctIndex = q.correct;

        buttons.forEach((btn, i) => {
            btn.disabled = true;
            if (i === correctIndex) {
                btn.classList.add('correct');
            } else if (i === selectedIndex && i !== correctIndex) {
                btn.classList.add('incorrect');
            }
        });

        if (selectedIndex === correctIndex) {
            score++;
            scoreDisplay.textContent = `Счёт: ${score}`;
            playSound('correct');
            const rect = event.target.getBoundingClientRect();
            createParticles(rect.left + rect.width / 2, rect.top);
        } else {
            playSound('incorrect');
            quizContainer.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                quizContainer.style.animation = '';
            }, 500);
        }

        progressFill.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
        if (currentQuestionIndex === questions.length - 1) {
            setTimeout(() => {
                btnResults.classList.remove('hidden');
            }, 600);
        } else {
            setTimeout(() => {
                currentQuestionIndex++;
                loadQuestion(currentQuestionIndex);
            }, 1200);
        }
    }

    function showResults() {
        resultsContainer.classList.remove('hidden');
        finalScore.textContent = score;
        let message, emoji;
        if (score === 10) {
            message = 'Абсолютное знание космоса!';
            emoji = '👑';
        } else if (score >= 7) {
            message = 'Отличные знания!';
            emoji = '🛰️';
        } else if (score >= 4) {
            message = 'Продолжай изучать Вселенную!';
            emoji = '🌠';
        } else {
            message = 'Пора отправляться к звёздам!';
            emoji = '📡';
        }
        resultsMessage.textContent = message;
        resultsEmoji.textContent = emoji;
    }

    function restartQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        scoreDisplay.textContent = 'Счёт: 0';
        resultsContainer.classList.add('hidden');
        btnResults.classList.add('hidden');
        loadQuestion(0);
        progressFill.style.width = '10%';
    }

    btnResults.addEventListener('click', showResults);
    btnRestart.addEventListener('click', restartQuiz);

    loadQuestion(0);
});