document.addEventListener('DOMContentLoaded', function() {
    // ปุ่มโชว์/ซ่อนรหัสผ่าน
    const passwordInput = document.getElementById('signup-password');
    const togglePassword = document.getElementById('toggleSignupPassword');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.getElementById('strengthText');
    const pwChecklist = document.getElementById('pwChecklist');

    const checks = {
        length: pwChecklist.querySelector('[data-check="length"]'),
        lower: pwChecklist.querySelector('[data-check="lower"]'),
        upper: pwChecklist.querySelector('[data-check="upper"]'),
        number: pwChecklist.querySelector('[data-check="number"]'),
        symbol: pwChecklist.querySelector('[data-check="symbol"]')
    };

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

    // strength meter logic (scores and Thai labels)
    function scorePassword(p) {
        if (!p) return 0;
        let total = 0;
        const len = p.length;
        if (len >= 8) total += 2;
        else if (len >= 5) total += 1;
        // scan characters to detect categories
        let hasLower = false;
        let hasUpper = false;
        let hasNumber = false;
        let hasSymbol = false;
        for (let i = 0; i < len; i++) {
            const ch = p.charCodeAt(i);
            if (ch >= 97 && ch <= 122) hasLower = true; // a-z
            else if (ch >= 65 && ch <= 90) hasUpper = true; // A-Z
            else if (ch >= 48 && ch <= 57) hasNumber = true; // 0-9
            else hasSymbol = true;
        }
        if (hasLower) total++;
        if (hasUpper) total++;
        if (hasNumber) total++;
        if (hasSymbol) total++;
        return Math.min(total, 6);
    }

    function updateChecklist(p) {
        const hasLength = p.length >= 8;
        const hasLower = /[a-z]/.test(p);
        const hasUpper = /[A-Z]/.test(p);
        const hasNumber = /[0-9]/.test(p);
        const hasSymbol = /[^A-Za-z0-9]/.test(p);

        function apply(el, ok) {
            el.classList.toggle('valid', ok);
            el.classList.toggle('invalid', !ok);
            // add dot markup if missing
            if (!el.querySelector('.dot')) {
                const d = document.createElement('span'); d.className = 'dot'; el.insertBefore(d, el.firstChild);
            }
            el.querySelector('.dot').textContent = ok ? '✓' : '•';
        }

        apply(checks.length, hasLength);
        apply(checks.lower, hasLower);
        apply(checks.upper, hasUpper);
        apply(checks.number, hasNumber);
        apply(checks.symbol, hasSymbol);

        return hasLength && hasLower && hasUpper && hasNumber && hasSymbol;
    }

    function updateStrength(pw) {
        const s = scorePassword(pw);
        // map score (0..6) to percent
        const pct = Math.round((s / 6) * 100);
        strengthBar.style.width = pct + '%';
        let txt = '';
        if (s <= 1) { txt = 'อ่อนมาก'; strengthBar.style.background = 'linear-gradient(90deg,#ff4d4f,#ff9a4d)'; }
        else if (s <= 3) { txt = 'ค่อนข้างอ่อน'; strengthBar.style.background = 'linear-gradient(90deg,#ff9a4d,#ffd54d)'; }
        else if (s <= 4) { txt = 'ดี'; strengthBar.style.background = 'linear-gradient(90deg,#ffd54d,#2fe3ff)'; }
        else { txt = 'แข็งแรง'; strengthBar.style.background = 'linear-gradient(90deg,#4bd0a7,#2fe3ff)'; }
        strengthText.textContent = txt;
        return s;
    }

    passwordInput.addEventListener('input', function() {
        updateStrength(passwordInput.value);
        updateChecklist(passwordInput.value);
    });

    // ตรวจสอบข้อมูลฟอร์ม
    document.querySelector('.signup-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('signup-username').value.trim();
        const password = document.getElementById('signup-password').value.trim();
        const confirm = document.getElementById('signup-confirm').value.trim();
        const alertBox = document.getElementById('signupAlert');

        // checklist: require all true
        const checklistOk = updateChecklist(password);
        if (!checklistOk) {
            alertBox.textContent = 'รหัสผ่านต้องเป็นไปตามเงื่อนไขทั้งหมด';
            alertBox.style.display = 'block';
            alertBox.style.color = '#ff4d4f';
            return;
        }

        // check strength threshold
        const strengthScore = updateStrength(password);
        if (strengthScore < 3) {
            alertBox.textContent = 'รหัสผ่านควรมีความแข็งแรงอย่างน้อยระดับ ดี';
            alertBox.style.display = 'block';
            alertBox.style.color = '#ff4d4f';
            return;
        }

        if (!username || !password || !confirm) {
            alertBox.textContent = 'กรุณากรอกข้อมูลให้ครบถ้วน';
            alertBox.style.display = 'block';
            alertBox.style.color = '#ff4d4f';
            return;
        }
        if (password.length < 4) {
            alertBox.textContent = 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร';
            alertBox.style.display = 'block';
            alertBox.style.color = '#ff4d4f';
            return;
        }
        if (password !== confirm) {
            alertBox.textContent = 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน';
            alertBox.style.display = 'block';
            alertBox.style.color = '#ff4d4f';
            return;
        }

        // ตรวจสอบว่าชื่อผู้ใช้ซ้ำหรือไม่ โดยเก็บ users ใน localStorage
        const storageKey = 'users';
        let users = [];
        try {
            users = JSON.parse(localStorage.getItem(storageKey) || '[]');
            if (!Array.isArray(users)) users = [];
        } catch (e) {
            users = [];
        }
        const exists = users.some(u => u.username === username);
        if (exists) {
            alertBox.textContent = 'มีชื่อผู้ใช้นี้อยู่แล้ว กรุณาเลือกชื่ออื่น';
            alertBox.style.display = 'block';
            alertBox.style.color = '#ff4d4f';
            return;
        }

        // แสดงแอนิเมชันโหลด
        alertBox.style.display = 'block';
        alertBox.style.color = '#33d9ff';
        alertBox.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังสมัครสมาชิก...';
        setTimeout(function() {
            // บันทึกผู้ใช้ใหม่ลง localStorage (หมายเหตุ: ในโปรเจกต์ตัวอย่างนี้รหัสผ่านเก็บเป็น plain-text)
            users.push({ username: username, password: password });
            localStorage.setItem(storageKey, JSON.stringify(users));

            // แสดงผลสำเร็จ
            alertBox.style.color = '#1abc9c';
            alertBox.innerHTML = '<i class="fa-solid fa-circle-check"></i> สมัครสมาชิกสำเร็จ!';
            setTimeout(function() {
                // signup page is in sighup/, login is in Login/
                window.location.href = '../Login/login.html';
            }, 900);
        }, 900);
    });

    document.getElementById('gotoLogin').addEventListener('click', function() {
        window.location.href = '../Login/login.html';
    });
});
