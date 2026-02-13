// exams.js - كود التشغيل والمنطق (المعدل لنظام الفصول)

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
    list.innerHTML = ''; // تنظيف القائمة القديمة
    
    // إظهار واجهة القائمة وإخفاء الباقي
    document.getElementById('view-dashboard').classList.add('hidden');
    document.getElementById('view-list').classList.remove('hidden');
    
    // تحديث العنوان
    const subjectNameAr = getSubjectName(currentSubject);
    document.getElementById('list-title').innerText = "امتحانات " + subjectNameAr;

    // التأكد من وجود بيانات
    if (!subjectData || subjectData.length === 0) {
        list.innerHTML = '<li style="padding:20px; text-align:center; color:#777;">لا توجد امتحانات مسجلة لهذه المادة بعد.</li>';
        return;
    }

    // --- اللوجيك الجديد: الدوران داخل كل "فصل" ---
    subjectData.forEach(chapter => {
        // 1. عرض عنوان الفصل (الباب)
        list.innerHTML += `
            <div style="background:#252525; padding:12px 15px; border-radius:8px; margin-top:25px; margin-bottom:10px; border-right:5px solid var(--accent-color); display:flex; align-items:center;">
                <h3 style="margin:0; font-size:1.1rem; color:#fff;">${chapter.chapterTitle}</h3>
            </div>
        `;

        // 2. عرض الامتحانات داخل هذا الفصل
        if(chapter.exams && chapter.exams.length > 0) {
            chapter.exams.forEach(exam => {
                let isShamel = exam.title.includes('شامل') || exam.title.includes('ثوابت');
                let icon = isShamel ? 'fa-star' : 'fa-file-pen';
                let color = isShamel ? '#ffd700' : 'var(--secondary-color)';
                let borderColor = isShamel ? 'border: 1px solid #ffd700;' : '';
                
                list.innerHTML += `
                <li class="file-item" style="${borderColor} display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; background:var(--card-bg); padding:15px; border-radius:10px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <i class="fa-solid ${icon}" style="color:${color}; font-size:1.3rem;"></i>
                        <div style="display:flex; flex-direction:column;">
                            <span style="font-weight:bold; font-size:1rem; ${isShamel ? 'color:#ffd700;' : 'color:#e0e0e0;'}">${exam.title}</span>
                            <span style="color:#888; font-size:0.8rem; margin-top:4px;">⏳ الزمن: ${exam.time} دقيقة</span>
                        </div>
                    </div>
                    <button class="btn-action" onclick="startExam('${exam.id}')" style="background:var(--accent-color); color:#000; border:none; padding:8px 20px; border-radius:6px; cursor:pointer; font-weight:bold;">ابدأ</button>
                </li>`;
            });
        } else {
            list.innerHTML += `<p style="color:#555; font-size:0.9rem; padding-right:10px;">لا توجد امتحانات في هذا الفصل حالياً.</p>`;
        }
    });
}

// ============================================================
// 2. دالة بدء الامتحان (startExam) - معدلة للبحث داخل الفصول
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
            <h3 style="line-height:1.6; font-size:1.3rem;">
                <span style="color:var(--accent-color)">س${currentQIndex + 1}: </span> 
                ${q.t}
            </h3>
        </div>
        <div style="display:flex; flex-direction:column; gap:12px;">
    `;

    // عرض الاختيارات
    q.opts.forEach((opt, idx) => {
        html += `
            <label class="option-label" style="display:flex; align-items:center; gap:12px; background:#333; padding:15px; border-radius:8px; cursor:pointer; transition:0.2s;">
                <input type="radio" name="ans" value="${idx}" style="accent-color:var(--accent-color); transform:scale(1.3);"> 
                <span style="font-size:1.1rem;">${opt}</span>
            </label>`;
    });

    html += `</div>`;
    container.innerHTML = html;

    // إضافة تأثير عند اختيار إجابة (UX)
    const inputs = container.querySelectorAll('input[type="radio"]');
    inputs.forEach(input => {
        input.addEventListener('change', function() {
            // إزالة اللون من الكل
            container.querySelectorAll('.option-label').forEach(l => {
                l.style.background = '#333';
                l.style.border = 'none';
            });
            // تلوين المختار
            this.parentElement.style.background = '#444';
            this.parentElement.style.border = '1px solid var(--accent-color)';
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

    // حساب الدرجة
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
        if (timer < 60) display.style.color = '#cf6679'; // أحمر
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
    
    if (percent >= 90) { msg = "ماشاء الله! دكتور المستقبل 🥇"; color = "#00ff00"; }
    else if (percent >= 75) { msg = "مستوى ممتاز، عاش يا بطل 🥈"; color = "#aaffaa"; }
    else if (percent >= 50) { msg = "جيد، بس محتاج تركيز أكتر 📚"; color = "orange"; }
    else { msg = "لا تيأس، راجع الدروس وحاول تاني 💪"; color = "#cf6679"; }
    
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

// دالة مساعدة لأسماء المواد
function getSubjectName(code) {
    const names = { 
        'biology': 'الأحياء', 
        'arabic': 'اللغة العربية', 
        'physics': 'الفيزياء', 
        'chemistry': 'الكيمياء', 
        'history': 'التاريخ', 
        'english': 'اللغة الإنجليزية' 
    };
    return names[code] || code;
}
