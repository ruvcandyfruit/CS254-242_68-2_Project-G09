const courseList = document.querySelector('.courses-list');
const addCourseForm = document.getElementById('addCourseBox');
const editCourseForm = document.getElementById('editCourseBox');
const addCourseBtn = document.querySelector('.add-course-btn');
const addCourseClose = document.getElementById('addCourseClose');
const addCourseCancel = document.getElementById('addCourseCancel');
const editCourseClose = document.getElementById('editCourseClose');
const editCourseCancel = document.getElementById('editCourseCancel');

let editingCourseId = null;
let editingCard = null;

// เปิด/ปิด dropdown ของแต่ละ card
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

addCourseBtn.addEventListener('click', openAddBox);
addCourseClose.addEventListener('click', closeAddBox);
addCourseCancel.addEventListener('click', closeAddBox);
editCourseClose.addEventListener('click', closeEditBox);
editCourseCancel.addEventListener('click', closeEditBox);

courseList.addEventListener('click', function (e) {
    const menuBtn = e.target.closest('.course-menu-btn');
    const editBtn = e.target.closest('[data-action="edit"]');
    const deleteBtn = e.target.closest('[data-action="delete"]');

    if (menuBtn) toggleMenu(menuBtn);
    if (editBtn) editCourse(editBtn);
    if (deleteBtn) deleteCourse(deleteBtn);
});

// submit form เพิ่มวิชา
addCourseForm.addEventListener('submit', function (e) {
    e.preventDefault();
    saveNewCourse();
});

// submit form แก้ไขวิชา
editCourseForm.addEventListener('submit', function (e) {
    e.preventDefault();
    saveEditCourse();
});

function openAddBox() {
    addCourseForm.classList.add('open');
}

function closeAddBox() {
    addCourseForm.classList.remove('open');
    addCourseForm.reset();
}

function closeEditBox() {
    editCourseForm.classList.remove('open');
    editCourseForm.reset();
    editingCourseId = null;
    editingCard = null;
}

function createCourseCard(course) {
    const prefix = (course.course_code || course.name || '')
        .replace(/[0-9]/g, '')
        .toUpperCase()
        .slice(0, 2);

    const progress = course.progress ?? 0;

    //สร้าง card ของแต่ละวิชา
    const card = document.createElement('div');
    card.className = 'course-card';
    card.dataset.id = course.id;
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
                <span class="course-code">${course.course_code || ''}</span>
                <span class="course-credits">${course.course_weight} หน่วยกิต</span>
            </div>
            <h2 class="course-name">${course.name}</h2>
        </div>
        <span class="course-divider"></span>
        <div class="course-footer">
            <span class="course-alltasks">งานเสร็จแล้ว ${progress}</span>
            <span class="course-pending">งานค้าง ${course.pending_task_count ?? 0} งาน</span>
        </div>
    `;
    return card;
}

/*Api*/
const API_BASE = 'http://127.0.0.1:5000';
async function loadCourses() {
    courseList.innerHTML = '';
    try {
        const res = await fetch(`${API_BASE}/api/course`, {
            credentials: 'include',
        });
        const data = await res.json();

        if (!res.ok) {
            console.error('Load courses failed', data);
            courseList.innerHTML = '<p class="empty-message">ไม่สามารถโหลดรายวิชาได้ในขณะนี้</p>';
            return;
        }

        const courses = Array.isArray(data) ? data : data.courses || [];
        if (!courses.length) {
            courseList.innerHTML = '<p class="empty-message">ยังไม่มีรายวิชา</p>';
            return;
        }

        courses.forEach(course => {
            courseList.appendChild(createCourseCard(course));
        });
    } catch (error) {
        console.error('Fetch error', error);
        courseList.innerHTML = '<p class="empty-message">เกิดข้อผิดพลาดในการเชื่อมต่อ</p>';
    }
}

/*Api สร้างรายวิชาใหม่*/
async function saveNewCourse() {
    const code = document.getElementById('input-code').value.trim();
    const credits = document.getElementById('input-credits').value.trim();
    const name = document.getElementById('input-name').value.trim();

    const payload = {
        course_code: code,
        course_weight: Number(credits),
        name,
    };

    try {
        const res = await fetch(`${API_BASE}/api/course`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!res.ok) {
            return;
        }

        closeAddBox();
        await loadCourses();
        Swal.fire('สำเร็จ', 'สร้างรายวิชาเรียบร้อยแล้ว', 'success');
    } catch (error) {
        console.error('Save course failed', error);
    }
}

function editCourse(btn) {
    btn.closest('.course-dropdown').classList.remove('open');

    editingCard = btn.closest('.course-card');
    editingCourseId = editingCard.dataset.id;

    // ดึงข้อมูลเดิมใส่ form
    document.getElementById('edit-code').value =
        editingCard.querySelector('.course-code').textContent;

    document.getElementById('edit-name').value =
        editingCard.querySelector('.course-name').textContent;

    document.getElementById('edit-credits').value =
        editingCard.querySelector('.course-credits').textContent.replace(' หน่วยกิต', '');

    editCourseForm.classList.add('open');
}

async function saveEditCourse() {
    if (!editingCourseId || !editingCard) return;

    const code = document.getElementById('edit-code').value.trim();
    const credits = document.getElementById('edit-credits').value.trim();
    const name = document.getElementById('edit-name').value.trim();


    const payload = {
        course_code: code,
        course_weight: Number(credits),
        name,
    };

    try {
        const res = await fetch(`${API_BASE}/api/course/${editingCourseId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!res.ok) {
            return;
        }

        editingCard.querySelector('.course-code').textContent = code;
        editingCard.querySelector('.course-name').textContent = name;
        editingCard.querySelector('.course-credits').textContent = `${credits} หน่วยกิต`;
        editingCard.querySelector('.course-avatar').textContent = code.replace(/[0-9]/g, '').toUpperCase().slice(0, 2);

        closeEditBox();
        Swal.fire('สำเร็จ', 'แก้ไขรายวิชาเรียบร้อยแล้ว', 'success');
    } catch (error) {
        console.error('Edit course failed', error);
    }
}

async function deleteCourse(btn) {
    btn.closest('.course-dropdown').classList.remove('open');
    const card = btn.closest('.course-card');
    const course_Id = card.dataset.id;
    const courseName = card.querySelector('.course-name').textContent;

    const result = await Swal.fire({
        icon: 'warning',
        title: 'ยืนยันการลบรายวิชา',
        text: `คุณต้องการลบวิชา ${courseName} ใช่หรือไม่?`,
        showCancelButton: true,
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6c757d',
    });

    if (!result.isConfirmed) return;

    try {
        const res = await fetch(`${API_BASE}/api/course/${course_Id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        const data = await res.json();

        if (!res.ok) {
            return;
        }

        card.remove();
        Swal.fire({
            icon: 'success',
            title: 'ลบรายวิชาเรียบร้อย',
            text: `วิชา ${courseName} ถูกลบออกแล้ว`,
            showConfirmButton: false,
            timer: 1500
        });

        if (!courseList.querySelector('.course-card')) {
            courseList.innerHTML = '<p class="empty-message">ยังไม่มีรายวิชา</p>';
        }
    } catch (error) {
        console.error('Delete course failed', error);
    }
}

loadCourses();
