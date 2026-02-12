// exams.js

// قاعدة بيانات الامتحانات
const examsDB = {
    'biology': {
        'units': [
            { id: 'bio_u1_1', title: 'الباب الأول: الدعامة والحركة', time: 30, questions: [
                { t: 'عدد العظام في الهيكل المحوري للإنسان؟', opts: ['80', '126', '206', '30'], ans: 0 },
                { t: 'تتصل الضلوع من الخلف بـ؟', opts: ['الفقرات الظهرية', 'الفقرات القطنية', 'عظمة القص', 'الترقوة'], ans: 0 }
            ]},
            { id: 'bio_u2_1', title: 'الباب الثاني: التنسيق الهرموني', time: 45, questions: [
                { t: 'أي الهرمونات يؤثر في الولادة؟', opts: ['البرولاكتين', 'الأوكسيتوسين', 'FSH', 'LH'], ans: 1 },
                { t: 'مرض التضخم الجحوظي ينتج عن؟', opts: ['زيادة الثيروكسين', 'نقص الثيروكسين', 'نقص اليود'], ans: 0 }
            ]}
        ],
        'comprehensive': [
            { id: 'bio_comp_1', title: 'امتحان شامل تجريبي (مايو)', time: 120, questions: [
                { t: 'سؤال تجريبي 1...', opts: ['أ', 'ب', 'ج', 'د'], ans: 2 },
                { t: 'سؤال تجريبي 2...', opts: ['أ', 'ب', 'ج', 'د'], ans: 1 }
            ]}
        ]
    },
    'history': {
        'units': [ { id: 'hist_u1', title: 'الحملة الفرنسية', time: 20, questions: [] } ],
        'comprehensive': []
    }
    // تقدر تزود باقي المواد هنا بنفس الطريقة
};

// --- منطق العرض والتشغيل ---

function loadExamsList() {
    const data = examsDB[currentSubject];
    const list = document.getElementById('list-items');
    list.innerHTML = '';
    
    document.getElementById('view-dashboard').classList.add('hidden');
    document.getElementById('view-list').classList.remove('hidden');
    document.getElementById('list-title').innerText = "الامتحانات المتاحة";

    if(!data) { list.innerHTML = '<li>لا توجد امتحانات مسجلة لهذه المادة بعد.</li>'; return; }

    // عرض امتحانات الوحدات والأبواب
    if(data.units && data.units.length > 0) {
        list.innerHTML += `<h3 style="color:var(--accent-color)">📂 امتحانات الأبواب والوحدات</h3>`;
        data.units.forEach(exam => {
            list.innerHTML += createExamRow(exam);
        });
    }

    // عرض الامتحانات الشاملة
    if(data.comprehensive && data.comprehensive.length > 0) {
        list.innerHTML += `<h3 style="color:var(--secondary-color); margin-top:20px">🏆 امتحانات شاملة</h3>`;
        data.comprehensive.forEach(exam => {
            list.innerHTML += createExamRow(exam);
        });
    }
}

function createExamRow(exam) {
    return `
    <li class="file-item">
        <span>${exam.title} (${exam.time} دقيقة)</span>
        <button class="btn-action" onclick="startExam('${exam.id}')">ابدأ الامتحان</button>
    </li>`;
}

// --- منطق الامتحان (المؤقت والأسئلة) ---
let activeExam = null;
let currentQIndex = 0;
let userScore = 0;
let examTimer;

function startExam(examId) {
    // البحث عن الامتحان في الداتا
    const subjectData = examsDB[currentSubject];
    let foundExam = subjectData.units.find(e => e.id == examId) || subjectData.comprehensive.find(e => e.id == examId);
    
    if(!foundExam) return;

    activeExam = foundExam;
    currentQIndex = 0;
    userScore = 0;

    document.getElementById('view-list').classList.add('hidden');
    document.getElementById('view-exam').classList.remove('hidden');
    document.getElementById('exam-name-header').innerText = activeExam.title;
    
    renderQuestion();
    startTimer(activeExam.time * 60);
}

function renderQuestion() {
    if(currentQIndex >= activeExam.questions.length) {
        finishExam();
        return;
    }
    const q = activeExam.questions[currentQIndex];
    const container = document.getElementById('question-container');
    
    let html = `<h3>س${currentQIndex+1}: ${q.t}</h3>`;
    q.opts.forEach((opt, idx) => {
        html += `<label class="option-label">
                    <input type="radio" name="ans" value="${idx}"> ${opt}
                 </label>`;
    });
    container.innerHTML = html;
}

function nextQuestion() {
    const selected = document.querySelector('input[name="ans"]:checked');
    if(selected) {
        if(parseInt(selected.value) === activeExam.questions[currentQIndex].ans) userScore++;
        currentQIndex++;
        renderQuestion();
    } else {
        alert('من فضلك اختر إجابة');
    }
}

function startTimer(duration) {
    let timer = duration;
    clearInterval(examTimer);
    examTimer = setInterval(function () {
        let minutes = parseInt(timer / 60, 10);
        let seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        document.getElementById('timer-display').textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(examTimer);
            finishExam();
        }
    }, 1000);
}

function finishExam() {
    clearInterval(examTimer);
    document.getElementById('view-exam').classList.add('hidden');
    document.getElementById('view-result').classList.remove('hidden');
    document.getElementById('final-score').innerText = userScore + " / " + activeExam.questions.length;
    
    let msg = "";
    let percentage = (userScore / activeExam.questions.length) * 100;
    if(percentage >= 90) msg = "ممتاز يا بطل! 🥇";
    else if(percentage >= 50) msg = "جيد، شد حيلك في اللي جاي 👍";
    else msg = "محتاج مراجعة قوية 📚";
    
    document.getElementById('result-message').innerText = msg;
}

function exitExam() {
    clearInterval(examTimer);
    goBackToDash();
}
