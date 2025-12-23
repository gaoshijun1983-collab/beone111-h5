document.addEventListener('DOMContentLoaded', () => {
    const videoPhase = document.getElementById('video-phase');
    const formPhase = document.getElementById('form-phase');
    const video = document.getElementById('opening-video');
    const playOverlay = document.getElementById('play-overlay');
    const wishForm = document.getElementById('wish-form');
    const wishButtons = document.querySelectorAll('.wish-button');
    const selectedWishInput = document.getElementById('selected-wish');
    const toast = document.getElementById('toast');

    // --- Phase 1: Video Handling ---
    playOverlay.addEventListener('click', () => {
        playOverlay.classList.add('hidden');
        video.play().catch(err => {
            console.error("Video play failed:", err);
            transitionToForm();
        });
    });

    video.addEventListener('ended', transitionToForm);

    function transitionToForm() {
        videoPhase.classList.add('hidden');
        videoPhase.classList.remove('active');
        formPhase.classList.remove('hidden');
        formPhase.classList.add('active');
    }

    // --- Phase 2: Form Handling ---
    wishButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            wishButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedWishInput.value = btn.getAttribute('data-wish');
        });
    });

    // Handle image-based submit button
    document.getElementById('submit-btn').addEventListener('click', () => {
        wishForm.requestSubmit(); // Better than .submit() as it triggers validation
    });

    wishForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('username').value.trim();
        const phone = document.getElementById('userphone').value.trim();
        const message = selectedWishInput.value;

        if (!name || !phone || !message) {
            alert('请填写完整信息并选择寄语');
            return;
        }

        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, message })
            });

            const result = await response.json();

            if (result.success) {
                showToast('新年所愿，必将抵达', '1 月 5 日，期待与您共赏新章');
                wishForm.reset();
                wishButtons.forEach(b => b.classList.remove('selected'));
                selectedWishInput.value = '';
            } else {
                alert('提交失败: ' + (result.error || '未知错误'));
            }
        } catch (err) {
            console.error('Submit error:', err);
            alert('提交错误，请检查网络');
        }
    });

    function showToast(title, message) {
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message.replace('\n', '<br>')}</div>
            </div>
        `;
        toast.classList.add('show');
        
        toast.onclick = () => toast.classList.remove('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 6000);
    }

});
