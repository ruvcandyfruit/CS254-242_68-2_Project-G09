const tasks = [];
const courses = [];
let currentFilter = "all";
let searchQuery = "";
let selectedCourse = "all";
let editingTaskId = null;

// แปลงข้อมูลงานจาก API เป็นรูปแบบที่ใช้ใน frontend
function mapApiTask(t) {
    const courseCode = t.course?.course_code || t.course?.name || 'ทั่วไป';
    const dueType = getDueType(t.deadline);
    const label = t.priority?.label || 'LOW';
    const durationHours = t.duration ? Math.round(t.duration / 60) : null;

    return {
        id: t.id,
        name: t.title,
        description: t.description || '',
        course: courseCode,
        courseId: t.course?.id || null,
        hours: durationHours,
        deadline: t.deadline ? t.deadline.split('T')[0] : null,
        dueLabel: formatDueLabel(t.deadline),
        dueType,
        scoreWeight: t.score_weight,
        score: t.score_weight != null ? `${t.score_weight}% คะแนน` : null,
        emergency: t.emergency,
        priority: label.toLowerCase(),
        priorityLabel: label,
        status: t.status || 'pending',
        done: t.status === 'done',
    };
}

const API_BASE = '';
async function fetchCourses() {
    try {
        const res = await fetch(`${API_BASE}/api/course`, {
            credentials: 'include'
        });
        if (!res.ok) return;
        const data = await res.json();
        const courseArray = Array.isArray(data) ? data : data.courses || [];
        courses.length = 0;
        courseArray.forEach(c => courses.push(c));
    } catch (err) {
        console.warn('ไม่สามารถโหลดวิชาได้', err);
    }
}

async function loadTasks() {
    try {
        const res = await fetch(`${API_BASE}/api/task/prioritized`, {
            method: 'GET',
            credentials: 'include'
        });
        if (!res.ok) throw new Error('API error');
        const taskArray = await res.json();

        tasks.length = 0;
        tasks.push(...taskArray.map(mapApiTask));
        renderTasks();
    } catch (err) {
        console.error('ไม่สามารถโหลดงานจาก API ได้', err);
        renderTasks();
    }
}

function formatDueLabel(dateStr) {
    if (!dateStr) return "—";
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diff = Math.round((due - today) / (1000 * 60 * 60 * 24));
    const thMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const label = `${due.getDate()} ${thMonths[due.getMonth()]}`;
    if (diff < 0) return `เลยกำหนด ${Math.abs(diff)} วัน · ${label}`;
    if (diff === 0) return `วันนี้ · ${label}`;
    return `อีก ${diff} วัน · ${label}`;
}

function getDueType(dateStr) {
    if (!dateStr) return "upcoming";
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diff = Math.round((due - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "overdue";
    if (diff === 0) return "today";
    return "upcoming";
}


function renderTasks() {
    const list = document.getElementById("taskList");
    const filtered = tasks.filter(t => {
        const matchFilter =
            currentFilter === "all" ||
            (currentFilter === "done" && t.done) ||
            (currentFilter === "inprogress" && !t.done && t.dueType !== "overdue") ||
            (currentFilter === "overdue" && !t.done && t.dueType === "overdue");

        const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.course.toLowerCase().includes(searchQuery.toLowerCase());

        const matchCourse = selectedCourse === "all" || t.course === selectedCourse;

        return matchFilter && matchSearch && matchCourse;
    });

    if (filtered.length === 0) {
        list.innerHTML = `<div class="empty-state">ไม่พบงาน</div>`;
        return;
    }

    list.innerHTML = filtered.map(task => `
        <div class="task-card ${task.done ? "done" : ""}" data-id="${task.id}">
            <div class="task-checkbox ${task.done ? "checked" : ""}" onclick="toggleDone(${task.id})"></div>
            <div class="task-body">
                <div class="task-name">${task.name}</div>
                ${task.description ? `<div class="task-desc">${task.description}</div>` : ""}
                <div class="task-meta">
                    <span class="course-badge">${task.course}</span>
                    ${task.hours != null ? `<span class="task-time"><img src="../assets/icons/clock.svg" alt="Clock"> ${task.hours} ชม.</span>` : ""}
                    <span class="task-due ${task.dueType}">${task.dueLabel}</span>
                    ${task.score ? `<span class="task-score">${task.score}</span>` : ""}
                </div>
            </div>
            <span class="priority-badge ${task.priority}">${task.priorityLabel}</span>
            <div class="task-menu">
                <button class="task-menu-btn">
                    <img src="../assets/icons/ellipsis.svg">
                </button>
                <div class="task-dropdown">
                    <button data-action="edit">
                        <img src="../assets/icons/edit.svg"> แก้ไขงาน
                    </button>
                    <button class="danger" data-action="delete">
                        <img src="../assets/icons/trash.svg"> ลบงาน
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

function setActiveTab(filter) {
    currentFilter = filter;
    document.querySelectorAll(".tab").forEach(t => {
        t.classList.toggle("active", t.dataset.filter === filter);
    });
}

async function toggleDone(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
        const res = await fetch(`${API_BASE}/api/task/${id}/status`, {
            method: 'PATCH',
            credentials: 'include',
        });
        if (res.ok) {
            const data = await res.json();
            task.status = data.status;
        } else {
            task.status = task.done ? 'pending' : 'done';
        }
    } catch {
        task.status = task.done ? 'pending' : 'done';
    }
    task.done = task.status === 'done';

    renderTasks();
}

// Task card event (เมนูแก้ไข/ลบ)
document.getElementById("taskList").addEventListener("click", (e) => {
    const menuBtn = e.target.closest(".task-menu-btn");
    const editBtn = e.target.closest('[data-action="edit"]');
    const deleteBtn = e.target.closest('[data-action="delete"]');

    if (menuBtn) {
        e.stopPropagation();
        const dropdown = menuBtn.nextElementSibling;
        const isOpen = dropdown.classList.contains('open');
        document.querySelectorAll('.task-dropdown.open').forEach(d => d.classList.remove('open'));
        if (!isOpen) dropdown.classList.add('open');
    }

    if (editBtn) {
        editBtn.closest('.task-dropdown').classList.remove('open');
        const card = editBtn.closest('.task-card');
        editTask(Number(card.dataset.id));
    }

    if (deleteBtn) {
        deleteBtn.closest('.task-dropdown').classList.remove('open');
        const card = deleteBtn.closest('.task-card');
        deleteTask(Number(card.dataset.id));
    }
});

// Tab filters
document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
        setActiveTab(tab.dataset.filter);
        renderTasks();
    });
});

document.getElementById("searchInput").addEventListener("input", e => {
    searchQuery = e.target.value;
    renderTasks();
});

// เพิ่มงานใหม่
const addtaskCard = document.getElementById("addtask-card");

function populateCourseSelect(selectId, matchCourse) {
    const select = document.getElementById(selectId);

    const opts = courses.map(c => {
        const label = c.course_code || c.name || 'วิชา';
        return { value: String(c.id), label };
    });

    select.innerHTML = opts
        .map(o => `<option value="${o.value}">${o.label}</option>`)
        .join("");

    if (matchCourse) {
        for (const opt of select.options) {
            if (opt.text === matchCourse) { opt.selected = true; break; }
        }
    }
}

function openModal() {
    populateCourseSelect("inputCourse", null);
    document.getElementById("inputName").value = "";
    document.getElementById("inputDescription").value = "";
    document.getElementById("inputHours").value = "";
    document.getElementById("inputScore").value = "";
    document.getElementById("inputDue").value = "";
    document.getElementById("inputUrgent").checked = false;
    addtaskCard.classList.add("open");
    document.getElementById("inputName").focus();
}

function closeModal() {
    addtaskCard.classList.remove("open");
}

// แก้ไขงาน
const editTaskCard = document.getElementById("edit-task-card");

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    editingTaskId = id;

    populateCourseSelect("edit-course", task.course);
    document.getElementById("edit-name").value = task.name;
    document.getElementById("edit-description").value = task.description || "";
    document.getElementById("edit-hours").value = task.hours ?? "";
    document.getElementById("edit-score").value = task.scoreWeight ?? "";
    document.getElementById("edit-due").value = task.deadline || "";
    document.getElementById("edit-urgent").checked = task.emergency || false;

    editTaskCard.classList.add("open");
    document.getElementById("edit-name").focus();
}

function closeEditModal() {
    editTaskCard.classList.remove("open");
    editingTaskId = null;
}

/* ลบงาน */
async function deleteTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
        const res = await fetch(`${API_BASE}/api/task/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!res.ok) throw new Error('API error');
    } catch (err) {
        console.warn('API delete failed', err);
    }

    tasks.splice(tasks.findIndex(t => t.id === id), 1);
    renderTasks();
}

/* บันทึกงานที่แก้ไข */
editTaskCard.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!editingTaskId) return;

    const task = tasks.find(t => t.id === editingTaskId);
    if (!task) return;

    const name = document.getElementById("edit-name").value.trim();
    if (!name) { document.getElementById("edit-name").focus(); return; }

    const courseIdStr = document.getElementById("edit-course").value;
    const courseIdNum = Number(courseIdStr);
    const description = document.getElementById("edit-description").value.trim();
    const hoursRaw = document.getElementById("edit-hours").value;
    const hours = hoursRaw !== "" ? parseInt(hoursRaw, 10) : null;
    const scoreVal = document.getElementById("edit-score").value;
    const dueStr = document.getElementById("edit-due").value;
    const isUrgent = document.getElementById("edit-urgent").checked;

    if (!isNaN(courseIdNum) && courseIdNum > 0) {
        try {
            await fetch(`${API_BASE}/api/task/${editingTaskId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: name,
                    description,
                    deadline: dueStr,
                    duration: hours !== null ? hours * 60 : null,
                    emergency: isUrgent,
                    score_weight: scoreVal ? Number(scoreVal) : task.scoreWeight,
                }),
            });
        } catch (err) {
            console.warn('API update failed', err);
        }
    }

    const courseLabel = courses.length > 0
        ? (courses.find(c => c.id === courseIdNum)?.course_code ||
            courses.find(c => c.id === courseIdNum)?.name || task.course)
        : task.course;

    task.name = name;
    task.description = description;
    task.course = courseLabel;
    task.courseId = courseIdNum || task.courseId;
    task.hours = hours;
    task.deadline = dueStr || task.deadline;
    task.scoreWeight = scoreVal ? Number(scoreVal) : task.scoreWeight;
    task.score = task.scoreWeight ? `${task.scoreWeight}% คะแนน` : null;
    task.emergency = isUrgent;
    task.dueLabel = task.deadline ? formatDueLabel(task.deadline) : task.dueLabel;
    task.dueType = task.deadline ? getDueType(task.deadline) : task.dueType;

    closeEditModal();
    renderTasks();
});

editTaskCard.addEventListener("click", (e) => {
    if (e.target === editTaskCard) closeEditModal();
});

document.getElementById("editModalClose").addEventListener("click", closeEditModal);
document.getElementById("editBtnCancel").addEventListener("click", closeEditModal);


const btnCourseFilter = document.getElementById("btnCourseFilter");
const courseDropdown = document.getElementById("courseDropdown");
const courseFilterLabel = document.getElementById("courseFilterLabel");

function getCourseOptions() {
    return courses.map(c => c.course_code || c.name || 'ทั่วไป');
}

const checkSvg = '<svg class="opt-check" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

function renderCourseDropdown() {
    const options = getCourseOptions();
    const allOpt = `
        <div class="course-option ${selectedCourse === "all" ? "selected" : ""}" data-course="all">
            ทั้งหมด
            ${selectedCourse === "all" ? checkSvg : ""}
        </div>`;
    const courseOpts = [...options].map(code => `
        <div class="course-option ${selectedCourse === code ? "selected" : ""}" data-course="${code}">
            ${code}
            ${selectedCourse === code ? checkSvg : ""}
        </div>`).join("");

    courseDropdown.innerHTML = allOpt + courseOpts;
}

courseDropdown.addEventListener("click", (e) => {
    const opt = e.target.closest(".course-option");
    if (!opt) return;
    selectedCourse = opt.dataset.course;
    courseFilterLabel.textContent = selectedCourse === "all" ? "วิชา" : selectedCourse;
    btnCourseFilter.classList.toggle("active", selectedCourse !== "all");
    closeCourseDropdown();
    renderTasks();
});

function openCourseDropdown() {
    renderCourseDropdown();
    courseDropdown.classList.add("open");
    btnCourseFilter.classList.add("open");
}

function closeCourseDropdown() {
    courseDropdown.classList.remove("open");
    btnCourseFilter.classList.remove("open");
}

btnCourseFilter.addEventListener("click", (e) => {
    e.stopPropagation();
    courseDropdown.classList.contains("open") ? closeCourseDropdown() : openCourseDropdown();
});

// ปิด dropdown เมื่อคลิกข้างนอก
document.addEventListener("click", (e) => {
    if (!e.target.closest('.task-menu')) {
        document.querySelectorAll('.task-dropdown.open').forEach(d => d.classList.remove('open'));
    }
    if (!btnCourseFilter.contains(e.target) && !courseDropdown.contains(e.target)) {
        closeCourseDropdown();
    }
});

document.getElementById("btnAddTask").addEventListener("click", openModal);
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("btnCancel").addEventListener("click", closeModal);

addtaskCard.addEventListener("click", (e) => {
    if (e.target === addtaskCard) closeModal();
});

addtaskCard.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("inputName").value.trim();
    if (!name) {
        document.getElementById("inputName").focus();
        return;
    }
    const courseIdNum = Number(document.getElementById("inputCourse").value);
    const description = document.getElementById("inputDescription").value.trim();
    const hoursRaw = document.getElementById("inputHours").value;
    const hours = hoursRaw !== "" ? parseInt(hoursRaw, 10) : null;
    const scoreVal = document.getElementById("inputScore").value;
    const dueStr = document.getElementById("inputDue").value;
    const isUrgent = document.getElementById("inputUrgent").checked;

    try {
        const res = await fetch(`${API_BASE}/api/task`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: name,
                description,
                deadline: dueStr,
                duration: hours !== null ? hours * 60 : null,
                emergency: isUrgent,
                score_weight: scoreVal ? Number(scoreVal) : null,
                course_id: courseIdNum,
            }),
        });
        if (!res.ok) throw new Error('API error');
    } catch (err) {
        console.error('ไม่สามารถสร้างงานได้', err);
        return;
    }

    closeModal();
    await loadTasks();
});

Promise.all([fetchCourses(), loadTasks()]);
