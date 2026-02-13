let activeExam = null;
let currentQIndex = 0;
let userScore = 0;
let examTimer;

function loadExamsList() {
    const subjectData = window.examsDB[currentSubject];
    const list = document.getElementById('list-items');
    list.innerHTML = '';
    document.getElementById('view-dashboard').classList.add('hidden');
    document.getElementById('view-list').classList.remove('hidden');

    if (!subjectData) { list.innerHTML = '<li>لا توجد امتحانات.</li>'; return; }

    subjectData.forEach(chapter => {
        list.innerHTML += `<h3 style="color:var(--accent-color); margin-top:20px;">${chapter.chapterTitle}</h3>`;
        chapter.exams.forEach(exam => {
            list.innerHTML += `
            <li class="file-item">
                <span>${exam.title}</span>
                <button class="btn-action" onclick="startExam('${exam.id}')">ابدأ</button>
            </li>`;
        });
    });
}

function startExam(examId) {
    const subjectData = window.examsDB[currentSubject];
    for (let ch of subjectData) {
        let ex = ch.exams.find(e => e.id === examId);
        if (ex) { activeExam = ex; break; }
    }
    currentQIndex = 0; userScore = 0;
    document.getElementById('view-list').classList.add('hidden');
    document.getElementById('view-exam').classList.remove('hidden');
    renderQuestion();
}

function renderQuestion() {
    if (currentQIndex >= activeExam.questions.length) { finishExam(); return; }
    const q = activeExam.questions[currentQIndex];
    const container = document.getElementById('question-container');
    let html = `<h3>${q.t}</h3>`;
    q.opts.forEach((opt, i) => {
        html += `<label class="option-label"><input type="radio" name="ans" value="${i}"> ${opt}</label>`;
    });
    container.innerHTML = html;
}

function nextQuestion() {
    const sel = document.querySelector('input[name="ans"]:checked');
    if (sel) {
        if (parseInt(sel.value) === activeExam.questions[currentQIndex].ans) userScore++;
        currentQIndex++; renderQuestion();
    } else alert('اختر إجابة');
}

function finishExam() {
    document.getElementById('view-exam').classList.add('hidden');
    document.getElementById('view-result').classList.remove('hidden');
    document.getElementById('final-score').innerText = userScore + " / " + activeExam.questions.length;
}
