document.addEventListener('DOMContentLoaded', () => {
    const videoPhase = document.getElementById('video-phase');
    const formPhase = document.getElementById('form-phase');
    const video = document.getElementById('opening-video');
    const playBtn = document.getElementById('play-btn-overlay');
    const wishForm = document.getElementById('wish-form');
    const submitBtn = document.getElementById('submit-btn');
    const toast = document.getElementById('toast');
    const hideOnPlayEls = document.querySelectorAll('.hide-on-play');

    // --- Video Phase Logic ---

    // Function to handle play start
    const startVideo = () => {
        if (video.paused) {
            video.play().then(() => {
                // UI updates on success
                videoPhase.classList.remove('paused');
                
                // Hide Play Button & Logos
                hideOnPlayEls.forEach(el => {
                    el.style.opacity = '0';
                });

            }).catch(err => {
                console.log("Video play failed:", err);
            });
        }
    };

    // Click anywhere on video phase to play
    videoPhase.addEventListener('click', startVideo);

    // Ensure video is unskippable
    


        // Immediate switch to form phase when video ends (no transition overlay)
        video.addEventListener('ended', () => {
            // Hide video phase
            videoPhase.classList.remove('active');
            videoPhase.classList.add('hidden');
            // Show form phase
            formPhase.classList.remove('hidden');
            formPhase.classList.add('active');
        });

    // --- Form Phase Logic ---

    // --- Form Phase Logic ---

    // Wish Button Selection
    const wishButtons = document.querySelectorAll('.wish-button');
    const selectedWishInput = document.getElementById('selected-wish');

    wishButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove selection from others
            wishButtons.forEach(b => b.classList.remove('selected'));
            // Add to this one
            btn.classList.add('selected');
            // Set hidden input value
            selectedWishInput.value = btn.getAttribute('data-wish');
        });
    });

    // Direct click trigger for image button
    submitBtn.addEventListener('click', () => {
        wishForm.dispatchEvent(new Event('submit'));
    });

    wishForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('username').value.trim();
        const phone = document.getElementById('userphone').value.trim();
        const message = selectedWishInput.value;

        if (!name || !phone || !message) {
            showToast('请填写完整信息并选择寄语');
            return;
        }

        // Save Data to LocalStorage (Current Standalone Mode)
        saveData({
            name,
            phone,
            message,
            timestamp: new Date().toISOString()
        });

        showToast('新年所愿，必将抵达', '1 月 5 日，期待与您共赏新章');
        wishForm.reset();
        // Reset wish selection
        wishButtons.forEach(b => b.classList.remove('selected'));
        selectedWishInput.value = '';
    });

    // UX: Click on .input-group focuses the input inside
    document.querySelectorAll('.input-group').forEach(group => {
        group.addEventListener('click', () => {
            const input = group.querySelector('input, textarea');
            if (input) input.focus();
        });
    });

    function showToast(title, message) {
    const toast = document.getElementById('toast');
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message.replace('\n', '<br>')}</div>
        </div>
    `;
    toast.classList.add('show');
    
    // For full-screen splash, maybe keep it longer or close on click
    toast.onclick = () => toast.classList.remove('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 6000); 
}

    // --- Data Persistence ---
    function saveData(entry) {
        let submissions = JSON.parse(localStorage.getItem('h5_submissions') || '[]');
        submissions.push(entry);
        localStorage.setItem('h5_submissions', JSON.stringify(submissions));
    }

    // --- Admin Logic ---
    const adminTrigger = document.getElementById('admin-trigger');
    const adminModal = document.getElementById('admin-modal');
    const closeAdmin = document.getElementById('close-admin');
    const downloadBtn = document.getElementById('download-btn');
    const totalCount = document.getElementById('total-count');
    const dataPreview = document.getElementById('data-preview');
    let triggerClicks = 0;

    // Secret Trigger: Click bottom-right corner 5 times quickly
    if(adminTrigger) {
        adminTrigger.addEventListener('click', () => {
            triggerClicks++;
            setTimeout(() => triggerClicks = 0, 2000); // Reset if not fast enough
            if (triggerClicks >= 5) {
                openAdmin();
            }
        });
    }

    // Also support URL param ?admin=true for easy access
    if (new URLSearchParams(window.location.search).has('admin')) {
        openAdmin();
    }

    function openAdmin() {
        const submissions = JSON.parse(localStorage.getItem('h5_submissions') || '[]');
        totalCount.textContent = submissions.length;
        
        // Preview last 5
        dataPreview.innerHTML = submissions.slice(-5).map(s => 
            `[${s.name}] ${s.phone}: ${s.message.substring(0, 10)}...`
        ).join('<br>');

        adminModal.classList.remove('hidden');
    }

    closeAdmin.addEventListener('click', () => {
        adminModal.classList.add('hidden');
    });

    downloadBtn.addEventListener('click', () => {
        const submissions = JSON.parse(localStorage.getItem('h5_submissions') || '[]');
        if (submissions.length === 0) {
            alert('暂无数据');
            return;
        }

        // CSV Export
        const headers = ["姓名", "电话", "寄语", "时间"];
        const csvContent = [
            headers.join(','), 
            ...submissions.map(s => `"${s.name}","${s.phone}","${s.message}","${s.timestamp}"`)
        ].join('\n');

        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "wishes_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});
