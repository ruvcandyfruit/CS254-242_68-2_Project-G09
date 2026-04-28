//เปิด/ปิด dropdown
function toggleMenu(btn) {
    const dropdown = btn.nextElementSibling;
    const isOpen = dropdown.classList.contains('open');

    document.querySelectorAll('.course-dropdown.open').forEach(d => d.classList.remove('open'));

    if (!isOpen) dropdown.classList.add('open');
}

//ปิด dropdown เมื่อคลิกนอกการ์ด
document.addEventListener('click', function (e) {
    if (!e.target.closest('.course-menu')) {
        document.querySelectorAll('.course-dropdown.open').forEach(d => d.classList.remove('open'));
    }
});

document.querySelector('.add-course-btn').addEventListener('click', addCourse);
document.getElementById('addCourseClose').addEventListener('click', closeBox);
document.getElementById('addCourseCancel').addEventListener('click', closeBox);
document.getElementById('editCourseClose').addEventListener('click', closeEditBox);
document.getElementById('editCourseCancel').addEventListener('click', closeEditBox);

// Event delegation สำหรับปุ่มในการ์ด
document.querySelector('.courses-list').addEventListener('click', function (e) {
    const menuBtn = e.target.closest('.course-menu-btn');
    const editBtn = e.target.closest('[data-action="edit"]');
    const deleteBtn = e.target.closest('[data-action="delete"]');

    if (menuBtn) toggleMenu(menuBtn);
    if (editBtn) editCourse(editBtn);
    if (deleteBtn) deleteCourse(deleteBtn);
});

function addCourse() {
    document.getElementById('addCourseBox').classList.add('open');
}

function closeBox() {
    document.getElementById('addCourseBox').classList.remove('open');
    document.getElementById('addCourseBox').reset();
}

document.getElementById('addCourseBox').addEventListener('submit', function (e) {
    e.preventDefault();
    saveNewCourse();
});

//สร้างการ์ดวิชาใหม่
function saveNewCourse() {
    const code = document.getElementById('input-code').value.trim();
    const credits = document.getElementById('input-credits').value.trim();
    const name = document.getElementById('input-name').value.trim();

    const prefix = code.replace(/[0-9]/g, '').toUpperCase();

    const card = document.createElement('div');
    card.className = 'course-card';
    card.innerHTML = `
        <div class="course-card-top">
            <div class="course-avatar">${prefix}</div>
            <div class="course-card-top-right">
                <div class="course-menu">
                    <button class="course-menu-btn">
                        <img src="../assets/icons/ellipsis.svg">
                    </button>
                    <div class="course-dropdown">
                        <button data-action="edit">
                            <img src="../assets/icons/edit.svg"> แก้ไขรายวิชา
                        </button>
                        <button class="danger" data-action="delete">
                            <img src="../assets/icons/trash.svg"> ลบรายวิชา
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="course-info">
            <div class="code-credit">
                <span class="course-code">${code}</span>
                <span class="course-credits">${credits} หน่วยกิต</span>
            </div>
            <h2 class="course-name">${name}</h2>
        </div>
        <span class="course-divider"></span>
        <div class="course-footer">
            <span class="course-alltasks">ทั้งหมด 0 งาน</span>
            <span class="course-tasks">งานค้าง 0 งาน</span>
        </div>
    `;

    document.querySelector('.courses-list').appendChild(card);
    closeBox();
}

// แก้ไขรายวิชา
let editingCard = null;

function editCourse(btn) {
    btn.closest('.course-dropdown').classList.remove('open');

    editingCard = btn.closest('.course-card');
    const code = editingCard.querySelector('.course-code').textContent;
    const name = editingCard.querySelector('.course-name').textContent;
    const credits = editingCard.querySelector('.course-credits').textContent.replace(' หน่วยกิต', '');

    document.getElementById('edit-code').value = code;
    document.getElementById('edit-credits').value = credits;
    document.getElementById('edit-name').value = name;

    document.getElementById('editCourseBox').classList.add('open');
}

function closeEditBox() {
    document.getElementById('editCourseBox').classList.remove('open');
    document.getElementById('editCourseBox').reset();
    editingCard = null;
}

document.getElementById('editCourseBox').addEventListener('submit', function (e) {
    e.preventDefault();
    saveEditCourse();
});

//อัปเดทข้อมูลที่แก้ไข
function saveEditCourse() {
    const code = document.getElementById('edit-code').value.trim();
    const credits = document.getElementById('edit-credits').value.trim();
    const name = document.getElementById('edit-name').value.trim();

    if (!editingCard) return;

    const prefix = code.replace(/[0-9]/g, '').toUpperCase();

    editingCard.querySelector('.course-avatar').textContent = prefix;
    editingCard.querySelector('.course-code').textContent = code;
    editingCard.querySelector('.course-name').textContent = name;
    editingCard.querySelector('.course-credits').textContent = `${credits} หน่วยกิต`;

    closeEditBox();
}


// ลบการ์ดรายวิชา
function deleteCourse(btn) {
    btn.closest('.course-dropdown').classList.remove('open');
    const card = btn.closest('.course-card');
    const courseName = card.querySelector('.course-name').textContent;

    //alert box
    Swal.fire({
        icon: 'warning',
        title: 'ยืนยันการลบรายวิชา',
        text: `คุณต้องการลบวิชา ${courseName} ใช่หรือไม่?`,
        showCancelButton: true,
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6c757d',
    }).then((result) => {
        if (result.isConfirmed) {
            card.remove();
            Swal.fire({
                icon: 'success',
                title: 'ลบรายวิชาเรียบร้อย',
                text: `วิชา${courseName} ถูกลบออกแล้ว`,
                showConfirmButton: false,
                timer: 1500
            });
        }
    });
}
