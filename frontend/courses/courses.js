function toggleMenu(btn) {
    const dropdown = btn.nextElementSibling;
    const isOpen = dropdown.classList.contains('open');

    document.querySelectorAll('.course-dropdown.open').forEach(d => d.classList.remove('open'));

    if (!isOpen) dropdown.classList.add('open');
}

document.addEventListener('click', function (e) {
    if (!e.target.closest('.course-menu')) {
        document.querySelectorAll('.course-dropdown.open').forEach(d => d.classList.remove('open'));
    }
});

function addCourse() {
    document.getElementById('addCourseBox').classList.add('open');
}

function closeBox() {
    document.getElementById('addCourseBox').classList.remove('open');
    document.getElementById('input-code').value = '';
    document.getElementById('input-credits').value = '';
    document.getElementById('input-name').value = '';
}

function saveNewCourse() {
    const code = document.getElementById('input-code').value.trim();
    const credits = document.getElementById('input-credits').value.trim();
    const name = document.getElementById('input-name').value.trim();

    if (!code || !credits || !name) return;

    const prefix = code.replace(/[0-9]/g, '').toUpperCase();

    const card = document.createElement('div');
    card.className = 'course-card';
    card.innerHTML = `
        <div class="course-card-top">
            <div class="course-avatar">${prefix}</div>
            <div class="course-card-top-right">
                <span class="course-credits">${credits} หน่วยกิต</span>
                <div class="course-menu">
                    <button class="course-menu-btn" onclick="toggleMenu(this)">
                        <img src="../assets/icons/ellipsis.svg">
                    </button>
                    <div class="course-dropdown">
                        <button onclick="editCourse(this)">
                            <img src="../assets/icons/edit.svg"> แก้ไขรายวิชา
                        </button>
                        <button class="danger" onclick="deleteCourse(this)">
                            <img src="../assets/icons/trash.svg"> ลบรายวิชา
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="course-info">
            <span class="course-code">${code}</span>
            <h2 class="course-name">${name}</h2>
        </div>
        <span class="course-divider"></span>
        <div class="course-footer">
            <span class=".course-alltasks">ทั้งหมด 0 งาน</span>
            <span class="course-tasks">ดูงานค้าง 0 งาน</span>
        </div>
    `;

    document.querySelector('.courses-list').appendChild(card);
    closeBox();
}

// ลบการ์ดรายวิชา
function deleteCourse(btn) {
    btn.closest('.course-dropdown').classList.remove('open');
    const card = btn.closest('.course-card');
    card.remove();
}
