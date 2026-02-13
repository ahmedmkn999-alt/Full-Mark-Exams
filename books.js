// books.js

const booksDB = {
    'biology': [
        { name: 'كتاب الوزارة - أحياء 2026', type: 'PDF' },
        { name: 'كتاب الامتحان - شرح', type: 'PDF' },
        { name: 'كتاب التفوق - أسئلة', type: 'PDF' }
    ],
    'arabic': [
        { name: 'كتاب الأضواء - لغة عربية', type: 'PDF' },
        { name: 'كتاب الوزارة - النحو والصرف', type: 'PDF' }
    ],
    // ضيف باقي المواد هنا...
};

function loadBooks() {
    const list = document.getElementById('list-items');
    list.innerHTML = '';
    
    document.getElementById('view-dashboard').classList.add('hidden');
    document.getElementById('view-list').classList.remove('hidden');
    document.getElementById('list-title').innerText = "الكتب المتاحة للتحميل";

    const data = booksDB[currentSubject];
    if(data) {
        data.forEach(book => {
            list.innerHTML += `
            <li class="file-item">
                <div><i class="fa-solid fa-book" style="margin-left:10px"></i> ${book.name}</div>
                <button class="btn-action" onclick="alert('جاري فتح الكتاب...')">عرض</button>
            </li>`;
        });
    } else {
        list.innerHTML = '<li>لا توجد كتب مضافة حالياً.</li>';
    }
}
