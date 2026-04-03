document.addEventListener('DOMContentLoaded', () => {
    const setupScreen = document.getElementById('setup-screen');
    const mainScreen = document.getElementById('main-screen');
    const saveBtn = document.getElementById('save-btn');
    const resetBtn = document.getElementById('reset-btn');

    // UI elements for main screen
    const progressBar = document.getElementById('progress-bar');
    const percentageDisplay = document.getElementById('percentage-display');
    const daysPassedEl = document.getElementById('days-passed');
    const daysRemainingEl = document.getElementById('days-remaining');
    const infoStart = document.getElementById('info-start');
    const infoEnd = document.getElementById('info-end');

    const TOTAL_DAYS = 365;

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

    function renderCalendar() {
        if (!calDays) return;
        calDays.innerHTML = '';
        calMonthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;

        // Get first day of month
        let firstDay = new Date(currentYear, currentMonth, 1).getDay();
        // Adjust for Monday start (0=Sunday)
        firstDay = firstDay === 0 ? 6 : firstDay - 1;

        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Empty cells before start
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('cal-day', 'empty');
            calDays.appendChild(emptyCell);
        }

        // Days of month
        for (let i = 1; i <= daysInMonth; i++) {
            const cellDate = new Date(currentYear, currentMonth, i);
            const cell = document.createElement('div');
            cell.classList.add('cal-day');
            cell.textContent = i;

            // Check if future
            if (cellDate > today) {
                cell.classList.add('disabled');
            } else {
                // Clickable
                cell.addEventListener('click', () => {
                    document.querySelectorAll('.cal-day.selected').forEach(el => el.classList.remove('selected'));
                    cell.classList.add('selected');
                    selectedDate = cellDate;
                });

                // Highlight selected
                if (selectedDate && 
                    selectedDate.getDate() === i && 
                    selectedDate.getMonth() === currentMonth && 
                    selectedDate.getFullYear() === currentYear) {
                    cell.classList.add('selected');
                }
            }

            // Highlight today
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

    // Check if date is in localStorage
    const savedDate = localStorage.getItem('army_start_date');

    if (savedDate) {
        showScreen(mainScreen);
        setupScreen.classList.add('hidden');
        updateStats(savedDate);
    } else {
        showScreen(setupScreen);
        mainScreen.classList.add('hidden');
        renderCalendar();
    }

    saveBtn.addEventListener('click', () => {
        if (!selectedDate) {
            // Visual shake or alert for custom calendar
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
        switchScreen(setupScreen, mainScreen);
        updateStats(selectedDateStr);
    });

    resetBtn.addEventListener('click', () => {
        if(confirm('Вы уверены, что хотите сбросить дату службы?')) {
            localStorage.removeItem('army_start_date');
            selectedDate = null;
            currentMonth = today.getMonth();
            currentYear = today.getFullYear();
            renderCalendar();
            
            // Reset animations
            daysPassedEl.textContent = '0';
            daysRemainingEl.textContent = '365';
            progressBar.style.width = '0%';
            percentageDisplay.textContent = '0%';
            
            switchScreen(mainScreen, setupScreen);
        }
    });

    function showScreen(screen) {
        screen.classList.remove('hidden');
        screen.classList.add('animating-in');
        
        // Remove animation class after sequence completes to allow smooth re-animations
        setTimeout(() => {
            screen.classList.remove('animating-in');
        }, 500);
    }

    function switchScreen(hideScreen, showScr) {
        hideScreen.classList.add('hidden');
        showScreen(showScr);
    }

    function updateStats(startDateStr) {
        const startDate = new Date(startDateStr);
        startDate.setHours(0, 0, 0, 0); // Start of the day

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + TOTAL_DAYS);

        const now = new Date();
        now.setHours(0, 0, 0, 0); // Compare whole days

        let passedTime = now - startDate;
        let passedDays = Math.floor(passedTime / (1000 * 60 * 60 * 24));

        // Clamp values
        if (passedDays < 0) passedDays = 0;
        if (passedDays > TOTAL_DAYS) passedDays = TOTAL_DAYS;

        const remainingDays = TOTAL_DAYS - passedDays;
        
        let percentage = (passedDays / TOTAL_DAYS) * 100;

        // Animations delay just a bit to allow screen to render
        setTimeout(() => {
            // Animate counters
            animateValue(daysPassedEl, 0, passedDays, 1200);
            animateValue(daysRemainingEl, TOTAL_DAYS, remainingDays, 1200);
            
            // Animate percentage text and progress bar
            progressBar.style.width = `${percentage}%`;
            animatePercentage(percentageDisplay, 0, percentage, 1200);
            
        }, 100);

        // Format and set dates
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
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            obj.innerHTML = Math.floor(easeOut * (end - start) + start);
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end; // Ensure exact final value
            }
        };
        window.requestAnimationFrame(step);
    }

    function animatePercentage(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            const current = easeOut * (end - start) + start;
            
            // Format number of decimals based on the value
            let displayVal = current;
            if (current < 100 && current > 0) {
                displayVal = current.toFixed(2); // Show 2 decimals while progressing
            } else if (current === 100 || current === 0) {
                displayVal = Math.round(current);
            } else {
                displayVal = current.toFixed(2);
            }
            
            obj.innerHTML = `${displayVal}%`;
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                // Formatting for final value
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
