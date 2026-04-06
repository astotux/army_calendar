document.addEventListener('DOMContentLoaded', () => {
    const setupScreen = document.getElementById('setup-screen');
    const charScreen = document.getElementById('character-screen');
    const mainScreen = document.getElementById('main-screen');

    const saveBtn = document.getElementById('save-btn');
    const resetDateBtn = document.getElementById('reset-date-btn');
    const resetCharBtn = document.getElementById('reset-char-btn');
    const skipCharBtn = document.getElementById('skip-char-btn');

    // Grid painting modals
    const gridModal = document.getElementById('days-grid-modal');
    const paintModal = document.getElementById('paint-modal');
    const closeGridBtn = document.getElementById('close-grid-btn');
    const closePaintBtn = document.getElementById('close-paint-btn');
    const skipPaintBtn = document.getElementById('skip-paint-btn');

    // UI elements for main screen
    const progressBar = document.getElementById('progress-bar');
    const percentageDisplay = document.getElementById('percentage-display');
    const daysPassedEl = document.getElementById('days-passed');
    const daysRemainingEl = document.getElementById('days-remaining');
    const monthsPassedEl = document.getElementById('months-passed');
    const infoStart = document.getElementById('info-start');
    const infoEnd = document.getElementById('info-end');

    // Character setup elements
    const gifsGrid = document.getElementById('gifs-grid');
    const mainCharDisplay = document.getElementById('main-character-display');
    const mainCharImg = document.getElementById('main-character-img');

    const TOTAL_DAYS = 365;
    const NUM_GIFS = 9;

    // Gamification state
    let paintedDays = JSON.parse(localStorage.getItem('army_painted_days') || '[]');
    let currentPaintingDayIdx = null;

    // Calendar setup elements
    const calMonthYear = document.getElementById('cal-month-year');
    const calDays = document.getElementById('cal-days');
    const calPrev = document.getElementById('cal-prev');
    const calNext = document.getElementById('cal-next');

    // Mini-games elements
    const minigameScreen = document.getElementById('minigame-screen');
    const openMinigameBtn = document.getElementById('open-minigame-btn');

    const mgMenu = document.getElementById('mg-menu');
    const mgPickShoot = document.getElementById('mg-pick-shoot');
    const mgPickPairs = document.getElementById('mg-pick-pairs');
    const mgPickMath = document.getElementById('mg-pick-math');
    const mgBackBtn = document.getElementById('mg-back-btn');

    const mgShoot = document.getElementById('mg-shoot');
    const mgPairs = document.getElementById('mg-pairs');
    const mgMath = document.getElementById('mg-math');

    const mgBackBtnShoot = document.getElementById('mg-back-btn-shoot');
    const pairsBackBtn = document.getElementById('pairs-back-btn');
    const mathBackBtn = document.getElementById('math-back-btn');

    // Menu best labels
    const mgBestShootMenu = document.getElementById('mg-best-shoot');
    const mgBestPairsMenu = document.getElementById('mg-best-pairs');
    const mgBestMathMenu = document.getElementById('mg-best-math');

    // Game: Shooting
    const mgStartBtn = document.getElementById('mg-start-btn');
    const mgArena = document.getElementById('mg-arena');
    const mgTarget = document.getElementById('mg-target');
    const mgHint = document.getElementById('mg-hint');
    const mgScoreEl = document.getElementById('mg-score');
    const mgTimeEl = document.getElementById('mg-time');
    const mgBestEl = document.getElementById('mg-best');

    // Game: Pairs
    const pairsGrid = document.getElementById('pairs-grid');
    const pairsStartBtn = document.getElementById('pairs-start-btn');
    const pairsFoundEl = document.getElementById('pairs-found');
    const pairsTimeEl = document.getElementById('pairs-time');
    const pairsBestEl = document.getElementById('pairs-best');

    // Game: Math
    const mathProblemEl = document.getElementById('math-problem');
    const mathInput = document.getElementById('math-input');
    const mathStartBtn = document.getElementById('math-start-btn');
    const mathHintEl = document.getElementById('math-hint');
    const mathScoreEl = document.getElementById('math-score');
    const mathTimeEl = document.getElementById('math-time');
    const mathBestEl = document.getElementById('math-best');

    const monthNames = [
        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];

    let selectedDate = null;
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Top today date + weekly theme colors
    const todayDateEl = document.getElementById('today-date');
    if (todayDateEl) todayDateEl.textContent = formatDate(today);
    applyWeeklyTheme(today);

    // Initialization
    initGifs();

    const savedDate = localStorage.getItem('army_start_date');
    const savedChar = localStorage.getItem('army_char_id');

    if (savedDate) {
        if (savedChar !== null) {
            setupScreen.classList.add('hidden');
            charScreen.classList.add('hidden');
            showScreen(mainScreen);
            applyCharacter(savedChar);
            updateStats(savedDate);
        } else {
            showScreen(charScreen);
            setupScreen.classList.add('hidden');
            mainScreen.classList.add('hidden');
        }
    } else {
        showScreen(setupScreen);
        mainScreen.classList.add('hidden');
        charScreen.classList.add('hidden');
        renderCalendar();
    }

    // Modal Interaction
    closeGridBtn.addEventListener('click', () => {
        gridModal.classList.add('hidden');
        updateStats(localStorage.getItem('army_start_date'));
    });

    closePaintBtn.addEventListener('click', () => {
        paintModal.classList.add('hidden');
    });

    // Mini-games navigation
    if (openMinigameBtn && minigameScreen) {
        openMinigameBtn.addEventListener('click', () => {
            stopAllMinigames(true);
            refreshMinigamesBests();
            showMinigamesMenu();
            switchScreen(mainScreen, minigameScreen);
        });
    }

    if (mgBackBtn && minigameScreen) {
        mgBackBtn.addEventListener('click', () => {
            stopAllMinigames(true);
            switchScreen(minigameScreen, mainScreen);
        });
    }

    if (mgPickShoot) mgPickShoot.addEventListener('click', () => openMinigame('shoot'));
    if (mgPickPairs) mgPickPairs.addEventListener('click', () => openMinigame('pairs'));
    if (mgPickMath) mgPickMath.addEventListener('click', () => openMinigame('math'));

    if (mgBackBtnShoot) mgBackBtnShoot.addEventListener('click', () => { stopAllMinigames(true); showMinigamesMenu(); });
    if (pairsBackBtn) pairsBackBtn.addEventListener('click', () => { stopAllMinigames(true); showMinigamesMenu(); });
    if (mathBackBtn) mathBackBtn.addEventListener('click', () => { stopAllMinigames(true); showMinigamesMenu(); });

    function showMinigamesMenu() {
        if (mgMenu) mgMenu.classList.remove('hidden');
        if (mgShoot) mgShoot.classList.add('hidden');
        if (mgPairs) mgPairs.classList.add('hidden');
        if (mgMath) mgMath.classList.add('hidden');
    }

    function openMinigame(which) {
        refreshMinigamesBests();
        if (mgMenu) mgMenu.classList.add('hidden');
        if (mgShoot) mgShoot.classList.toggle('hidden', which !== 'shoot');
        if (mgPairs) mgPairs.classList.toggle('hidden', which !== 'pairs');
        if (mgMath) mgMath.classList.toggle('hidden', which !== 'math');

        if (which === 'shoot') stopMinigame(true);
        if (which === 'pairs') stopPairsGame(true);
        if (which === 'math') stopMathGame(true);
    }

    function refreshMinigamesBests() {
        const s = getShootBest();
        const p = getPairsBest();
        const m = getMathBest();
        if (mgBestShootMenu) mgBestShootMenu.textContent = String(s);
        if (mgBestPairsMenu) mgBestPairsMenu.textContent = String(p);
        if (mgBestMathMenu) mgBestMathMenu.textContent = String(m);
        if (mgBestEl) mgBestEl.textContent = String(s);
        if (pairsBestEl) pairsBestEl.textContent = String(p);
        if (mathBestEl) mathBestEl.textContent = String(m);
    }

    // Game 1: Shooting range
    const MINIGAME_DURATION = 30;
    let mgRunning = false;
    let mgScore = 0;
    let mgTimeLeft = MINIGAME_DURATION;
    let mgInterval = null;
    let mgHideTimeout = null;
    let mgSpawnTimeout = null;
    let mgSpawnedAt = 0;

    if (mgStartBtn) {
        mgStartBtn.addEventListener('click', () => {
            if (mgRunning) return;
            startMinigame();
        });
    }


    if (mgTarget) {
        mgTarget.addEventListener('click', (e) => {
            e.preventDefault();
            if (!mgRunning) return;
            hitTarget();
        });
    }

    function getShootBest() {
        return Number(localStorage.getItem('army_minigame_best_shoot') || '0') || 0;
    }

    function setShootBest(val) {
        localStorage.setItem('army_minigame_best_shoot', String(val));
    }

    function setMinigameUI(score, timeLeft, hintText) {
        if (mgScoreEl) mgScoreEl.textContent = String(score);
        if (mgTimeEl) mgTimeEl.textContent = String(timeLeft);
        if (mgHint) {
            if (hintText) {
                mgHint.textContent = hintText;
                mgHint.classList.remove('hidden');
            } else {
                mgHint.classList.add('hidden');
            }
        }
    }

    function startMinigame() {
        mgRunning = true;
        mgScore = 0;
        mgTimeLeft = MINIGAME_DURATION;
        setMinigameUI(mgScore, mgTimeLeft, '');
        if (mgStartBtn) mgStartBtn.textContent = 'Идёт...';

        spawnTarget();

        mgInterval = setInterval(() => {
            mgTimeLeft -= 1;
            if (mgTimeEl) mgTimeEl.textContent = String(mgTimeLeft);
            if (mgTimeLeft <= 0) {
                finishMinigame();
            }
        }, 1000);
    }

    function stopMinigame(resetUI) {
        mgRunning = false;
        if (mgInterval) clearInterval(mgInterval);
        if (mgHideTimeout) clearTimeout(mgHideTimeout);
        if (mgSpawnTimeout) clearTimeout(mgSpawnTimeout);
        mgInterval = null;
        mgHideTimeout = null;
        mgSpawnTimeout = null;
        if (mgTarget) mgTarget.classList.add('hidden');
        if (mgStartBtn) mgStartBtn.textContent = 'Старт';
        if (resetUI) setMinigameUI(0, MINIGAME_DURATION, '');
    }

    function finishMinigame() {
        stopMinigame(false);
        const best = getShootBest();
        if (mgScore > best) setShootBest(mgScore);
        if (mgBestEl) mgBestEl.textContent = String(Math.max(best, mgScore));
        setMinigameUI(mgScore, 0, `Время вышло! Счёт: ${mgScore}`);
        refreshMinigamesBests();
    }

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function positionTarget() {
        if (!mgArena || !mgTarget) return;
        const rect = mgArena.getBoundingClientRect();
        const size = mgTarget.offsetWidth || 66;
        const pad = 10;
        const maxX = Math.max(pad, Math.floor(rect.width - size - pad));
        const maxY = Math.max(pad, Math.floor(rect.height - size - pad));
        const x = randomInt(pad, maxX);
        const y = randomInt(pad, maxY);
        mgTarget.style.left = `${x}px`;
        mgTarget.style.top = `${y}px`;
    }

    function spawnTarget() {
        if (!mgRunning || !mgTarget) return;
        positionTarget();
        mgSpawnedAt = Date.now();
        mgTarget.classList.remove('hidden');

        const visibleMs = randomInt(650, 1100);
        mgHideTimeout = setTimeout(() => {
            if (!mgRunning) return;
            mgTarget.classList.add('hidden');
            const nextIn = randomInt(160, 380);
            mgSpawnTimeout = setTimeout(spawnTarget, nextIn);
        }, visibleMs);
    }

    function hitTarget() {
        if (!mgTarget) return;
        mgTarget.classList.add('hidden');
        if (mgHideTimeout) clearTimeout(mgHideTimeout);

        const reaction = Math.max(0, Date.now() - mgSpawnedAt);
        // Faster hit => more points (cap between 1..8)
        let points = 8 - Math.floor(reaction / 140);
        if (points < 1) points = 1;
        if (points > 8) points = 8;
        mgScore += points;
        if (mgScoreEl) mgScoreEl.textContent = String(mgScore);

        // Spawn next target immediately after a hit
        mgSpawnTimeout = setTimeout(spawnTarget, 0);
    }

    // Game 2: Pairs (memory)
    const PAIRS_DURATION = 60;
    let pairsRunning = false;
    let pairsFound = 0;
    let pairsTimeLeft = PAIRS_DURATION;
    let pairsInterval = null;
    let pairsLock = false;
    let pairsFirst = null;
    let pairsSecond = null;
    let pairsDeck = [];

    if (pairsStartBtn) pairsStartBtn.addEventListener('click', () => { if (!pairsRunning) startPairsGame(); });

    function getPairsBest() {
        return Number(localStorage.getItem('army_minigame_best_pairs') || '0') || 0;
    }

    function setPairsBest(val) {
        localStorage.setItem('army_minigame_best_pairs', String(val));
    }

    function setPairsUI() {
        if (pairsFoundEl) pairsFoundEl.textContent = String(pairsFound);
        if (pairsTimeEl) pairsTimeEl.textContent = String(pairsTimeLeft);
    }

    function buildPairsDeck() {
        const symbols = ['🪖', '🎖️', '⭐', '🔥', '⚡', '🧨', '🎯', '🏆'];
        const deck = [...symbols, ...symbols].map((v, idx) => ({ id: idx, value: v }));
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    function renderPairsGrid() {
        if (!pairsGrid) return;
        pairsGrid.innerHTML = '';
        pairsDeck.forEach((card, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'pair-card';
            btn.dataset.index = String(index);
            btn.textContent = card.value;
            btn.addEventListener('click', () => onPairClick(index, btn));
            pairsGrid.appendChild(btn);
        });
    }

    function startPairsGame() {
        pairsRunning = true;
        pairsFound = 0;
        pairsTimeLeft = PAIRS_DURATION;
        pairsLock = false;
        pairsFirst = null;
        pairsSecond = null;
        pairsDeck = buildPairsDeck();
        renderPairsGrid();
        setPairsUI();
        if (pairsStartBtn) pairsStartBtn.textContent = 'Идёт...';
        pairsInterval = setInterval(() => {
            pairsTimeLeft -= 1;
            setPairsUI();
            if (pairsTimeLeft <= 0) finishPairsGame(false);
        }, 1000);
    }

    function stopPairsGame(resetUI) {
        pairsRunning = false;
        if (pairsInterval) clearInterval(pairsInterval);
        pairsInterval = null;
        pairsLock = false;
        pairsFirst = null;
        pairsSecond = null;
        if (pairsStartBtn) pairsStartBtn.textContent = 'Старт';
        if (resetUI) {
            pairsFound = 0;
            pairsTimeLeft = PAIRS_DURATION;
            if (pairsGrid) pairsGrid.innerHTML = '';
            setPairsUI();
        }
    }

    function finishPairsGame(won) {
        stopPairsGame(false);
        const score = pairsFound; // 0..8
        const best = getPairsBest();
        if (score > best) setPairsBest(score);
        if (pairsBestEl) pairsBestEl.textContent = String(Math.max(best, score));
        refreshMinigamesBests();
        if (pairsGrid) {
            const msg = document.createElement('div');
            msg.className = 'minigame-hint';
            msg.textContent = won ? `Победа! Пары: ${score}/8` : `Время вышло! Пары: ${score}/8`;
            pairsGrid.innerHTML = '';
            pairsGrid.appendChild(msg);
        }
    }

    function onPairClick(index, btnEl) {
        if (!pairsRunning || pairsLock) return;
        if (btnEl.classList.contains('matched') || btnEl.classList.contains('revealed')) return;

        btnEl.classList.add('revealed');
        if (pairsFirst === null) {
            pairsFirst = { index, el: btnEl };
            return;
        }
        pairsSecond = { index, el: btnEl };
        pairsLock = true;

        const a = pairsDeck[pairsFirst.index].value;
        const b = pairsDeck[pairsSecond.index].value;
        if (a === b) {
            pairsFirst.el.classList.add('matched');
            pairsSecond.el.classList.add('matched');
            pairsFirst = null;
            pairsSecond = null;
            pairsLock = false;
            pairsFound += 1;
            setPairsUI();
            if (pairsFound >= 8) finishPairsGame(true);
        } else {
            setTimeout(() => {
                pairsFirst?.el.classList.remove('revealed');
                pairsSecond?.el.classList.remove('revealed');
                pairsFirst = null;
                pairsSecond = null;
                pairsLock = false;
            }, 520);
        }
    }

    // Game 3: Fast math
    const MATH_DURATION = 30;
    let mathRunning = false;
    let mathScore = 0;
    let mathTimeLeft = MATH_DURATION;
    let mathInterval = null;
    let currentMath = null;

    if (mathStartBtn) {
        mathStartBtn.addEventListener('click', () => {
            if (!mathRunning) startMathGame();
            else submitMath();
        });
    }
    if (mathInput) {
        mathInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submitMath();
        });
    }

    function getMathBest() {
        return Number(localStorage.getItem('army_minigame_best_math') || '0') || 0;
    }

    function setMathBest(val) {
        localStorage.setItem('army_minigame_best_math', String(val));
    }

    function setMathUI(hint) {
        if (mathScoreEl) mathScoreEl.textContent = String(mathScore);
        if (mathTimeEl) mathTimeEl.textContent = String(mathTimeLeft);
        if (mathHintEl) mathHintEl.textContent = hint || '';
    }

    function nextMathProblem() {
        let a = randomInt(3, 29);
        let b = randomInt(3, 29);
        const op = Math.random() < 0.55 ? '+' : '-';
        if (op === '-' && b > a) [a, b] = [b, a]; // avoid negative results (mobile keypad often has no minus)
        const res = op === '+' ? a + b : a - b;
        currentMath = { a, b, op, res };
        if (mathProblemEl) mathProblemEl.textContent = `${a} ${op} ${b} = ?`;
    }

    function startMathGame() {
        mathRunning = true;
        mathScore = 0;
        mathTimeLeft = MATH_DURATION;
        setMathUI('');
        if (mathStartBtn) mathStartBtn.textContent = 'Ок';
        nextMathProblem();
        if (mathInput) {
            mathInput.value = '';
            mathInput.focus();
        }
        mathInterval = setInterval(() => {
            mathTimeLeft -= 1;
            if (mathTimeEl) mathTimeEl.textContent = String(mathTimeLeft);
            if (mathTimeLeft <= 0) finishMathGame();
        }, 1000);
    }

    function stopMathGame(resetUI) {
        mathRunning = false;
        if (mathInterval) clearInterval(mathInterval);
        mathInterval = null;
        currentMath = null;
        if (mathStartBtn) mathStartBtn.textContent = 'Старт';
        if (resetUI) {
            mathScore = 0;
            mathTimeLeft = MATH_DURATION;
            if (mathProblemEl) mathProblemEl.textContent = '—';
            if (mathInput) mathInput.value = '';
            if (mathHintEl) mathHintEl.textContent = '';
            if (mathScoreEl) mathScoreEl.textContent = '0';
            if (mathTimeEl) mathTimeEl.textContent = String(MATH_DURATION);
        }
    }

    function finishMathGame() {
        stopMathGame(false);
        const best = getMathBest();
        if (mathScore > best) setMathBest(mathScore);
        if (mathBestEl) mathBestEl.textContent = String(Math.max(best, mathScore));
        if (mathHintEl) mathHintEl.textContent = `Время вышло! Верно: ${mathScore}`;
        refreshMinigamesBests();
    }

    function submitMath() {
        if (!mathRunning || !currentMath) return;
        const raw = (mathInput?.value || '').trim().replace(',', '.').replace(/\s+/g, '');
        const val = raw === '' ? NaN : Number(raw);
        if (mathInput) mathInput.value = '';
        if (!Number.isFinite(val)) return;
        if (val === currentMath.res) {
            mathScore += 1;
            if (mathScoreEl) mathScoreEl.textContent = String(mathScore);
            nextMathProblem();
        } else {
            // penalty: -2 seconds
            mathTimeLeft = Math.max(0, mathTimeLeft - 2);
            if (mathTimeEl) mathTimeEl.textContent = String(mathTimeLeft);
            if (mathHintEl) mathHintEl.textContent = 'Неверно (-2 сек)';
            if (mathTimeLeft <= 0) finishMathGame();
        }
    }

    function stopAllMinigames(resetUI) {
        stopMinigame(resetUI);
        stopPairsGame(resetUI);
        stopMathGame(resetUI);
    }

    const revealBtn = document.getElementById('reveal-btn');
    if (revealBtn) {
        revealBtn.addEventListener('click', () => {
            const startDate = new Date(localStorage.getItem('army_start_date'));
            startDate.setHours(0, 0, 0, 0);
            let realPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
            if (realPassed > TOTAL_DAYS) realPassed = TOTAL_DAYS;
            if (realPassed < 0) realPassed = 0;

            gridModal.classList.remove('hidden');
            renderDaysGrid(realPassed);
        });
    }

    skipPaintBtn.addEventListener('click', () => {
        const startDate = new Date(localStorage.getItem('army_start_date'));
        startDate.setHours(0, 0, 0, 0);
        let realPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        if (realPassed > TOTAL_DAYS) realPassed = TOTAL_DAYS;
        if (realPassed < 0) realPassed = 0;

        for (let i = 0; i < realPassed - 1; i++) {
            if (!paintedDays.includes(i)) paintedDays.push(i);
        }
        localStorage.setItem('army_painted_days', JSON.stringify(paintedDays));
        renderDaysGrid(realPassed);
    });

    function renderDaysGrid(realPassed) {
        const cal365 = document.getElementById('calendar-365');
        cal365.innerHTML = '';
        for (let i = 0; i < TOTAL_DAYS; i++) {
            const cell = document.createElement('div');
            cell.classList.add('day-cell');

            if (paintedDays.includes(i)) {
                cell.classList.add('painted');
            } else if (i < realPassed) {
                cell.classList.add('available');
                cell.addEventListener('click', () => {
                    openPaintModal(i, realPassed);
                });
            } else {
                cell.classList.add('future');
            }
            cal365.appendChild(cell);
        }
    }

    function openPaintModal(dayIdx, realPassed) {
        currentPaintingDayIdx = dayIdx;
        paintModal.classList.remove('hidden');
        document.getElementById('paint-pct').textContent = '0';
        initCanvas();
    }

    function initCanvas() {
        const container = document.querySelector('.canvas-container');
        const dayNumber = String((currentPaintingDayIdx ?? 0) + 1);
        container.innerHTML = `
            <div class="paint-day-number" aria-hidden="true">${dayNumber}</div>
            <canvas id="paint-canvas"></canvas>
        `;
        const c = document.getElementById('paint-canvas');
        const ctx = c.getContext('2d');

        c.width = container.clientWidth;
        c.height = container.clientHeight;

        const cover = getComputedStyle(document.documentElement).getPropertyValue('--surface-color').trim();
        ctx.fillStyle = cover;
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 60;
        ctx.globalCompositeOperation = 'destination-out';

        let isDrawing = false;
        let lastX = 0, lastY = 0;

        function getCoords(e) {
            const rect = c.getBoundingClientRect();
            let clientX, clientY;
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        function startPaint(e) {
            isDrawing = true;
            const coords = getCoords(e);
            lastX = coords.x;
            lastY = coords.y;
            drawPaint(e);
        }

        function drawPaint(e) {
            if (!isDrawing) return;
            e.preventDefault();
            const coords = getCoords(e);
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
            lastX = coords.x;
            lastY = coords.y;
            checkCompletion();
        }

        function stopPaint() {
            isDrawing = false;
        }

        let checkTimeout = null;
        function checkCompletion() {
            if (checkTimeout) return;
            checkTimeout = setTimeout(() => {
                const imgData = ctx.getImageData(0, 0, c.width, c.height).data;
                let erased = 0;
                for (let i = 3; i < imgData.length; i += 4) {
                    if (imgData[i] < 128) erased++;
                }
                const pct = Math.floor(erased / (imgData.length / 4) * 100);
                document.getElementById('paint-pct').textContent = pct;

                if (pct >= 98) {
                    if (!paintedDays.includes(currentPaintingDayIdx)) {
                        paintedDays.push(currentPaintingDayIdx);
                    }
                    localStorage.setItem('army_painted_days', JSON.stringify(paintedDays));
                    paintModal.classList.add('hidden');

                    const startDate = new Date(localStorage.getItem('army_start_date'));
                    startDate.setHours(0, 0, 0, 0);
                    let realPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
                    renderDaysGrid(realPassed);
                }
                checkTimeout = null;
            }, 100);
        }

        c.addEventListener('mousedown', startPaint);
        c.addEventListener('mousemove', drawPaint);
        c.addEventListener('mouseup', stopPaint);
        c.addEventListener('mouseleave', stopPaint);

        c.addEventListener('touchstart', startPaint, { passive: false });
        c.addEventListener('touchmove', drawPaint, { passive: false });
        c.addEventListener('touchend', stopPaint);
    }

    function initGifs() {
        gifsGrid.innerHTML = '';
        for (let i = 1; i <= NUM_GIFS; i++) {
            const img = document.createElement('img');
            img.src = `gifs/${i}.gif`;
            img.classList.add('gif-option');
            img.dataset.id = i;

            img.addEventListener('click', () => {
                document.querySelectorAll('.gif-option').forEach(el => el.classList.remove('selected'));
                img.classList.add('selected');

                localStorage.setItem('army_char_id', i);
                setTimeout(() => {
                    applyCharacter(i);
                    switchScreen(charScreen, mainScreen);
                    updateStats(localStorage.getItem('army_start_date'));
                }, 300);
            });

            gifsGrid.appendChild(img);
        }
    }

    function applyCharacter(charId) {
        if (!charId || charId === 'none') {
            mainCharDisplay.style.display = 'none';
        } else {
            mainCharDisplay.style.display = 'flex';
            mainCharImg.src = `gifs/${charId}.gif`;
        }
    }

    // Initial setup calendar logic
    function renderCalendar() {
        if (!calDays) return;
        calDays.innerHTML = '';
        calMonthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;

        let firstDay = new Date(currentYear, currentMonth, 1).getDay();
        firstDay = firstDay === 0 ? 6 : firstDay - 1;

        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('cal-day', 'empty');
            calDays.appendChild(emptyCell);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const cellDate = new Date(currentYear, currentMonth, i);
            const cell = document.createElement('div');
            cell.classList.add('cal-day');
            cell.textContent = i;

            if (cellDate > today) {
                cell.classList.add('disabled');
            } else {
                cell.addEventListener('click', () => {
                    document.querySelectorAll('.cal-day.selected').forEach(el => el.classList.remove('selected'));
                    cell.classList.add('selected');
                    selectedDate = cellDate;
                });

                if (selectedDate &&
                    selectedDate.getDate() === i &&
                    selectedDate.getMonth() === currentMonth &&
                    selectedDate.getFullYear() === currentYear) {
                    cell.classList.add('selected');
                }
            }

            if (i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                cell.classList.add('today');
            }

            calDays.appendChild(cell);
        }
    }

    if (calPrev && calNext) {
        calPrev.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });

        calNext.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });
    }

    // Buttons overrides
    saveBtn.addEventListener('click', () => {
        if (!selectedDate) {
            const calContainer = document.querySelector('.custom-calendar-container');
            calContainer.style.borderColor = 'var(--danger-color)';
            calContainer.style.boxShadow = '0 0 10px rgba(244, 63, 94, 0.4)';
            setTimeout(() => {
                calContainer.style.borderColor = 'var(--surface-light)';
                calContainer.style.boxShadow = 'none';
            }, 1000);
            return;
        }

        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const selectedDateStr = `${year}-${month}-${day}`;

        localStorage.setItem('army_start_date', selectedDateStr);
        // Clear history upon date change to refresh 365 grid
        localStorage.removeItem('army_painted_days');
        paintedDays = [];

        const charId = localStorage.getItem('army_char_id');
        if (charId !== null) {
            switchScreen(setupScreen, mainScreen);
            updateStats(selectedDateStr);
        } else {
            switchScreen(setupScreen, charScreen);
        }
    });

    skipCharBtn.addEventListener('click', () => {
        localStorage.setItem('army_char_id', 'none');
        switchScreen(charScreen, mainScreen);
        applyCharacter('none');
        updateStats(localStorage.getItem('army_start_date'));
    });

    resetDateBtn.addEventListener('click', () => {
        selectedDate = new Date(localStorage.getItem('army_start_date'));
        currentMonth = selectedDate.getMonth() || today.getMonth();
        currentYear = selectedDate.getFullYear() || today.getFullYear();
        renderCalendar();
        switchScreen(mainScreen, setupScreen);
    });

    resetCharBtn.addEventListener('click', () => {
        document.querySelectorAll('.gif-option').forEach(el => el.classList.remove('selected'));
        const currentId = localStorage.getItem('army_char_id');
        if (currentId && currentId !== 'none') {
            const img = document.querySelector(`.gif-option[data-id="${currentId}"]`);
            if (img) img.classList.add('selected');
        }
        switchScreen(mainScreen, charScreen);
    });

    function showScreen(screen) {
        screen.classList.remove('hidden');
        screen.classList.add('animating-in');
        setTimeout(() => screen.classList.remove('animating-in'), 500);
    }

    function switchScreen(hideScreen, showScr) {
        hideScreen.classList.add('hidden');
        showScreen(showScr);
    }

    function updateStats(startDateStr) {
        if (!startDateStr) return;
        const startDate = new Date(startDateStr);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + TOTAL_DAYS);

        let passedTime = today - startDate;
        let realPassedDays = Math.floor(passedTime / (1000 * 60 * 60 * 24));

        if (realPassedDays < 0) realPassedDays = 0;
        if (realPassedDays > TOTAL_DAYS) realPassedDays = TOTAL_DAYS;

        let paintedCount = paintedDays.length;

        if (realPassedDays > paintedCount) {
            daysPassedEl.style.color = "var(--text-main)";
            daysPassedEl.textContent = '?';
            daysRemainingEl.textContent = '?';
            if (monthsPassedEl) monthsPassedEl.textContent = '?';
            percentageDisplay.textContent = '?%';
            progressBar.style.width = '0%';

            const revealContainer = document.getElementById('reveal-btn-container');
            if (revealContainer) revealContainer.style.display = 'block';
        } else {
            daysPassedEl.style.color = "var(--success-color)";
            daysPassedEl.textContent = paintedCount;
            if (monthsPassedEl) monthsPassedEl.textContent = String(calcFullMonthsPassed(startDate, today));

            const revealContainer = document.getElementById('reveal-btn-container');
            if (revealContainer) revealContainer.style.display = 'none';

            // Stats track painted progress
            const remainingDays = TOTAL_DAYS - paintedCount;
            let percentage = (paintedCount / TOTAL_DAYS) * 100;

            setTimeout(() => {
                animateValue(daysRemainingEl, TOTAL_DAYS, remainingDays, 1200);
                progressBar.style.width = `${percentage}%`;
                animatePercentage(percentageDisplay, 0, percentage, 1200);
            }, 100);
        }

        infoStart.textContent = formatDate(startDate);
        infoEnd.textContent = formatDate(endDate);
    }

    function calcFullMonthsPassed(fromDate, toDate) {
        // Full calendar months elapsed (e.g. 15 Jan -> 14 Feb = 0, -> 15 Feb = 1)
        const fromY = fromDate.getFullYear();
        const fromM = fromDate.getMonth();
        const toY = toDate.getFullYear();
        const toM = toDate.getMonth();
        let months = (toY - fromY) * 12 + (toM - fromM);
        if (toDate.getDate() < fromDate.getDate()) months -= 1;
        if (months < 0) months = 0;
        return months;
    }

    function formatDate(dateObj) {
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const yyyy = dateObj.getFullYear();
        return `${dd}.${mm}.${yyyy}`;
    }

    function getISOWeek(dateObj) {
        const d = new Date(dateObj);
        d.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year.
        d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
        const week1 = new Date(d.getFullYear(), 0, 4);
        week1.setHours(0, 0, 0, 0);
        return 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    }

    function applyWeeklyTheme(dateObj) {
        const palettes = [
            {
                bg: '#1a1c14', surface: '#272c19', surfaceLight: '#4b5320',
                primary: '#6b8e23', stripeA: '#4b5320', stripeB: '#556b2f', success: '#8fbc8f'
            }, // olive classic
            {
                bg: '#07131d', surface: '#0b2233', surfaceLight: '#134b6a',
                primary: '#0ea5e9', stripeA: '#0ea5e9', stripeB: '#0284c7', success: '#22c55e'
            }, // sky
            {
                bg: '#140b1f', surface: '#23113a', surfaceLight: '#3b1f63',
                primary: '#a855f7', stripeA: '#a855f7', stripeB: '#7c3aed', success: '#34d399'
            }, // violet
            {
                bg: '#1a1208', surface: '#2b1c0a', surfaceLight: '#5a3a12',
                primary: '#f59e0b', stripeA: '#f59e0b', stripeB: '#d97706', success: '#84cc16'
            }, // amber
            {
                bg: '#19090b', surface: '#2a0f12', surfaceLight: '#5a1b22',
                primary: '#ef4444', stripeA: '#ef4444', stripeB: '#b91c1c', success: '#22c55e'
            }, // red
            {
                bg: '#061511', surface: '#0b241e', surfaceLight: '#13453a',
                primary: '#10b981', stripeA: '#10b981', stripeB: '#059669', success: '#8fbc8f'
            }, // emerald
        ];

        const week = getISOWeek(dateObj);
        const p = palettes[(week - 1) % palettes.length];

        const root = document.documentElement;
        root.style.setProperty('--bg-color', p.bg);
        root.style.setProperty('--surface-color', p.surface);
        root.style.setProperty('--surface-light', p.surfaceLight);
        root.style.setProperty('--primary-color', p.primary);
        root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${shade(p.primary, -12)}, ${shade(p.primary, -22)})`);
        root.style.setProperty('--primary-glow', hexToRgba(p.primary, 0.35));
        root.style.setProperty('--success-color', p.success);
        root.style.setProperty('--stripe-a', p.stripeA);
        root.style.setProperty('--stripe-b', p.stripeB);

        const themeMeta = document.querySelector('meta[name="theme-color"]');
        if (themeMeta) themeMeta.setAttribute('content', getComputedStyle(root).getPropertyValue('--bg-color').trim() || '#1a1c14');
    }

    function hexToRgba(hex, alpha) {
        const h = hex.replace('#', '').trim();
        const full = h.length === 3 ? h.split('').map(ch => ch + ch).join('') : h;
        const num = parseInt(full, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function shade(hex, percent) {
        const h = hex.replace('#', '').trim();
        const full = h.length === 3 ? h.split('').map(ch => ch + ch).join('') : h;
        const num = parseInt(full, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        const t = percent < 0 ? 0 : 255;
        const p = Math.abs(percent) / 100;
        const nr = Math.round((t - r) * p) + r;
        const ng = Math.round((t - g) * p) + g;
        const nb = Math.round((t - b) * p) + b;
        return `#${(1 << 24 | (nr << 16) | (ng << 8) | nb).toString(16).slice(1)}`;
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);

            obj.innerHTML = Math.floor(easeOut * (end - start) + start);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end;
            }
        };
        window.requestAnimationFrame(step);
    }

    function animatePercentage(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = easeOut * (end - start) + start;

            let displayVal = current;
            if (current < 100 && current > 0) displayVal = current.toFixed(2);
            else displayVal = Math.round(current);

            obj.innerHTML = `${displayVal}%`;

            if (progress < 1) window.requestAnimationFrame(step);
            else obj.innerHTML = (end === 100 || end === 0) ? `${Math.round(end)}%` : `${end.toFixed(2)}%`;
        };
        window.requestAnimationFrame(step);
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const drawer = document.getElementById('settings-drawer');
    const toggle = document.getElementById('settings-toggle');

    drawer.classList.add('collapsed');

    toggle.addEventListener('click', () => {
        drawer.classList.toggle('collapsed');
    });
});