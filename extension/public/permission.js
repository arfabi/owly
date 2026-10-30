const btn = document.getElementById('btnGrant');
const statusBox = document.getElementById('statusBox');

async function requestMic() {
  if (!btn || !statusBox) return;
  btn.disabled = true;
  btn.innerText = 'Meminta izin mikrofon ke Chrome...';

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop the tracks immediately after permission is granted
    stream.getTracks().forEach(track => track.stop());

    statusBox.className = 'status-box status-success';
    statusBox.style.display = 'block';
    statusBox.innerHTML = '✅ <strong>Izin mikrofon berhasil diberikan!</strong><br><span style="font-size:12px; font-weight:400; color:#047857">Tab ini akan otomatis ditutup dalam 2 detik. Silakan kembali ke Side Panel Savvy.AI.</span>';
    btn.style.display = 'none';

    setTimeout(() => {
      window.close();
    }, 2200);
  } catch (err) {
    console.warn('Microphone permission request error:', err);
    btn.disabled = false;
    btn.innerText = 'Klik untuk Beri Izin Mikrofon';
    statusBox.className = 'status-box status-error';
    statusBox.style.display = 'block';
    statusBox.innerHTML = '⚠️ <strong>Izin mikrofon belum aktif atau dibatalkan.</strong><br><span style="font-size:12px; font-weight:400; color:#B91C1C">Klik tombol di atas, lalu pilih <strong>"Allow"</strong> / <strong>"Izinkan"</strong> pada popup peramban di kiri atas URL bar.</span>';
  }
}

if (btn) {
  btn.addEventListener('click', requestMic);
}

// Auto-trigger prompt immediately when page loads
window.addEventListener('DOMContentLoaded', () => {
  requestMic();
});
