// ========== МОБІЛЬНЕ МЕНЮ ==========
document.addEventListener('DOMContentLoaded', function() {
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileBtn && navMenu) {
        mobileBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Завантаження прогресу з sessionStorage
    loadGlobalProgress();
});

// ========== ГЛОБАЛЬНИЙ ПРОГРЕС ==========
function loadGlobalProgress() {
    // Змінено на sessionStorage — прогрес скинеться після закриття вкладки / перезавантаження сторінки
    const completedCases = JSON.parse(sessionStorage.getItem('completedCases') || '[]');
    const totalCases = parseInt(localStorage.getItem('totalCases') || '0');
    
    if (totalCases > 0) {
        const progressCircle = document.getElementById('progressCircle');
        const completedCountSpan = document.getElementById('completedCount');
        const progressTextSpan = document.getElementById('progressText');
        
        if (progressCircle) {
            const percent = (completedCases.length / totalCases) * 100;
            const circumference = 283;
            const offset = circumference - (percent / 100) * circumference;
            progressCircle.style.strokeDashoffset = offset;
        }
        
        if (completedCountSpan) {
            completedCountSpan.textContent = completedCases.length;
        }
        
        if (progressTextSpan) {
            progressTextSpan.textContent = `${completedCases.length} / ${totalCases} кейсів пройдено`;
        }
    }
}

// ========== ЗБЕРЕЖЕННЯ ПРОГРЕСУ КЕЙСУ ==========
function markCaseAsCompleted(caseId) {
    let completed = JSON.parse(sessionStorage.getItem('completedCases') || '[]');
    if (!completed.includes(caseId)) {
        completed.push(caseId);
        sessionStorage.setItem('completedCases', JSON.stringify(completed));
        
        // Оновлюємо візуал
        loadGlobalProgress();
        
        // Оновлюємо статус на картці кейсу
        const caseCard = document.querySelector(`.case-card[data-id="${caseId}"]`);
        if (caseCard) {
            const statusSpan = caseCard.querySelector('.case-status');
            if (statusSpan) {
                statusSpan.innerHTML = '<i class="fas fa-check-circle"></i> Пройдено';
                statusSpan.className = 'case-status status-completed';
            }
        }
    }
}

// ========== ВИДАЛЕННЯ КЕЙСУ З ПРОЙДЕНИХ (якщо відповідь стала невірною) ==========
function removeCaseFromCompleted(caseId) {
    let completed = JSON.parse(sessionStorage.getItem('completedCases') || '[]');
    if (completed.includes(caseId)) {
        completed = completed.filter(id => id !== caseId);
        sessionStorage.setItem('completedCases', JSON.stringify(completed));
        
        loadGlobalProgress();
        
        const caseCard = document.querySelector(`.case-card[data-id="${caseId}"]`);
        if (caseCard) {
            const statusSpan = caseCard.querySelector('.case-status');
            if (statusSpan) {
                statusSpan.innerHTML = '<i class="fas fa-clock"></i> Не розпочато';
                statusSpan.className = 'case-status status-pending';
            }
        }
    }
}

// ========== ПЕРЕВІРКА ЧИ КЕЙС ПРОЙДЕНО ==========
function isCaseCompleted(caseId) {
    const completed = JSON.parse(sessionStorage.getItem('completedCases') || '[]');
    return completed.includes(caseId);
}

// ========== ЗАКЛАДКИ (залишаємо в localStorage, бо закладки зазвичай мають зберігатися довго) ==========
function toggleBookmark(caseId) {
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    if (bookmarks.includes(caseId)) {
        bookmarks = bookmarks.filter(id => id !== caseId);
    } else {
        bookmarks.push(caseId);
    }
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    updateBookmarkUI(caseId);
}

function updateBookmarkUI(caseId) {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const bookmarkBtn = document.getElementById('bookmarkBtn');
    if (bookmarkBtn) {
        if (bookmarks.includes(caseId)) {
            bookmarkBtn.classList.add('active');
            bookmarkBtn.innerHTML = '<i class="fas fa-bookmark"></i> В ЗАКЛАДКАХ';
        } else {
            bookmarkBtn.classList.remove('active');
            bookmarkBtn.innerHTML = '<i class="far fa-bookmark"></i> ДОДАТИ В ЗАКЛАДКИ';
        }
    }
}

function isBookmarked(caseId) {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    return bookmarks.includes(caseId);
}

// ========== ОТРИМАННЯ ПАРАМЕТРІВ З URL ==========
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// ========== ЗАВАНТАЖЕННЯ JSON ==========
async function loadJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Помилка завантаження:', error);
        return null;
    }
}

// Експорт функцій
window.markCaseAsCompleted = markCaseAsCompleted;
window.removeCaseFromCompleted = removeCaseFromCompleted;
window.isCaseCompleted = isCaseCompleted;
window.toggleBookmark = toggleBookmark;
window.updateBookmarkUI = updateBookmarkUI;
window.isBookmarked = isBookmarked;
window.getUrlParameter = getUrlParameter;
window.loadJSON = loadJSON;
window.loadGlobalProgress = loadGlobalProgress;