let currentCase = null;
let currentCaseId = null;
let allCasesList = [];

async function loadCase() {
    currentCaseId = getUrlParameter('id');
    
    if (!currentCaseId) {
        window.location.href = 'cases.html';
        return;
    }
    
    currentCase = await loadJSON(`data/cases/${currentCaseId}.json`);
    
    if (!currentCase) {
        document.getElementById('caseContent').innerHTML = '<div class="loading">Case not found</div>';
        return;
    }
    
    const caseIds = ['001', '002', '003', '004', '005', '006', '007', '008', '009', '010', '011', '012', '013', '014', '015', '016', '017', '018', '019', '020', '021', '022', '023', '024', '025', '026', '027', '028', '029', '030'];
    allCasesList = [];
    for (const id of caseIds) {
        const caseData = await loadJSON(`data/cases/${id}.json`);
        if (caseData) allCasesList.push(caseData);
    }
    allCasesList.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    
    renderCaseContent();
    setupNavigation();
    updateBookmarkUI(currentCaseId);
}

// ========== ФУНКЦІЯ ДЛЯ ВІДОБРАЖЕННЯ МЕДІА (ФОТО/ВІДЕО/ГАЛЕРЕЯ) ==========
function renderMedia() {
    const media = currentCase.media;
    
    // Якщо немає секції media - використовуємо старий формат (одне фото)
    if (!media) {
        const imagePath = `assets/images/cases/${currentCase.id}/photo.jpg`;
        return `
            <div class="case-image-wrapper">
                <img src="${imagePath}" 
                     alt="${currentCase.title}" 
                     class="case-image-compact"
                     onerror="this.src='https://placehold.co/600x400/1a1f2a/00ff88?text=Photo+Not+Found'">
                <div class="image-open-link">
                    <a href="${imagePath}" target="_blank" rel="noopener noreferrer">
                        <i class="fas fa-external-link-alt"></i> Open image in new tab
                    </a>
                </div>
            </div>
        `;
    }
    
    switch(media.type) {
        // ========== YOUTUBE ВІДЕО ==========
        case 'youtube':
            return `
                <div class="case-video-wrapper">
                    <div class="video-responsive">
                        <iframe src="${media.url}" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                        </iframe>
                    </div>
                    <div class="video-open-link">
                        <a href="${media.url.replace('/embed/', '/watch?v=')}" target="_blank" rel="noopener noreferrer">
                            <i class="fab fa-youtube"></i> Open on YouTube
                        </a>
                    </div>
                </div>
            `;
            
        // ========== VIMEO ВІДЕО ==========
        case 'vimeo':
            return `
                <div class="case-video-wrapper">
                    <div class="video-responsive">
                        <iframe src="${media.url}" 
                                frameborder="0" 
                                allow="autoplay; fullscreen; picture-in-picture" 
                                allowfullscreen>
                        </iframe>
                    </div>
                    <div class="video-open-link">
                        <a href="${media.url.replace('/player/', '')}" target="_blank" rel="noopener noreferrer">
                            <i class="fab fa-vimeo"></i> Open on Vimeo
                        </a>
                    </div>
                </div>
            `;
            
        // ========== ПРЯМЕ ПОСИЛАННЯ НА MP4 ==========
        case 'video':
            return `
                <div class="case-video-wrapper">
                    <video class="case-video" controls>
                        <source src="${media.url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    <div class="video-open-link">
                        <a href="${media.url}" target="_blank" rel="noopener noreferrer">
                            <i class="fas fa-external-link-alt"></i> Open video in new tab
                        </a>
                    </div>
                </div>
            `;
            
        // ========== ПЛЕЙЛІСТ (КІЛЬКА ВІДЕО) ==========
        case 'playlist':
            const playlistItems = media.videos.map((video, idx) => `
                <div class="playlist-item">
                    <h4>${video.title || `Video ${idx + 1}`}</h4>
                    <div class="video-responsive">
                        <iframe src="${video.url}" 
                                frameborder="0" 
                                allowfullscreen>
                        </iframe>
                    </div>
                    <div class="video-open-link">
                        <a href="${video.url.replace('/embed/', '/watch?v=')}" target="_blank" rel="noopener noreferrer">
                            <i class="fab fa-youtube"></i> Open on YouTube
                        </a>
                    </div>
                </div>
            `).join('');
            
            return `
                <div class="case-playlist">
                    <div class="playlist-grid">
                        ${playlistItems}
                    </div>
                </div>
            `;
            
        // ========== ГАЛЕРЕЯ ФОТО ==========
        case 'gallery':
            const galleryItems = media.files.map(file => `
                <div class="gallery-item">
                    <img src="assets/images/cases/${currentCase.id}/${file}" 
                         class="gallery-image"
                         onerror="this.src='https://placehold.co/600x400/1a1f2a/00ff88?text=Image+Not+Found'">
                    <div class="image-open-link-small">
                        <a href="assets/images/cases/${currentCase.id}/${file}" target="_blank">
                            <i class="fas fa-external-link-alt"></i> Open full size
                        </a>
                    </div>
                </div>
            `).join('');
            
            return `
                <div class="case-gallery">
                    <div class="gallery-grid">
                        ${galleryItems}
                    </div>
                </div>
            `;
            
        // ========== ЗМІШАНИЙ ТИП (ФОТО + ВІДЕО) ==========
        case 'mixed':
            const mixedImages = (media.images || []).map(file => `
                <div class="gallery-item">
                    <img src="assets/images/cases/${currentCase.id}/${file}" 
                         class="gallery-image-small"
                         onerror="this.src='https://placehold.co/300x200/1a1f2a/00ff88?text=Image+Not+Found'">
                    <a href="assets/images/cases/${currentCase.id}/${file}" target="_blank" class="image-open-link-small">
                        <i class="fas fa-external-link-alt"></i> Open
                    </a>
                </div>
            `).join('');
            
            let videoHtml = '';
            if (media.video) {
                if (media.video.type === 'youtube') {
                    videoHtml = `
                        <div class="mixed-video">
                            <h4>Video Evidence:</h4>
                            <div class="video-responsive">
                                <iframe src="${media.video.url}" frameborder="0" allowfullscreen></iframe>
                            </div>
                            <a href="${media.video.url.replace('/embed/', '/watch?v=')}" target="_blank" class="video-open-link-small">
                                <i class="fab fa-youtube"></i> Open on YouTube
                            </a>
                        </div>
                    `;
                } else if (media.video.type === 'vimeo') {
                    videoHtml = `
                        <div class="mixed-video">
                            <h4>Video Evidence:</h4>
                            <div class="video-responsive">
                                <iframe src="${media.video.url}" frameborder="0" allowfullscreen></iframe>
                            </div>
                            <a href="${media.video.url.replace('/player/', '')}" target="_blank" class="video-open-link-small">
                                <i class="fab fa-vimeo"></i> Open on Vimeo
                            </a>
                        </div>
                    `;
                } else if (media.video.url) {
                    videoHtml = `
                        <div class="mixed-video">
                            <h4>Video Evidence:</h4>
                            <video class="case-video-small" controls>
                                <source src="${media.video.url}" type="video/mp4">
                            </video>
                            <a href="${media.video.url}" target="_blank" class="video-open-link-small">
                                <i class="fas fa-external-link-alt"></i> Open video
                            </a>
                        </div>
                    `;
                }
            }
            
            return `
                <div class="case-mixed">
                    ${videoHtml}
                    ${mixedImages.length ? `
                        <div class="mixed-gallery">
                            <h4>Additional images:</h4>
                            <div class="gallery-grid-small">
                                ${mixedImages}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
            
        default:
            return '<p>Media not available</p>';
    }
}

function renderCaseContent() {
    const isCompleted = isCaseCompleted(currentCaseId);
    const savedAnswers = JSON.parse(sessionStorage.getItem(`answers_${currentCaseId}`) || '{}');
    
    const difficultyText = currentCase.difficulty === 'EASY' ? 'BEGINNER' : 
                           currentCase.difficulty === 'MEDIUM' ? 'INTERMEDIATE' : 'EXPERT';
    const difficultyClass = currentCase.difficulty.toLowerCase();
    
    // Генеруємо медіа контент (НОВА ФУНКЦІЯ!)
    const mediaHtml = renderMedia();
    
    // Генеруємо список питань для правої колонки
    const questionsListHtml = currentCase.questions.map((q, index) => `
        <li><i class="fas fa-circle"></i> ${q.label}</li>
    `).join('');
    
    // Генеруємо поля для відповідей
    const answerFieldsHtml = currentCase.questions.map((q, index) => `
        <div class="answer-field">
            <label class="answer-label">${index + 1}. ${q.label}</label>
            ${renderQuestionInput(q, index, savedAnswers[index] || '')}
        </div>
    `).join('');
    
    const content = `
        <div class="case-header-compact">
            <h1 class="case-title-compact">CASE #${currentCase.id}: ${currentCase.title}</h1>
            <span class="case-difficulty-compact badge-${difficultyClass}">${difficultyText}</span>
        </div>
        
        <div class="case-two-columns">
            <!-- ЛІВА КОЛОНКА: МЕДІА (фото/відео/галерея) -->
            <div class="case-image-col">
                ${mediaHtml}
            </div>
            
            <!-- ПРАВА КОЛОНКА: УМОВА + ПИТАННЯ -->
            <div class="case-info-col">
                <div class="case-condition-compact">
                    <h3><i class="fas fa-file-alt"></i> CONDITION:</h3>
                    <p>${currentCase.description}</p>
                </div>
                
                <div class="case-questions-compact">
                    <h3><i class="fas fa-question-circle"></i> QUESTIONS:</h3>
                    <ul class="questions-list">
                        ${questionsListHtml}
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="answers-section">
            <h3><i class="fas fa-edit"></i> YOUR ANSWERS</h3>
            ${answerFieldsHtml}
            
            <div class="form-actions-compact">
                <button class="btn-save-compact" id="saveAnswersBtn">
                    <i class="fas fa-save"></i> SAVE ANSWERS
                </button>
                <button class="btn-check-compact" id="checkAnswersBtn">
                    <i class="fas fa-check"></i> CHECK ALL ANSWERS
                </button>
            </div>
            <div id="resultMessage"></div>
        </div>
        
        <div class="accordion-compact">
            <div class="accordion-header-compact">
                <span><i class="fas fa-lightbulb"></i> HINT</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="accordion-content-compact">
                <div class="accordion-inner">
                    ${currentCase.hint || 'No hint available.'}
                </div>
            </div>
        </div>
        
        <div class="accordion-compact">
            <div class="accordion-header-compact">
                <span><i class="fas fa-video"></i> VIDEO ANALYSIS</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="accordion-content-compact">
                <div class="accordion-inner">
                    ${currentCase.videoUrl ? `
                        <div class="video-container-compact">
                            <iframe src="${currentCase.videoUrl}" frameborder="0" allowfullscreen></iframe>
                        </div>
                    ` : '<p>Video analysis coming soon</p>'}
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('caseContent').innerHTML = content;
    initAccordions();
    
    if (isCompleted) {
        const resultMsg = document.getElementById('resultMessage');
        if (resultMsg) {
            resultMsg.innerHTML = '<div class="result-correct">✅ You have completed this case in this session! You can still edit and re-check answers.</div>';
        }
    }
}

// Функція для відображення різних типів полів вводу
function renderQuestionInput(question, index, savedValue) {
    switch(question.type) {
        case 'text':
            return `<input type="text" class="answer-input" data-index="${index}" value="${escapeHtml(savedValue)}" placeholder="Enter your answer...">`;
        case 'textarea':
            return `<textarea class="answer-textarea" data-index="${index}" placeholder="Enter your answer...">${escapeHtml(savedValue)}</textarea>`;
        case 'select':
            return `
                <select class="answer-select" data-index="${index}">
                    <option value="">Select an option...</option>
                    ${question.options.map(opt => `
                        <option value="${opt}" ${savedValue === opt ? 'selected' : ''}>${opt}</option>
                    `).join('')}
                </select>
            `;
        case 'radio':
            return `
                <div class="radio-group">
                    ${question.options.map(opt => `
                        <label class="radio-label">
                            <input type="radio" name="question_${index}" value="${opt}" ${savedValue === opt ? 'checked' : ''}>
                            <span>${opt}</span>
                        </label>
                    `).join('')}
                </div>
            `;
        default:
            return `<input type="text" class="answer-input" data-index="${index}" value="${escapeHtml(savedValue)}" placeholder="Enter your answer...">`;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function saveAllAnswers() {
    const answers = {};
    
    document.querySelectorAll('.answer-input, .answer-textarea, .answer-select').forEach(input => {
        const index = input.getAttribute('data-index');
        if (index !== null) {
            answers[index] = input.value;
        }
    });
    
    if (currentCase && currentCase.questions) {
        currentCase.questions.forEach((q, idx) => {
            if (q.type === 'radio') {
                const selected = document.querySelector(`input[name="question_${idx}"]:checked`);
                if (selected) {
                    answers[idx] = selected.value;
                }
            }
        });
    }
    
    sessionStorage.setItem(`answers_${currentCaseId}`, JSON.stringify(answers));
    
    const msg = document.getElementById('resultMessage');
    msg.innerHTML = '<div class="result-correct">✅ Answers saved!</div>';
    setTimeout(() => {
        if (!isCaseCompleted(currentCaseId)) msg.innerHTML = '';
    }, 2000);
}

function checkAllAnswers() {
    const savedAnswers = JSON.parse(sessionStorage.getItem(`answers_${currentCaseId}`) || '{}');
    let allCorrect = true;
    const incorrectAnswers = [];
    
    for (let i = 0; i < currentCase.questions.length; i++) {
        const userAnswer = savedAnswers[i];
        const correctAnswer = currentCase.questions[i].correctAnswer;
        const isCorrect = compareAnswers(userAnswer, correctAnswer);
        
        if (!isCorrect) {
            allCorrect = false;
            incorrectAnswers.push({
                number: i + 1,
                question: currentCase.questions[i].label,
                correctAnswer: correctAnswer
            });
        }
    }
    
    const msg = document.getElementById('resultMessage');
    
    if (allCorrect) {
        msg.innerHTML = '<div class="result-correct">🎉 CONGRATULATIONS! All answers are correct!</div>';
        markCaseAsCompleted(currentCaseId);
    } else {
        removeCaseFromCompleted(currentCaseId);
        
        let incorrectHtml = '<div class="result-incorrect">❌ Not all answers are correct. Try again!<br><small>Incorrect answers:</small><ul>';
        incorrectAnswers.forEach(inc => {
            incorrectHtml += `<li><strong>Question ${inc.number}:</strong> Correct answer: "${inc.correctAnswer}"</li>`;
        });
        incorrectHtml += '</ul></div>';
        msg.innerHTML = incorrectHtml;
    }
}

function compareAnswers(userAnswer, correctAnswer) {
    if (!userAnswer || !correctAnswer) return false;
    return userAnswer.toString().toLowerCase().trim() === correctAnswer.toString().toLowerCase().trim();
}

function setupNavigation() {
    const currentIndex = allCasesList.findIndex(c => c.id === currentCaseId);
    
    const prevBtn = document.getElementById('prevCaseBtn');
    const nextBtn = document.getElementById('nextCaseBtn');
    
    if (prevBtn) {
        if (currentIndex > 0) {
            prevBtn.disabled = false;
            prevBtn.onclick = () => window.location.href = `case-detail.html?id=${allCasesList[currentIndex - 1].id}`;
        } else {
            prevBtn.disabled = true;
        }
    }
    
    if (nextBtn) {
        if (currentIndex < allCasesList.length - 1) {
            nextBtn.disabled = false;
            nextBtn.onclick = () => window.location.href = `case-detail.html?id=${allCasesList[currentIndex + 1].id}`;
        } else {
            nextBtn.disabled = true;
        }
    }
    
    const bookmarkBtn = document.getElementById('bookmarkBtn');
    if (bookmarkBtn) {
        bookmarkBtn.onclick = () => {
            toggleBookmark(currentCaseId);
            updateBookmarkUI(currentCaseId);
        };
    }
}

function initAccordions() {
    document.querySelectorAll('.accordion-header-compact').forEach(header => {
        header.addEventListener('click', () => {
            const accordion = header.closest('.accordion-compact');
            const content = accordion.querySelector('.accordion-content-compact');
            const isActive = header.classList.contains('active');
            
            if (!isActive) {
                header.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                header.classList.remove('active');
                content.style.maxHeight = null;
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadCase();
    
    document.addEventListener('click', (e) => {
        if (e.target.id === 'saveAnswersBtn' || e.target.closest('#saveAnswersBtn')) {
            saveAllAnswers();
        }
        if (e.target.id === 'checkAnswersBtn' || e.target.closest('#checkAnswersBtn')) {
            checkAllAnswers();
        }
    });
    
    document.addEventListener('change', (e) => {
        if (e.target.classList && (
            e.target.classList.contains('answer-input') ||
            e.target.classList.contains('answer-textarea') ||
            e.target.classList.contains('answer-select')
        )) {
            saveAllAnswers();
        }
    });
});