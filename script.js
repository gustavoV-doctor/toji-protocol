// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker registered:', reg.scope))
        .catch(err => console.log('SW registration failed:', err));
}

document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const checkboxes = document.querySelectorAll('.custom-checkbox input[type="checkbox"]');
    const progressText = document.getElementById('progress-text');
    const progressBar = document.getElementById('progress-bar');

    // Tab Switching Logic
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');

            // Recalculate progress for the active tab (optional: or we can keep global progress)
            // Let's keep it global for the whole protocol
            updateProgress();
        });
    });

    // Progress Logic
    function updateProgress() {
        const totalChecked = Array.from(checkboxes).filter(cb => cb.checked).length;
        const totalCheckboxes = checkboxes.length;

        let percentage = 0;
        if (totalCheckboxes > 0) {
            percentage = Math.round((totalChecked / totalCheckboxes) * 100);
        }

        progressText.textContent = `${percentage}% Concluído`;
        progressBar.style.width = `${percentage}%`;

        // Add a glow effect when reaching 100%
        if (percentage === 100) {
            progressBar.style.boxShadow = '0 0 20px rgba(255, 215, 0, 1), 0 0 40px rgba(107, 33, 168, 0.8)';
            progressText.style.color = 'var(--color-gold)';
            progressText.style.textShadow = 'var(--gold-glow)';
            progressText.textContent = 'RESTRIÇÃO CELESTIAL ALCANÇADA';
        } else {
            progressBar.style.boxShadow = 'var(--purple-glow)';
            progressText.style.color = 'var(--color-gold)';
            progressText.style.textShadow = 'none';
        }
    }

    checkboxes.forEach(cb => {
        cb.addEventListener('change', updateProgress);
    });

    // Initial update
    updateProgress();
});
