const form = document.getElementById('register-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirm');
const submitBtn = form.querySelector('button[type="submit"]');

const API_BASE = '';

function showError(input, message) {
  let err = input.nextElementSibling;

  if (!err || !err.classList.contains('field-error')) {
    err = document.createElement('span');
    err.className = 'field-error';
    input.after(err);
  }

  err.textContent = message;
}

function clearError(input) {
  const err = input.nextElementSibling;

  if (err && err.classList.contains('field-error')) {
    err.textContent = '';
  }
}

function validate() {
  let ok = true;

  if (!nameInput.value.trim()) {
    showError(nameInput, 'กรุณากรอกชื่อ');
    ok = false;
  } else {
    clearError(nameInput);
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(emailInput.value.trim())) {
    showError(emailInput, 'กรุณากรอกอีเมลให้ถูกต้อง');
    ok = false;
  } else {
    clearError(emailInput);
  }

  if (!passwordInput.value.trim()) {
    showError(passwordInput, 'กรุณากรอกรหัสผ่าน');
    ok = false;
  } else {
    clearError(passwordInput);
  }

  if (confirmInput.value !== passwordInput.value) {
    showError(confirmInput, 'รหัสผ่านไม่ตรงกัน');
    ok = false;
  } else {
    clearError(confirmInput);
  }

  return ok;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validate()) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'กำลังสมัคร…';

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value,
      }),
    });

    let data = {};

    try {
      data = await res.json();
    } catch {
      data = {
        error: 'Backend error: ดู error สีแดงใน terminal Flask',
      };
    }

    if (res.ok) {
      window.location.href = '/login/login.html';
      return;
    }

    showError(emailInput, data.error || 'สมัครสมาชิกไม่สำเร็จ');
  } catch (err) {
    showError(emailInput, 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    console.error('Register failed', err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'สมัครสมาชิก';
  }
});