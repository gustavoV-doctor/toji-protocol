// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker registered:', reg.scope))
        .catch(err => console.log('SW registration failed:', err));
}

document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const checkboxes = document.querySelectorAll('.custom-checkbox input[type="checkbox"]');
    const progressText = document.getElementById('progress-text');
    const progressBar = document.getElementById('progress-bar');

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');

            updateProgress();
        });
    });

    // Progress
    function updateProgress() {
        const totalChecked = Array.from(checkboxes).filter(cb => cb.checked).length;
        const totalCheckboxes = checkboxes.length;

        let percentage = 0;
        if (totalCheckboxes > 0) {
            percentage = Math.round((totalChecked / totalCheckboxes) * 100);
        }

        progressText.textContent = `${percentage}%`;
        progressBar.style.width = `${percentage}%`;

        if (percentage === 100) {
            progressBar.style.boxShadow = '0 0 20px rgba(255, 215, 0, 1), 0 0 40px rgba(107, 33, 168, 0.8)';
            progressText.style.textShadow = 'var(--gold-glow)';
            progressText.textContent = '天与呪縛 達成';
        } else {
            progressBar.style.boxShadow = 'var(--purple-glow)';
            progressText.style.textShadow = 'none';
        }
    }

    checkboxes.forEach(cb => {
        cb.addEventListener('change', updateProgress);
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.philosophy, .toji-code, .toji-gallery, .code-item, .gallery-item').forEach(el => {
        el.classList.add('scroll-animate');
        observer.observe(el);
    });

    updateProgress();
});
