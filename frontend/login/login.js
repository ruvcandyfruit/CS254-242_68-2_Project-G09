const form = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');
const togglePwBtn = document.getElementById('eye-btn');
const eyeIcon = togglePwBtn.querySelector('svg');
const loginBtn = document.getElementById('login-btn');

// Toggle password visibility eye icon
const eyeOpen = `
  <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M2.062 12.348a1 1 0 0 1 0-.696a10.75 10.75 0 0 1 19.876 0a1 1 0 0 1 0 .696a10.75 10.75 0 0 1-19.876 0" />
  <circle fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" cx="12" cy="12" r="3" />
`;
const eyeClosed = `
  <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575a1 1 0 0 1 0 .696a10.8 10.8 0 0 1-1.444 2.49m-6.41-.679a3 3 0 0 1-4.242-4.242" />
  <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151a1 1 0 0 1 0-.696a10.75 10.75 0 0 1 4.446-5.143M2 2l20 20" />
`;

togglePwBtn.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  eyeIcon.innerHTML = isPassword ? eyeOpen : eyeClosed;
});

// Function validate Email
function validateEmail() {
  const emailValue = emailInput.value.trim();
  console.log("Email Input:", emailValue);

  const emailPattern = /^.+@gmail\.com$/;

  if (!emailPattern.test(emailValue)) {
    emailError.textContent = "กรุณากรอกอีเมลในรูปแบบ 'example@gmail.com'";
    console.log("Validation Failed");
    return false;
  } else {
    emailError.textContent = "";
    console.log("Validation Passed");
    return true;
  }
}

function validatePassword(value) {
  if (!value) return 'กรุณากรอกรหัสผ่าน';
  if (value.length < 4) return 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร';
  return '';
}

function setError(element, message) {
  element.textContent = message;
}

emailInput.addEventListener('input', validateEmail);
passwordInput.addEventListener('input', () => { passwordError.textContent = validatePassword(passwordInput.value); });

// Form submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const passwordVal = passwordInput.value;
  const passwordErr = validatePassword(passwordVal);
  passwordError.textContent = passwordErr;

  const emailOk = validateEmail();
  if (!emailOk || passwordErr) return;

  const emailVal = emailInput.value.trim();

  loginBtn.disabled = true;
  loginBtn.textContent = 'กำลังเข้าสู่ระบบ…';

  try {
    const res = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: emailVal,
        password: passwordVal,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      if (document.getElementById('remember').checked && data.user_id) {
        localStorage.setItem('user_id', data.user_id);
      } else if (data.user_id) {
        sessionStorage.setItem('user_id', data.user_id);
      }
      window.location.href = '../dashboard/dashboard.html';
    } else {
      setError(passwordError, data.error || data.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  } catch (error) {
    setError(passwordError, 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    console.error('Login request failed', error);
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'เข้าสู่ระบบ';
  }
});