// exams.js - كود التشغيل والمنطق (المعدل)

// متغيرات عامة
let activeExam = null;
let currentQIndex = 0;
let userScore = 0;
let examTimer;

// التأكد من تحميل قاعدة البيانات
window.examsDB = window.examsDB || {};

// ============================================================
// 1. دالة عرض قائمة الامتحانات (loadExamsList)
// ============================================================
function loadExamsList() {
    // جلب بيانات المادة الحالية
    const subjectData = window.examsDB[currentSubject];
    const list = document.getElementById('list-items');
    list.innerHTML = '';
    
    // إظهار واجهة القائمة وإخفاء الباقي
    document.getElementById('view-dashboard').classList.add('hidden');
    document.getElementById('view-list').classList.remove('hidden');
    document.getElementById('list-title').innerText = "امتحانات " + getSubjectName(currentSubject);

    // التأكد من وجود بيانات
    if (!subjectData || subjectData.length === 0) {
        list.innerHTML = '<li style="padding:20px; text-align:center">لا توجد امتحانات مسجلة لهذه المادة بعد.</li>';
        return;
    }

    // الدوران داخل كل "فصل" أو "باب"
    subjectData.forEach(chapter => {
        // 1. عرض عنوان الفصل
        list.innerHTML += `
            <div style="background:#252525; padding:10px 15px; border-radius:8px; margin-top:25px; margin-bottom:10px; border-right:5px solid var(--accent-color); display:flex; align-items:center;">
                <h3 style="margin:0; font-size:1.1rem; color:#fff;">${chapter.chapterTitle}</h3>
            </div>
        `;

        // 2. عرض الامتحانات داخل هذا الفصل
        chapter.exams.forEach(exam => {
            let isShamel = exam.title.includes('شامل') || exam.title.includes('ثوابت');
            let icon = isShamel ? 'fa-star' : 'fa-pen-to-square';
            let color = isShamel ? 'gold' : 'var(--secondary-color)';
            
            list.innerHTML += `
            <li class="file-item" style="${isShamel ? 'border: 1px solid gold;' : ''}">
                <div style="display:flex; align-items:center; gap:10px;">
                    <i class="fa-solid ${icon}" style="color:${color}; font-size:1.2rem;"></i>
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-weight:bold; ${isShamel ? 'color:gold;' : ''}">${exam.title}</span>
                        <span style="color:#888; font-size:0.8rem;">⏳ الزمن: ${exam.time} دقيقة</span>
                    </div>
                </div>
                <button class="btn-action" onclick="startExam('${exam.id}')">ابدأ الآن</button>
            </li>`;
        });
    });
}

// ============================================================
// 2. دالة بدء الامتحان (startExam) - دي اللي كانت عامله المشكلة
// ============================================================
function startExam(examId) {
    const subjectData = window.examsDB[currentSubject];
    let foundExam = null;

    // البحث عن الامتحان داخل الفصول (Nested Search)
    if (Array.isArray(subjectData)) {
        for (let chapter of subjectData) {
            // ندور جوه كل فصل
            const match = chapter.exams.find(e => e.id === examId);
            if (match) {
                foundExam = match;
                break; // لقيناه خلاص نوقف تدوير
            }
        }
    }

    if (!foundExam) {
        alert("عذراً، حدث خطأ في تحميل بيانات الامتحان.");
        console.error("Exam ID not found:", examId);
        return;
    }

    // إعداد الامتحان
    activeExam = foundExam;
    currentQIndex = 0;
    userScore = 0;

    // التبديل لشاشة الامتحان
    document.getElementById('view-list').classList.add('hidden');
    document.getElementById('view-exam').classList.remove('hidden');
    
    // تحديث العنوان
    document.getElementById('exam-name-header').innerText = activeExam.title;
    
    // تشغيل الأسئلة والوقت
    renderQuestion();
    startTimer(activeExam.time * 60); // تحويل الدقائق لثواني
}

// ============================================================
// 3. دالة عرض السؤال (renderQuestion)
// ============================================================
function renderQuestion() {
    const container = document.getElementById('question-container');
    
    if (currentQIndex >= activeExam.questions.length) {
        finishExam();
        return;
    }

    const q = activeExam.questions[currentQIndex];
    
    // تصميم السؤال
    let html = `
        <div style="margin-bottom:20px;">
            <h3 style="line-height:1.6; font-size:1.2rem;">
                <span style="color:var(--accent-color)">س${currentQIndex + 1}: </span> 
                ${q.t}
            </h3>
        </div>
        <div style="display:flex; flex-direction:column; gap:10px;">
    `;

    // عرض الاختيارات
    q.opts.forEach((opt, idx) => {
        html += `
            <label class="option-label" style="display:flex; align-items:center; gap:10px; background:#333; padding:15px; border-radius:8px; cursor:pointer; transition:0.2s;">
                <input type="radio" name="ans" value="${idx}" style="accent-color:var(--accent-color); transform:scale(1.2);"> 
                <span>${opt}</span>
            </label>`;
    });

    html += `</div>`;
    container.innerHTML = html;

    // إضافة تأثير عند اختيار إجابة
    const inputs = container.querySelectorAll('input[type="radio"]');
    inputs.forEach(input => {
        input.addEventListener('change', function() {
            // إزالة اللون من الكل
            container.querySelectorAll('.option-label').forEach(l => l.style.background = '#333');
            // تلوين المختار
            this.parentElement.style.background = '#444';
            this.parentElement.style.borderColor = 'var(--accent-color)';
        });
    });
}

// ============================================================
// 4. دالة السؤال التالي (nextQuestion)
// ============================================================
function nextQuestion() {
    const selected = document.querySelector('input[name="ans"]:checked');
    
    if (!selected) {
        alert('من فضلك اختر إجابة أولاً!');
        return;
    }

    // التأكد من الإجابة (مقارنة رقمية)
    if (parseInt(selected.value) === activeExam.questions[currentQIndex].ans) {
        userScore++;
    }

    currentQIndex++;
    renderQuestion();
}

// ============================================================
// 5. المؤقت (Timer)
// ============================================================
function startTimer(duration) {
    let timer = duration;
    const display = document.getElementById('timer-display');
    
    clearInterval(examTimer);
    
    examTimer = setInterval(function () {
        let minutes = parseInt(timer / 60, 10);
        let seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        // تلوين العداد بالأحمر لما الوقت يقرب يخلص
        if (timer < 60) display.style.color = 'red';
        else display.style.color = 'var(--accent-color)';

        if (--timer < 0) {
            clearInterval(examTimer);
            alert("انتهى الوقت!");
            finishExam();
        }
    }, 1000);
}

// ============================================================
// 6. إنهاء الامتحان (finishExam)
// ============================================================
function finishExam() {
    clearInterval(examTimer);
    
    document.getElementById('view-exam').classList.add('hidden');
    document.getElementById('view-result').classList.remove('hidden');
    
    const total = activeExam.questions.length;
    const percent = (userScore / total) * 100;
    
    document.getElementById('final-score').innerText = `${userScore} / ${total}`;
    
    let msg = "";
    let color = "";
    
    if (percent >= 90) { msg = "عبقري! أداء ممتاز جداً 🥇"; color = "#00ff00"; }
    else if (percent >= 75) { msg = "ممتاز، استمر في التقدم 🥈"; color = "#aaffaa"; }
    else if (percent >= 50) { msg = "جيد، لكن تحتاج للمراجعة 📚"; color = "orange"; }
    else { msg = "لا تيأس، راجع الدروس وحاول مرة أخرى 💪"; color = "red"; }
    
    const msgElement = document.getElementById('result-message');
    msgElement.innerText = msg;
    msgElement.style.color = color;
}

function exitExam() {
    if(confirm("هل أنت متأكد من الخروج؟ سيتم إلغاء الامتحان.")) {
        clearInterval(examTimer);
        goBackToDash();
    }
}
