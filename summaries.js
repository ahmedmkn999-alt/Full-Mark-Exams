// summaries.js

const summariesDB = {
    'biology': [
        { name: 'كبسولة التكاثر في صفحتين', type: 'IMG' },
        { name: 'مخطط الهرمونات الذهني', type: 'PDF' },
        { name: 'توقعات ليلة الامتحان', type: 'PDF' }
    ],
    'physics': [
        { name: 'قوانين الفيزياء الحديثة', type: 'PDF' },
        { name: 'أهم 50 تعليل', type: 'PDF' }
    ],
    // ضيف باقي المواد هنا...
};

function loadSummaries() {
    const list = document.getElementById('list-items');
    list.innerHTML = '';
    
    document.getElementById('view-dashboard').classList.add('hidden');
    document.getElementById('view-list').classList.remove('hidden');
    document.getElementById('list-title').innerText = "ملخصات ومراجعات";

    const data = summariesDB[currentSubject];
    if(data) {
        data.forEach(sum => {
            list.innerHTML += `
            <li class="file-item">
                <div><i class="fa-solid fa-file-pen" style="margin-left:10px"></i> ${sum.name}</div>
                <button class="btn-action" onclick="alert('جاري التحميل...')">تحميل</button>
            </li>`;
        });
    } else {
        list.innerHTML = '<li>لا توجد ملخصات مضافة حالياً.</li>';
    }
}
