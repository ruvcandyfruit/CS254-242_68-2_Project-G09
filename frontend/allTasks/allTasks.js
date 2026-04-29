/*mock ต้องลบออก*/
const tasks = [
    {
        id: 1,
        name: "Quiz เตรียมสอบ Linear Regression",
        course: "CS412",
        courseColor: "#8b5cf6",
        hours: 2,
        dueLabel: "เลยกำหนด 1 วัน · 28 เม.ย.",
        dueType: "overdue",
        score: "10% คะแนน",
        priority: "medium",
        priorityLabel: "ปานกลาง",
        status: "inprogress",
        done: false,
    },
    {
        id: 2,
        name: "การบ้าน Integration techniques",
        course: "MA212",
        courseColor: "#22c55e",
        hours: 2,
        dueLabel: "วันนี้ · 29 เม.ย.",
        dueType: "today",
        score: "3% คะแนน",
        priority: "medium",
        priorityLabel: "ปานกลาง",
        status: "inprogress",
        done: false,
    },
];

let currentFilter = "all";
let searchQuery = "";
let selectedCourse = "all";

function clockIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>`;
}

function renderTasks() {
    const list = document.getElementById("taskList");
    const filtered = tasks.filter(t => {
        const matchFilter =
            currentFilter === "all" ||
            (currentFilter === "done" && t.done) ||
            (currentFilter === "inprogress" && !t.done && t.status === "inprogress") ||
            (currentFilter === "urgent" && (t.priority === "high" || t.dueType === "overdue"));

        const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.course.toLowerCase().includes(searchQuery.toLowerCase());

        const matchCourse = selectedCourse === "all" || t.course === selectedCourse;

        return matchFilter && matchSearch && matchCourse;
    });

    if (filtered.length === 0) {
        list.innerHTML = `<div class="empty-state">ไม่พบงานที่ตรงกับเงื่อนไข</div>`;
        return;
    }

    list.innerHTML = filtered.map(task => `
        <div class="task-card ${task.done ? "done" : ""}" data-id="${task.id}">
            <div class="task-checkbox ${task.done ? "checked" : ""}" onclick="toggleDone(${task.id})"></div>
            <div class="task-body">
                <div class="task-name">${task.name}</div>
                <div class="task-meta">
                    <span class="course-badge">
                        <span class="course-dot" style="background-color:${task.courseColor}"></span>
                        ${task.course}
                    </span>
                    ${task.hours != null ? `<span class="task-time">${clockIcon()} ${task.hours} ชม.</span>` : ""}
                    <span class="task-due ${task.dueType}">${task.dueLabel}</span>
                    ${task.score ? `<span class="task-score">${task.score}</span>` : ""}
                </div>
            </div>
            <span class="priority-badge ${task.priority}">${task.priorityLabel}</span>
        </div>
    `).join("");
}

function toggleDone(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.done = !task.done;
        task.status = task.done ? "done" : "inprogress";
        renderTasks();
    }
}

document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentFilter = tab.dataset.filter;
        renderTasks();
    });
});

document.getElementById("searchInput").addEventListener("input", e => {
    searchQuery = e.target.value;
    renderTasks();
});

// Add task card
const addtaskCard = document.getElementById("addtask-card");

function populateCourseSelect() {
    const select = document.getElementById("inputCourse");
    if (courses.length === 0) {
        select.innerHTML = Object.entries(courseColors)
            .map(([code, color]) => `<option value="${code}|${color}">${code}</option>`)
            .join("");
        return;
    }
    select.innerHTML = courses
        .map(c => `<option value="${c.code}|${c.color}">${c.code}${c.name ? " — " + c.name : ""}</option>`)
        .join("");
}

function openModal() {
    populateCourseSelect();
    document.getElementById("inputName").value = "";
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

const courseColors = {
    CS254: "#6366f1",
    CS361: "#3b82f6",
    CS412: "#8b5cf6",
    MA212: "#22c55e",
};

// Course filter dropdown
const btnCourseFilter = document.getElementById("btnCourseFilter");
const courseDropdown = document.getElementById("courseDropdown");
const courseFilterLabel = document.getElementById("courseFilterLabel");

function getCourseOptions() {
    const seen = new Map();
    tasks.forEach(t => {
        if (!seen.has(t.course)) seen.set(t.course, t.courseColor);
    });
    return seen;
}

function renderCourseDropdown() {
    const options = getCourseOptions();
    const allOpt = `
        <div class="course-option ${selectedCourse === "all" ? "selected" : ""}" data-course="all">
            <span class="opt-dot" style="background:#9ca3af"></span>
            ทั้งหมด
            ${selectedCourse === "all" ? '<svg class="opt-check" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ""}
        </div>`;
    const courseOpts = [...options.entries()].map(([code, color]) => `
        <div class="course-option ${selectedCourse === code ? "selected" : ""}" data-course="${code}">
            <span class="opt-dot" style="background:${color}"></span>
            ${code}
            ${selectedCourse === code ? '<svg class="opt-check" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ""}
        </div>`).join("");

    courseDropdown.innerHTML = allOpt + courseOpts;

    courseDropdown.querySelectorAll(".course-option").forEach(opt => {
        opt.addEventListener("click", () => {
            selectedCourse = opt.dataset.course;
            courseFilterLabel.textContent = selectedCourse === "all" ? "วิชา" : selectedCourse;
            btnCourseFilter.classList.toggle("active", selectedCourse !== "all");
            closeCourseDropdown();
            renderTasks();
        });
    });
}

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

document.addEventListener("click", (e) => {
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

addtaskCard.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("inputName").value.trim();
    if (!name) {
        document.getElementById("inputName").focus();
        return;
    }
    const courseRaw = document.getElementById("inputCourse").value;
    const [courseCode, courseColor] = courseRaw.split("|");
    const hoursRaw = document.getElementById("inputHours").value;
    const hours = hoursRaw !== "" ? parseInt(hoursRaw) : null;
    const scoreVal = document.getElementById("inputScore").value;
    const dueStr = document.getElementById("inputDue").value;
    const isUrgent = document.getElementById("inputUrgent").checked;

    tasks.push({
        id: Date.now(),
        name,
        course: courseCode,
        courseColor: courseColor || "#6b7280",
        hours,
        dueLabel: formatDueLabel(dueStr),
        dueType: getDueType(dueStr),
        score: scoreVal ? `${scoreVal}% คะแนน` : null,
        priority: isUrgent ? "high" : "general",
        priorityLabel: isUrgent ? "ด่วน" : "ทั่วไป",
        status: "inprogress",
        done: false,
    });

    closeModal();
    renderTasks();
});

renderTasks();
