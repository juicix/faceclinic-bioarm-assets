if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.intersectionRatio < 0.45) continue;
      entry.target.classList.add('is-tracing');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.45 });

  for (const result of document.querySelectorAll('.fc-men-method__result')) {
    observer.observe(result);
  }
}
