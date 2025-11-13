document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('topupForm').addEventListener('submit', function(e) {
        e.preventDefault();

        // รับค่าจากฟอร์ม
        const gameSelect = document.getElementById('game');
        const game = gameSelect.value;
        const gameIcon = gameSelect.options[gameSelect.selectedIndex].getAttribute('data-icon') || '';
        const uid = document.getElementById('uid').value;
        const amount = document.getElementById('amount').value;
        const payment = document.getElementById('payment').value;

        // แสดงผลลัพธ์
        const resultDiv = document.getElementById('result');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <strong><i class="fa-solid fa-circle-check"></i> ข้อมูลการเติมเกม</strong><br>
            เกม: <span style="color:#5bffea">${gameIcon} ${game}</span><br>
            UID: <span style="color:#5bffea">${uid}</span><br>
            จำนวนเงินที่เติม: <span style="color:#33d9ff">${amount} บาท</span><br>
            ช่องทางรับโอน: <span style="color:#5bffea">${payment}</span><br>
            <br>
            <span style="color:#33d9ff;">*โปรดโอนเงินตามช่องทางที่เลือก แล้วรอรับเพชร/ไอเท็มภายใน 10 นาที*</span>
        `;
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('topupForm');
    const resultEl = document.getElementById('result');

    // create history container if not present
    let historyEl = document.getElementById('topup-history');
    if (!historyEl) {
        historyEl = document.createElement('div');
        historyEl.id = 'topup-history';
        historyEl.style.marginTop = '20px';
        historyEl.innerHTML = '<h3 style="margin-bottom:8px;">ประวัติการเติม (History)</h3>';
        document.querySelector('.container').appendChild(historyEl);
    }

    function loadTopups() {
        try {
            return JSON.parse(localStorage.getItem('topups') || '[]');
        } catch {
            return [];
        }
    }

    function saveTopups(list) {
        localStorage.setItem('topups', JSON.stringify(list));
    }

    function renderHistory() {
        const list = loadTopups();
        const wrapper = document.createElement('div');
        wrapper.style.maxHeight = '240px';
        wrapper.style.overflow = 'auto';
        wrapper.style.padding = '8px';
        wrapper.style.background = 'rgba(255,255,255,0.04)';
        wrapper.style.borderRadius = '8px';
        wrapper.innerHTML = list.length === 0
            ? '<div style="opacity:0.8">ยังไม่มีการเติม</div>'
            : list.map(item => {
                const time = new Date(item.time).toLocaleString('th-TH');
                return `<div style="padding:8px;border-bottom:1px solid rgba(255,255,255,0.04);">
            <strong style="display:block">${item.game} — ${item.amount} บาท</strong>
            <small style="display:block;opacity:0.85">${item.uid} • ${item.payment} • ${time}</small>
          </div>`;
            }).join('');
        historyEl.querySelectorAll(':scope > div').forEach(n => n.remove());
        historyEl.appendChild(wrapper);
    }
    function showResult(message, success = true) {
        resultEl.style.display = 'block';
        resultEl.style.padding = '12px';
        resultEl.style.borderRadius = '8px';
        resultEl.style.marginTop = '12px';
        resultEl.style.background = success ? 'linear-gradient(90deg,#3aa55b,#2ea04a)' : '#b23a3a';
        resultEl.style.color = 'white';
        resultEl.innerText = message;
        setTimeout(() => { resultEl.style.display = 'none'; }, 6000);
    }
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const game = document.getElementById('game').value;
        const uid = document.getElementById('uid').value.trim();
        const amount = Number(document.getElementById('amount').value);
        const payment = document.getElementById('payment').value;

        if (!game || !uid || !amount || !payment) {
            showResult('กรุณากรอกข้อมูลให้ครบ', false);
            return;
        }

        const topups = loadTopups();
        const order = {
            id: Date.now(),
            game,
            uid,
            amount,
            payment,
            time: new Date().toISOString()
        };
        topups.unshift(order); // newest first
        saveTopups(topups);
        renderHistory();

        showResult(`คำสั่งซื้อถูกบันทึก: ${game} • ${amount} บาท`);
        form.reset();
    });

    // initial render
    renderHistory();
});

