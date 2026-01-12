// Key used in localStorage
const STORAGE_KEY = "tuition_students";

let students = [];

// Load data on start
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    students = JSON.parse(saved);
  }
  renderTable();

  const form = document.getElementById("studentForm");
  form.addEventListener("submit", onSubmitStudentForm);
});

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function onSubmitStudentForm(e) {
  e.preventDefault();
  const idField = document.getElementById("studentId");
  const name = document.getElementById("name").value.trim();
  const classLevel = document.getElementById("classLevel").value.trim();
  const subjects = document.getElementById("subjects").value.trim();
  const routine = document.getElementById("routine").value.trim();
  const notes = document.getElementById("notes").value.trim();

  if (!name) {
    alert("Name is required");
    return;
  }

  if (idField.value) {
    // Edit existing
    const id = idField.value;
    const idx = students.findIndex(s => s.id === id);
    if (idx !== -1) {
      students[idx].name = name;
      students[idx].classLevel = classLevel;
      students[idx].subjects = subjects;
      students[idx].routine = routine;
      students[idx].notes = notes;
    }
  } else {
    // New student
    const newStudent = {
      id: Date.now().toString(),
      name,
      classLevel,
      subjects,
      routine,
      notes,
      attendance: [] // dates as strings: "2026-01-12"
    };
    students.push(newStudent);
  }

  saveToStorage();
  renderTable();
  resetForm();
}

function resetForm() {
  document.getElementById("studentId").value = "";
  document.getElementById("name").value = "";
  document.getElementById("classLevel").value = "";
  document.getElementById("subjects").value = "";
  document.getElementById("routine").value = "";
  document.getElementById("notes").value = "";
}

function renderTable() {
  const tbody = document.getElementById("studentsTableBody");
  tbody.innerHTML = "";

  students.forEach(student => {
    const tr = document.createElement("tr");

    const totalDays = student.attendance ? student.attendance.length : 0;

    tr.innerHTML = `
      <td>${escapeHtml(student.name)}</td>
      <td>${escapeHtml(student.classLevel || "")}</td>
      <td>${escapeHtml(student.subjects || "")}</td>
      <td>${escapeHtml(student.routine || "")}</td>
      <td>${totalDays}</td>
      <td>
        <button class="small-btn" onclick="editStudent('${student.id}')">Edit</button>
        <button class="small-btn" onclick="deleteStudent('${student.id}')">Delete</button>
        <button class="small-btn" onclick="markToday('${student.id}')">+ Day</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// Simple HTML escaping
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function editStudent(id) {
  const student = students.find(s => s.id === id);
  if (!student) return;

  document.getElementById("studentId").value = student.id;
  document.getElementById("name").value = student.name;
  document.getElementById("classLevel").value = student.classLevel || "";
  document.getElementById("subjects").value = student.subjects || "";
  document.getElementById("routine").value = student.routine || "";
  document.getElementById("notes").value = student.notes || "";
}

function deleteStudent(id) {
  if (!confirm("Delete this student?")) return;
  students = students.filter(s => s.id !== id);
  saveToStorage();
  renderTable();
}

function markToday(id) {
  const student = students.find(s => s.id === id);
  if (!student) return;

  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  if (!student.attendance) {
    student.attendance = [];
  }
  // Avoid duplicate for same day
  if (!student.attendance.includes(today)) {
    student.attendance.push(today);
  } else {
    if (!confirm("Already marked today. Add again?")) return;
    student.attendance.push(today);
  }

  saveToStorage();
  renderTable();
}
