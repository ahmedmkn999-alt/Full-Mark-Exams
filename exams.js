let activeExam = null;
let currentQIndex = 0;
let userAnswers = []; // لتخزين إجابات الطالب
let examTimer;

function startExam(examId) {
    const subjectData = window.examsDB[currentSubject];
    for (let ch of subjectData) {
        let ex = ch.exams.find(e => e.id === examId);
        if (ex) { activeExam = ex; break; }
    }
    
    currentQIndex = 0;
    userAnswers = [];
    
    // --- نظام حساب الوقت الذكي ---
    let qCount = activeExam.questions.length;
    let timeInMinutes = 15; // افتراضي
    if (qCount >= 50) timeInMinutes = 120; // ساعتين
    else if (qCount >= 20) timeInMinutes = 50; // 50 دقيقة
    
    document.getElementById('view-list').classList.add('hidden');
    document.getElementById('view-exam').classList.remove('hidden');
    
    renderQuestion();
    startTimer(timeInMinutes * 60);
}

function renderQuestion() {
    if (currentQIndex >= activeExam.questions.length) {
        finishExam();
        return;
    }
    const q = activeExam.questions[currentQIndex];
    const container = document.getElementById('question-container');
    
    container.innerHTML = `
        <div class="q-header">سؤال ${currentQIndex + 1} من ${activeExam.questions.length}</div>
        <h3 style="margin: 15px 0;">${q.t}</h3>
        <div id="options-alt">
            ${q.opts.map((opt, i) => `
                <label class="option-label">
                    <input type="radio" name="ans" value="${i}"> ${opt}
                </label>
            `).join('')}
        </div>
    `;
}

function nextQuestion() {
    const sel = document.querySelector('input[name="ans"]:checked');
    if (!sel) { alert('برجاء اختيار إجابة'); return; }

    // حفظ إجابة الطالب للتحليل لاحقاً
    userAnswers.push(parseInt(sel.value));
    currentQIndex++;
    renderQuestion();
}

function finishExam() {
    clearInterval(examTimer);
    document.getElementById('view-exam').classList.add('hidden');
    document.getElementById('view-result').classList.remove('hidden');
    
    let score = 0;
    let reviewHtml = '<div style="text-align:right; margin-top:20px;"><h3>مراجعة الإجابات:</h3>';
    
    activeExam.questions.forEach((q, i) => {
        const isCorrect = userAnswers[i] === q.ans;
        if (isCorrect) score++;
        
        reviewHtml += `
            <div style="border:1px solid ${isCorrect ? '#03dac6' : '#cf6679'}; padding:10px; margin-bottom:10px; border-radius:8px;">
                <p><strong>س${i+1}:</strong> ${q.t}</p>
                <p style="color:${isCorrect ? '#03dac6' : '#cf6679'}">إجابتك: ${q.opts[userAnswers[i]]}</p>
                ${!isCorrect ? `<p style="color:#03dac6">الصحيحة: ${q.opts[q.ans]}</p>` : ''}
                <p style="font-size:0.9rem; color:#aaa;">💡 التفسير: ${q.hint || 'لا يوجد تفسير متاح'}</p>
            </div>
        `;
    });

    reviewHtml += '</div>';
    document.getElementById('final-score').innerText = `${score} / ${activeExam.questions.length}`;
    document.getElementById('result-message').innerHTML = reviewHtml;
}

function startTimer(seconds) {
    let timer = seconds;
    examTimer = setInterval(() => {
        let mins = Math.floor(timer / 60);
        let secs = timer % 60;
        document.getElementById('timer-display').innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        if (--timer < 0) {
            clearInterval(examTimer);
            alert('انتهى الوقت!');
            finishExam();
        }
    }, 1000);
}
