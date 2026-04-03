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

    const monthNames = [
        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];

    let selectedDate = null;
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
        container.innerHTML = '<canvas id="paint-canvas"></canvas>';
        const c = document.getElementById('paint-canvas');
        const ctx = c.getContext('2d');

        c.width = container.clientWidth;
        c.height = container.clientHeight;

        ctx.fillStyle = '#272c19';
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

                if (pct >= 99.5) {
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
            percentageDisplay.textContent = '?%';
            progressBar.style.width = '0%';

            const revealContainer = document.getElementById('reveal-btn-container');
            if (revealContainer) revealContainer.style.display = 'block';
        } else {
            daysPassedEl.style.color = "var(--success-color)";
            daysPassedEl.textContent = paintedCount;

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

    function formatDate(dateObj) {
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const yyyy = dateObj.getFullYear();
        return `${dd}.${mm}.${yyyy}`;
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