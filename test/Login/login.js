document.addEventListener('DOMContentLoaded', function() {
    // ปุ่มโชว์/ซ่อนรหัสผ่าน
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    togglePassword.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePassword.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
            togglePassword.classList.add('active');
        } else {
            passwordInput.type = 'password';
            togglePassword.innerHTML = '<i class="fa-solid fa-eye"></i>';
            togglePassword.classList.remove('active');
        }
    });

    // ตรวจสอบข้อมูลฟอร์ม
    document.querySelector('.login-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const alertBox = document.getElementById('loginAlert');
        if (!username || !password) {
            alertBox.textContent = 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน';
            alertBox.style.display = 'block';
            alertBox.style.color = '#ff4d4f';
            return;
        }
        // แสดงแอนิเมชันโหลด
        alertBox.style.display = 'block';
        alertBox.style.color = '#33d9ff';
        alertBox.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังเข้าสู่ระบบ...';
        setTimeout(function() {
            // ตรวจสอบกับ users ใน localStorage
            const storageKey = 'users';
            let users = [];
            try {
                users = JSON.parse(localStorage.getItem(storageKey) || '[]');
                if (!Array.isArray(users)) users = [];
            } catch (e) {
                users = [];
            }

            const matched = users.find(u => u.username === username && u.password === password);

            // ยังคงยอมรับ admin/1234 เป็น fallback สำหรับการทดสอบ
            if ( (username === 'admin' && password === '1234') || matched ) {
                alertBox.style.color = '#1abc9c';
                alertBox.innerHTML = '<i class="fa-solid fa-circle-check"></i> เข้าสู่ระบบสำเร็จ!';
                // ถ้าเลือกจดจำ ให้บันทึก currentUser
                const remember = document.getElementById('rememberMe').checked;
                if (remember) {
                    localStorage.setItem('currentUser', JSON.stringify({ username: username }));
                } else {
                    localStorage.removeItem('currentUser');
                }
                setTimeout(function() {
                    // login is in Login/, index V4 is in Index/ at project root
                    window.location.href = '../Index/index_Version4.html';
                }, 900);
            } else {
                alertBox.style.color = '#ff4d4f';
                alertBox.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
            }
        }, 900);
    });

    // เปลี่ยนหน้าไปยังหน้าสมัครสมาชิก
    document.getElementById('gotoSignup').addEventListener('click', function() {
        // Login is in Login/, signup files are in sighup/ at the project root
        window.location.href = '../sighup/signup.html';
    });
});
