let allCases = [];
let currentSearch = '';
let currentSort = 'id';
let currentPage = 1;
const casesPerPage = 12;

async function loadCasesList() {
    try {
        const caseIds = ['001', '002', '003', '004', '005', '006', '007', '008', '009', '010', '011', '012', '013', '014', '015', '016', '017', '018', '019', '020', '021', '022', '023', '024', '025', '026', '027', '028', '029', '030'];
        
        allCases = [];
        for (const id of caseIds) {
            const caseData = await loadJSON(`data/cases/${id}.json`);
            if (caseData) {
                allCases.push(caseData);
            }
        }
        
        localStorage.setItem('totalCases', allCases.length.toString());
        renderCases();
        loadGlobalProgress();
        
    } catch (error) {
        console.error('Помилка:', error);
        document.getElementById('casesGrid').innerHTML = '<div class="loading">Помилка завантаження кейсів</div>';
    }
}

function filterCases() {
    let filtered = [...allCases];
    
    if (currentSearch) {
        const searchLower = currentSearch.toLowerCase();
        filtered = filtered.filter(c => 
            c.title.toLowerCase().includes(searchLower) ||
            c.id.includes(searchLower)
        );
    }
    
    if (currentSort === 'id') {
        filtered.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    } else if (currentSort === 'difficulty') {
        const order = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3 };
        filtered.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
    }
    
    return filtered;
}

function renderCases() {
    const filtered = filterCases();
    const totalPages = Math.ceil(filtered.length / casesPerPage);
    const start = (currentPage - 1) * casesPerPage;
    const paginatedCases = filtered.slice(start, start + casesPerPage);
    
    const grid = document.getElementById('casesGrid');
    
    if (paginatedCases.length === 0) {
        grid.innerHTML = '<div class="loading">Кейсів не знайдено</div>';
        return;
    }
    
    grid.innerHTML = paginatedCases.map(caseItem => {
        const difficultyText = caseItem.difficulty === 'EASY' ? 'EASY' : 
                               caseItem.difficulty === 'MEDIUM' ? 'MEDIUM' : 'EXPERT';
        const difficultyClass = caseItem.difficulty.toLowerCase();
        
        return `
            <div class="case-card" data-id="${caseItem.id}">
                <div class="case-card-image">
                    <img src="assets/images/cases/${caseItem.id}/photo.jpg" alt="${caseItem.title}" 
                         onerror="this.src='https://placehold.co/400x250/1a1f2a/00ff88?text=No+Image'">
                    <span class="case-card-badge badge-${difficultyClass}">${difficultyText}</span>
                </div>
                <div class="case-card-content">
                    <div class="case-card-number">КЕЙС #${caseItem.id}</div>
                    <h3 class="case-card-title">${caseItem.title}</h3>
                    <p class="case-card-description">${caseItem.description.substring(0, 80)}...</p>
                    <div class="case-card-footer">
                        <span class="case-status ${isCaseCompleted(caseItem.id) ? 'status-completed' : 'status-pending'}">
                            ${isCaseCompleted(caseItem.id) ? '<i class="fas fa-check-circle"></i> Пройдено' : '<i class="fas fa-clock"></i> Не розпочато'}
                        </span>
                        <a href="case-detail.html?id=${caseItem.id}" class="btn-start">
                            ${isCaseCompleted(caseItem.id) ? 'ПОВТОРИТИ' : 'ПОЧАТИ'}
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    
    pagination.innerHTML = html;
    
    document.querySelectorAll('#pagination button').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.dataset.page);
            renderCases();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value;
            currentPage = 1;
            renderCases();
        });
    }
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            currentPage = 1;
            renderCases();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadCasesList();
    setupEventListeners();
});