/**
 * Background Video Block
 * Premium View JS
 **/
document.addEventListener('DOMContentLoaded', () => {
    const blocks = document.querySelectorAll('.wp-block-folioblocks-background-video-block');
    // ---- Premium: Disable right-click (if enabled) ----
    if (block.dataset.disableRightClick === 'true') {
        document.addEventListener('contextmenu', (e) => e.preventDefault(), { passive: false });
    }
});