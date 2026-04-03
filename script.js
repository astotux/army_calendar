document.addEventListener('DOMContentLoaded', () => {
    const setupScreen = document.getElementById('setup-screen');
    const charScreen = document.getElementById('character-screen');
    const mainScreen = document.getElementById('main-screen');
    
    const saveBtn = document.getElementById('save-btn');
    const resetDateBtn = document.getElementById('reset-date-btn');
    const resetCharBtn = document.getElementById('reset-char-btn');
    const skipCharBtn = document.getElementById('skip-char-btn');

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

    // Calendar elements
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
    today.setHours(0,0,0,0);

    // Render 9 gifs in character screen
    function initGifs() {
        gifsGrid.innerHTML = '';
        for(let i = 1; i <= NUM_GIFS; i++) {
            const img = document.createElement('img');
            img.src = `gifs/${i}.gif`;
            img.classList.add('gif-option');
            img.dataset.id = i;
            
            img.addEventListener('click', () => {
                document.querySelectorAll('.gif-option').forEach(el => el.classList.remove('selected'));
                img.classList.add('selected');
                
                // Save and transition
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

    initGifs();

    function applyCharacter(charId) {
        if (!charId || charId === 'none') {
            mainCharDisplay.style.display = 'none';
        } else {
            mainCharDisplay.style.display = 'flex';
            mainCharImg.src = `gifs/${charId}.gif`;
        }
    }

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

    // App Initialization
    const savedDate = localStorage.getItem('army_start_date');
    const savedChar = localStorage.getItem('army_char_id');

    if (savedDate) {
        if (savedChar !== null) { // Has both date and character (even if 'none')
            showScreen(mainScreen);
            setupScreen.classList.add('hidden');
            charScreen.classList.add('hidden');
            applyCharacter(savedChar);
            updateStats(savedDate);
        } else { // Has date but no character
            showScreen(charScreen);
            setupScreen.classList.add('hidden');
            mainScreen.classList.add('hidden');
        }
    } else { // First time setup
        showScreen(setupScreen);
        mainScreen.classList.add('hidden');
        charScreen.classList.add('hidden');
        renderCalendar();
    }

    // Buttons Logic
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
        
        // Check if character was already selected
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
        // Change Date only
        selectedDate = new Date(localStorage.getItem('army_start_date'));
        currentMonth = selectedDate.getMonth() || today.getMonth();
        currentYear = selectedDate.getFullYear() || today.getFullYear();
        renderCalendar();
        switchScreen(mainScreen, setupScreen);
    });

    resetCharBtn.addEventListener('click', () => {
        // Change Character only
        // Clear visually current selection on screen
        document.querySelectorAll('.gif-option').forEach(el => el.classList.remove('selected'));
        const currentId = localStorage.getItem('army_char_id');
        if (currentId && currentId !== 'none') {
            const img = document.querySelector(`.gif-option[data-id="${currentId}"]`);
            if(img) img.classList.add('selected');
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

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        let passedTime = now - startDate;
        let passedDays = Math.floor(passedTime / (1000 * 60 * 60 * 24));

        if (passedDays < 0) passedDays = 0;
        if (passedDays > TOTAL_DAYS) passedDays = TOTAL_DAYS;

        const remainingDays = TOTAL_DAYS - passedDays;
        let percentage = (passedDays / TOTAL_DAYS) * 100;

        setTimeout(() => {
            animateValue(daysPassedEl, 0, passedDays, 1200);
            animateValue(daysRemainingEl, TOTAL_DAYS, remainingDays, 1200);
            progressBar.style.width = `${percentage}%`;
            animatePercentage(percentageDisplay, 0, percentage, 1200);
        }, 100);

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
            if (current < 100 && current > 0) {
                displayVal = current.toFixed(2);
            } else if (current === 100 || current === 0) {
                displayVal = Math.round(current);
            } else {
                displayVal = current.toFixed(2);
            }
            
            obj.innerHTML = `${displayVal}%`;
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                if (end === 100 || end === 0) {
                    obj.innerHTML = `${Math.round(end)}%`;
                } else {
                    obj.innerHTML = `${end.toFixed(2)}%`;
                }
            }
        };
        window.requestAnimationFrame(step);
    }
});
