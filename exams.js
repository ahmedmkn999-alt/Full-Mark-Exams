// exams.js - المحرك البرمجي للمنصة
let activeExam = null;
let currentQIndex = 0;
let userAnswers = []; 
let examTimer;

// التأكد من أن قاعدة البيانات معرفة عالمياً
window.examsDB = window.examsDB || {};

// 1. دالة عرض قائمة الامتحانات بناءً على المادة المختارة
function loadExamsList() {
    const subjectData = window.examsDB[currentSubject];
    const list = document.getElementById('list-items');
    list.innerHTML = '';
    
    document.getElementById('view-dashboard').classList.add('hidden');
    document.getElementById('view-list').classList.remove('hidden');
    document.getElementById('list-title').innerText = "قائمة امتحانات " + currentSubject;

    if (!subjectData || subjectData.length === 0) {
        list.innerHTML = '<li style="padding:20px; text-align:center;">عذراً، لا توجد امتحانات مضافة لهذه المادة بعد.</li>';
        return;
    }

    subjectData.forEach(chapter => {
        list.innerHTML += `<div style="background:#252525; padding:10px; border-radius:8px; margin-top:20px; border-right:5px solid var(--accent-color); font-weight:bold;">${chapter.chapterTitle}</div>`;
        chapter.exams.forEach(exam => {
            list.innerHTML += `
            <li class="file-item" style="margin-top:10px; background:var(--card-bg); padding:15px; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                <span>${exam.title} <small style="color:#777;">(${exam.questions.length} سؤال)</small></span>
                <button class="btn-action" onclick="startExam('${exam.id}')">ابدأ الآن</button>
            </li>`;
        });
    });
}

// 2. دالة بدء الامتحان وحساب الوقت تلقائياً
function startExam(examId) {
    const subjectData = window.examsDB[currentSubject];
    activeExam = null;

    // البحث عن الامتحان في كل الأبواب
    for (let ch of subjectData) {
        let ex = ch.exams.find(e => e.id === examId);
        if (ex) { activeExam = ex; break; }
    }

    if (!activeExam) return alert("خطأ في تحميل الامتحان!");

    currentQIndex = 0;
    userAnswers = [];
    
    // ضبط الوقت ذكياً حسب طلبك
    let qCount = activeExam.questions.length;
    let timeInMinutes = 15; // افتراضي لـ 5 أسئلة
    if (qCount >= 50) timeInMinutes = 120; // 50 سؤال = ساعتين
    else if (qCount >= 20) timeInMinutes = 50; // 20 سؤال = 50 دقيقة
    else if (qCount >= 10) timeInMinutes = 30; // 10 أسئلة = نص ساعة

    document.getElementById('view-list').classList.add('hidden');
    document.getElementById('view-exam').classList.remove('hidden');
    document.getElementById('exam-name-header').innerText = activeExam.title;
    
    renderQuestion();
    startTimer(timeInMinutes * 60);
}

// 3. عرض السؤال الحالي
function renderQuestion() {
    const container = document.getElementById('question-container');
    if (currentQIndex >= activeExam.questions.length) {
        finishExam();
        return;
    }

    const q = activeExam.questions[currentQIndex];
    container.innerHTML = `
        <div style="font-size:0.9rem; color:var(--accent-color); margin-bottom:10px;">سؤال ${currentQIndex + 1} من ${activeExam.questions.length}</div>
        <h3 style="margin-bottom:20px; line-height:1.5;">${q.t}</h3>
        <div id="options-box">
            ${q.opts.map((opt, i) => `
                <label class="option-label" style="display:block; background:#2c2c2c; padding:15px; margin:10px 0; border-radius:8px; cursor:pointer;">
                    <input type="radio" name="ans" value="${i}" style="margin-left:10px;"> ${opt}
                </label>
            `).join('')}
        </div>
    `;
}

// 4. الانتقال للسؤال التالي وحفظ الإجابة
function nextQuestion() {
    const selected = document.querySelector('input[name="ans"]:checked');
    if (!selected) return alert("من فضلك اختر إجابة!");

    userAnswers.push(parseInt(selected.value));
    currentQIndex++;
    renderQuestion();
}

// 5. إنهاء الامتحان وعرض النتيجة التفصيلية مع التفسير
function finishExam() {
    clearInterval(examTimer);
    document.getElementById('view-exam').classList.add('hidden');
    document.getElementById('view-result').classList.remove('hidden');
    
    let score = 0;
    let reportHtml = `<div style="text-align:right; direction:rtl; margin-top:20px;">`;
    
    activeExam.questions.forEach((q, i) => {
        const isCorrect = userAnswers[i] === q.ans;
        if (isCorrect) score++;
        
        reportHtml += `
            <div style="border:1px solid ${isCorrect ? '#03dac6' : '#cf6679'}; padding:15px; margin-bottom:15px; border-radius:10px; background:#1e1e1e;">
                <p><strong>س${i+1}:</strong> ${q.t}</p>
                <p style="color:${isCorrect ? '#03dac6' : '#cf6679'}">إجابتك: ${q.opts[userAnswers[i]] || 'لم تُجب'}</p>
                ${!isCorrect ? `<p style="color:#03dac6">الإجابة الصحيحة: ${q.opts[q.ans]}</p>` : ''}
                <div style="background:#252525; padding:10px; border-radius:5px; font-size:0.85rem; color:#aaa; margin-top:10px;">
                    <strong>💡 التفسير:</strong> ${q.hint || 'لا يوجد تفسير مضاف لهذا السؤال.'}
                </div>
            </div>
        `;
    });

    reportHtml += `</div>`;
    document.getElementById('final-score').innerText = `${score} / ${activeExam.questions.length}`;
    document.getElementById('result-message').innerHTML = reportHtml;
}

// 6. المؤقت
function startTimer(seconds) {
    let t = seconds;
    const display = document.getElementById('timer-display');
    clearInterval(examTimer);
    examTimer = setInterval(() => {
        let m = Math.floor(t / 60);
        let s = t % 60;
        display.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
        if (--t < 0) {
            clearInterval(examTimer);
            alert("انتهى الوقت!");
            finishExam();
        }
    }, 1000);
}
