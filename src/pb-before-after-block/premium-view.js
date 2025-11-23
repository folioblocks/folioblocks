/**
 * Before & After Block
 * Premium View JS
 **/
document.addEventListener('DOMContentLoaded', () => { 
  const containers = document.querySelectorAll('.pb-before-after-container');
  if (!containers.length) return;

  containers.forEach(container => {
    if (container.dataset.lazyLoad === 'true' && !container.dataset.lazyInitialized) {
      const images = container.querySelectorAll('img[src]');
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
              }
              obs.unobserve(img);
            }
          });
        });
        images.forEach(img => {
          if (img.dataset.src) {
            observer.observe(img);
          }
        });
        container.dataset.lazyInitialized = 'true';
      } else {
        // Fallback: load images immediately if IntersectionObserver not supported
        images.forEach(img => {
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
        });
        container.dataset.lazyInitialized = 'true';
      }
    }

    if (container.dataset.disableRightClick === 'true' && !container.dataset.rightClickDisabled) {
      container.addEventListener('contextmenu', e => e.preventDefault());
      container.dataset.rightClickDisabled = 'true';
    }
  });
});